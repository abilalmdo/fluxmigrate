<?php
/**
 * Newsletter opt-in endpoint for fluxmigrate.com (task FM-108).
 *
 * Double opt-in: a valid request stores the address as "pending" and mails a confirmation link;
 * subscribe-confirm.php turns it into "confirmed". Addresses live in a SQLite file outside the web
 * root (see _form/subscribers.php). Same protections as the contact form: captcha, honeypot, fill
 * time, Origin check, strikes and lockout, rate limits.
 *
 * The answer never reveals whether an address is already on the list.
 *
 * Two response modes, like contact-submit.php: browser post -> 303 redirect, fetch() with
 * Accept: application/json -> JSON.
 */

ini_set('display_errors', '0');
ini_set('log_errors', '1');

const FM_SUB_THANKS = '/subscription.html#pending';
const FM_SUB_RETRY = '/subscription.html#error';
const FM_SUB_MIN_FILL_MS = 2500;
const FM_SUB_IP_LIMIT = 5;        // sign-ups per IP per hour
const FM_SUB_GLOBAL_LIMIT = 100;  // sign-ups from everyone per hour (each one sends a mail)
const FM_SUB_RESEND_AFTER = 86400; // do not mail the same pending address again within a day
const FM_SUB_MAX_BODY = 8192;

$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function fm_sub_finish($ok, $code, $status = 200)
{
    global $wantsJson;
    $messages = array(
        'invalid' => 'Please enter a valid email address.',
        'consent' => 'Please tick the box to confirm you agree to receive our emails.',
        'rate' => 'Too many attempts from your connection. Please try again later.',
        'captcha' => 'That answer was not right. Please answer the new question and try again.',
        'expired' => 'The security question expired. Please answer the new question and try again.',
        'send' => "We couldn't sign you up just now. Please try again in a few minutes.",
    );
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    if ($wantsJson) {
        http_response_code($ok ? 200 : $status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(array(
            'ok' => $ok,
            'code' => $ok ? 'ok' : $code,
            'redirect' => $ok ? FM_SUB_THANKS : null,
            'message' => $ok ? null : (isset($messages[$code]) ? $messages[$code] : $messages['send']),
        ));
        exit;
    }
    header('Location: ' . ($ok ? FM_SUB_THANKS : FM_SUB_RETRY), true, 303);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Method not allowed';
    exit;
}

require __DIR__ . '/_form/guard.php';
require __DIR__ . '/_form/mailer.php';
require __DIR__ . '/_form/subscribers.php';

$config = fm_load_config();
if ($config === null) {
    fm_sub_finish(false, 'send', 500);
}

fm_cleanup();
$client = fm_client_key($config);
if (fm_is_locked_out($client)) {
    fm_sub_finish(false, 'rate', 429);
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > FM_SUB_MAX_BODY) {
    fm_strike($client);
    fm_sub_finish(false, 'invalid', 413);
}

$allowedHosts = isset($config['allowed_hosts']) && is_array($config['allowed_hosts'])
    ? $config['allowed_hosts']
    : array('fluxmigrate.com', 'www.fluxmigrate.com');
$from = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : (isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '');
if ($from !== '' && !in_array(strtolower((string) parse_url($from, PHP_URL_HOST)), $allowedHosts, true)) {
    fm_strike($client);
    fm_sub_finish(false, 'send', 403);
}

// Bots: filled honeypot or a form "filled" too fast. Look successful, store nothing, count a strike.
$filledMs = isset($_POST['ts']) && ctype_digit((string) $_POST['ts']) ? (int) round(microtime(true) * 1000) - (int) $_POST['ts'] : null;
if ((isset($_POST['hp_url']) && $_POST['hp_url'] !== '') || ($filledMs !== null && $filledMs < FM_SUB_MIN_FILL_MS)) {
    fm_strike($client);
    fm_sub_finish(true, 'ok');
}

// --- validation ------------------------------------------------------------------------------

$email = isset($_POST['email']) && is_string($_POST['email']) ? trim(preg_replace('/[\x00-\x1F\x7F]/', '', $_POST['email'])) : '';
if ($email === '' || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fm_sub_finish(false, 'invalid', 422);
}
if (!isset($_POST['consent']) || !in_array($_POST['consent'], array('1', 'on'), true)) {
    fm_sub_finish(false, 'consent', 422);
}
$interests = fm_all_interests();   // no choice offered: a subscriber gets blog posts, the newsletter and service updates
$sourcePage = isset($_POST['page']) && is_string($_POST['page']) && preg_match('~^/[A-Za-z0-9._/-]{0,100}$~', $_POST['page']) ? $_POST['page'] : '';

// --- captcha ---------------------------------------------------------------------------------

$captcha = fm_captcha_check($config, isset($_POST['captcha_token']) ? $_POST['captcha_token'] : null, isset($_POST['captcha']) ? $_POST['captcha'] : null);
if ($captcha === 'expired') {
    fm_sub_finish(false, 'expired', 422);
}
if ($captcha === 'missing') {
    fm_sub_finish(false, 'captcha', 422);
}
if ($captcha === 'fast') {
    fm_strike($client);
    fm_sub_finish(true, 'ok');
}
if ($captcha !== 'ok') {
    fm_strike($client);
    fm_sub_finish(false, 'captcha', 422);
}

// --- rate limit: every new sign-up sends a mail, so this also stops using us to mail-bomb someone ---

if (fm_window('sub-ip-' . $client, 3600, FM_SUB_IP_LIMIT, true) || fm_window('sub-all', 3600, FM_SUB_GLOBAL_LIMIT, true)) {
    fm_sub_finish(false, 'rate', 429);
}

// --- store -----------------------------------------------------------------------------------

$db = fm_subscribers_db($config);
if ($db === null) {
    fm_sub_finish(false, 'send', 500);
}

$sendConfirmation = false;
$isNewSignup = false;   // true for a first sign-up and for a return after unsubscribing, false for a repeat while pending
try {
    $stmt = $db->prepare('SELECT * FROM subscribers WHERE email = ?');
    $stmt->execute(array($email));
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $now = fm_now();
    $ipHash = substr(hash_hmac('sha256', isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '', (string) $config['password']), 0, 24);

    if (!$row) {
        $db->prepare('INSERT INTO subscribers (email, interests, status, consent_text, source_page, ip_hash, confirm_token, unsub_token, created_at)
                      VALUES (?, ?, \'pending\', ?, ?, ?, ?, ?, ?)')
           ->execute(array($email, $interests, FM_CONSENT_TEXT, $sourcePage, $ipHash, fm_new_token(), fm_new_token(), $now));
        $sendConfirmation = true;
        $isNewSignup = true;
    } elseif ($row['status'] === 'unsubscribed') {
        // Came back: a fresh confirmation, fresh tokens, fresh consent record.
        $db->prepare('UPDATE subscribers SET status = \'pending\', interests = ?, consent_text = ?, source_page = ?, ip_hash = ?,
                      confirm_token = ?, unsub_token = ?, created_at = ?, confirm_sent_at = NULL, confirmed_at = NULL, unsubscribed_at = NULL
                      WHERE id = ?')
           ->execute(array($interests, FM_CONSENT_TEXT, $sourcePage, $ipHash, fm_new_token(), fm_new_token(), $now, $row['id']));
        $sendConfirmation = true;
        $isNewSignup = true;
    } elseif ($row['status'] === 'pending') {
        // Still waiting for the click: mail again, but not more than once a day.
        $last = $row['confirm_sent_at'] ? strtotime($row['confirm_sent_at'] . ' UTC') : 0;
        $sendConfirmation = time() - $last > FM_SUB_RESEND_AFTER;
    }
    // already confirmed: nothing to do, and the visitor is not told

    if ($sendConfirmation) {
        $stmt->execute(array($email));
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        // The address is saved from this moment, confirmed or not. Tell the team now, so it is in the inbox
        // even if the visitor never opens the confirmation link. Best effort. Unconfirmed addresses must not be
        // sent newsletters; only rows with status 'confirmed' may be.
        if ($isNewSignup) {
            fm_send_mail(
                $config,
                $config['to'],
                'New sign-up (not yet confirmed): ' . $email,
                "A visitor signed up for FluxMigrate emails and has not confirmed yet.\n\nEmail: $email\nWill receive, once confirmed: " . fm_interest_labels($row['interests'])
                . "\nPage: " . ($sourcePage !== '' ? $sourcePage : '(unknown)') . "\nSigned up: " . fm_now() . " UTC\n\n"
                . "The address is saved. Do not send newsletters to it until its status is 'confirmed' (you will get a second notice).\n"
            );
        }
        $base = fm_site_url($config);
        $body = "Please confirm your subscription to FluxMigrate emails.\n\n"
            . "Confirm: $base/subscribe-confirm.php?t=" . $row['confirm_token'] . "\n\n"
            . 'You will receive: ' . fm_interest_labels($row['interests']) . "\n\n"
            . "If you did not ask for this, ignore this email. Nothing happens until the link is opened.\n"
            . "Never want these emails: $base/subscribe-unsubscribe.php?t=" . $row['unsub_token'] . "\n\n"
            . "FluxMigrate\n";
        if (!fm_send_mail($config, $email, 'Confirm your FluxMigrate subscription', $body)) {
            fm_sub_finish(false, 'send', 502);   // stays pending with no confirm_sent_at, so a retry mails again
        }
        $db->prepare('UPDATE subscribers SET confirm_sent_at = ? WHERE id = ?')->execute(array(fm_now(), $row['id']));
    }
} catch (Throwable $e) {
    error_log('[subscribe] database error: ' . $e->getMessage());
    fm_sub_finish(false, 'send', 500);
}

fm_sub_finish(true, 'ok');
