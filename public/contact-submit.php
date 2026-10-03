<?php
/**
 * Contact form endpoint for fluxmigrate.com (task FM-106).
 *
 * The site is static; this is the only server code. It validates the enquiry, mails it to the
 * FluxMigrate inbox over authenticated SMTP (PHPMailer, bundled in _form/), and sends the visitor
 * to /thank-you.html. Nothing leaves the host except that one mail.
 *
 * Credentials are never in the repository. CI writes mail-config.php next to this file from GitHub
 * Actions secrets (tools/write-mail-config.mjs). .htaccess denies web access to that file.
 *
 * Two response modes, same validation:
 *   - browser form post  -> 303 redirect (thank-you page, or back to the contact page on error)
 *   - fetch() with Accept: application/json -> JSON, so the page keeps what the visitor typed
 *
 * Written for PHP 7.4+ (Namecheap shared hosting runs 8.x).
 */

ini_set('display_errors', '0');
ini_set('log_errors', '1');

const FM_THANKS_URL = '/thank-you.html';
const FM_CONTACT_URL = '/contact.html';
const FM_MIN_FILL_MS = 2500;   // a person needs longer than this to fill the form
const FM_IP_LIMIT = 5;         // submissions per IP per hour
const FM_GLOBAL_LIMIT = 60;    // submissions from everyone per hour
const FM_MAX_BODY = 65536;     // bytes; the longest legitimate enquiry is about 6 KB

$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function fm_finish($ok, $code, $status = 200)
{
    global $wantsJson;
    $messages = array(
        'invalid' => 'Please fill in your name, company and a valid email address.',
        'rate' => 'Too many messages from your connection. Please try again later, or email info@fluxmigrate.com.',
        'captcha' => 'That answer was not right. Please answer the new question and try again.',
        'expired' => 'The security question expired. Please answer the new question and try again.',
        'spam' => 'Your message looks like it contains links or promotional content. Please remove them and try again, or email info@fluxmigrate.com.',
        'send' => "We couldn't send your message just now. Please try again in a few minutes, or email info@fluxmigrate.com.",
    );
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    if ($wantsJson) {
        http_response_code($ok ? 200 : $status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(array(
            'ok' => $ok,
            'code' => $ok ? 'ok' : $code,
            'redirect' => $ok ? FM_THANKS_URL : null,
            'message' => $ok ? null : (isset($messages[$code]) ? $messages[$code] : $messages['send']),
        ));
        exit;
    }
    header('Location: ' . ($ok ? FM_THANKS_URL : FM_CONTACT_URL . '?error=' . rawurlencode($code) . '#form-status'), true, 303);
    exit;
}

function fm_field($key, $max, $multiline = false)
{
    $v = isset($_POST[$key]) && is_string($_POST[$key]) ? $_POST[$key] : '';
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $v);
    $v = $multiline ? str_replace("\r\n", "\n", $v) : preg_replace('/\s+/', ' ', $v);
    $v = trim($v);
    return mb_strlen($v, 'UTF-8') > $max ? false : $v;   // false = too long
}

// --- request checks --------------------------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Method not allowed';
    exit;
}

require __DIR__ . '/_form/guard.php';

$configFile = __DIR__ . '/mail-config.php';
$config = is_file($configFile) ? require $configFile : null;
if (!is_array($config) || empty($config['host']) || empty($config['user']) || empty($config['password']) || empty($config['to'])) {
    error_log('[contact-submit] mail-config.php is missing or incomplete');
    fm_finish(false, 'send', 500);
}

fm_cleanup();
$client = fm_client_key($config);

// A client with three strikes in the last hour is locked out until the oldest one ages away.
if (fm_is_locked_out($client)) {
    fm_finish(false, 'rate', 429);
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > FM_MAX_BODY) {
    fm_strike($client);
    fm_finish(false, 'invalid', 413);
}

// Browsers send Origin (or Referer) on a form post; refuse one that names another site.
$allowedHosts = isset($config['allowed_hosts']) && is_array($config['allowed_hosts'])
    ? $config['allowed_hosts']
    : array('fluxmigrate.com', 'www.fluxmigrate.com');
$from = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : (isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '');
if ($from !== '' && !in_array(strtolower((string) parse_url($from, PHP_URL_HOST)), $allowedHosts, true)) {
    fm_strike($client);
    fm_finish(false, 'send', 403);
}

// Bots: a filled honeypot, or a form submitted faster than a person could fill it. Answer as if it
// worked so the bot learns nothing, send nothing, and count a strike.
$filledMs = isset($_POST['ts']) && ctype_digit((string) $_POST['ts']) ? (int) round(microtime(true) * 1000) - (int) $_POST['ts'] : null;
if ((isset($_POST['hp_url']) && $_POST['hp_url'] !== '') || ($filledMs !== null && $filledMs < FM_MIN_FILL_MS)) {
    fm_strike($client);
    fm_finish(true, 'ok');
}

// --- validation ------------------------------------------------------------------------------

$name = fm_field('name', 100);
$company = fm_field('company', 150);
$email = fm_field('email', 254);
$role = fm_field('role', 100);
$need = fm_field('need', 100);
$env = fm_field('env', 300);
$count = fm_field('count', 50);
$engagement = fm_field('engagement', 50);
$details = fm_field('details', 2000, true);

foreach (array($name, $company, $email, $role, $need, $env, $count, $engagement, $details) as $v) {
    if ($v === false) {
        fm_finish(false, 'invalid', 422);
    }
}
if ($name === '' || $company === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fm_finish(false, 'invalid', 422);
}

// --- captcha ---------------------------------------------------------------------------------
// Checked after validation so a typo in the email does not cost the visitor their answer.

$captcha = fm_captcha_check($config, isset($_POST['captcha_token']) ? $_POST['captcha_token'] : null, isset($_POST['captcha']) ? $_POST['captcha'] : null);
if ($captcha === 'expired') {
    fm_finish(false, 'expired', 422);
}
if ($captcha === 'missing') {
    fm_finish(false, 'captcha', 422);   // no JavaScript, or a script that never asked: no strike
}
if ($captcha === 'fast') {
    fm_strike($client);
    fm_finish(true, 'ok');
}
if ($captcha !== 'ok') {
    fm_strike($client);
    fm_finish(false, 'captcha', 422);
}

// --- content ---------------------------------------------------------------------------------

if (fm_looks_like_spam(array($name, $company, $role, $need, $env, $count, $engagement), $details)) {
    fm_strike($client);
    fm_finish(false, 'spam', 422);
}
// The same enquiry again within a day (double click, retry, replayed script): thank the sender, send nothing.
$duplicate = fm_duplicate_key($email, $name, $company, $details);
if (fm_window($duplicate, FM_DUPLICATE_WINDOW, 1, false)) {
    fm_finish(true, 'ok');
}

// --- rate limit ------------------------------------------------------------------------------

if (fm_window('ip-' . $client, 3600, FM_IP_LIMIT, true) || fm_window('all', 3600, FM_GLOBAL_LIMIT, true)) {
    fm_finish(false, 'rate', 429);
}

// --- send ------------------------------------------------------------------------------------

require __DIR__ . '/_form/phpmailer/Exception.php';
require __DIR__ . '/_form/phpmailer/PHPMailer.php';
require __DIR__ . '/_form/phpmailer/SMTP.php';

$sender = !empty($config['from']) ? $config['from'] : $config['user'];
$subject = 'New inquiry from fluxmigrate.com: ' . $company . ' (' . $name . ')';
$body = "New inquiry from fluxmigrate.com\n\n"
    . "Name: $name\n"
    . "Company: $company\n"
    . "Email: $email\n"
    . "Role: $role\n"
    . "Need: $need\n"
    . "Technology environment: $env\n"
    . "Engineers required: $count\n"
    . "Engagement type: $engagement\n\n"
    . "Requirements:\n" . ($details !== '' ? $details : '(none given)') . "\n\n"
    . "--\nSent " . gmdate('Y-m-d H:i') . " UTC from https://www.fluxmigrate.com/contact.html\n"
    . "Reply to this email to answer the visitor directly.\n";

function fm_build_mail($config, $sender, $subject, $body, $email, $name)
{
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($sender, 'FluxMigrate website');
    $mail->addAddress($config['to']);
    $mail->addReplyTo($email, $name);
    $mail->Subject = $subject;
    $mail->Body = $body;
    $mail->isHTML(false);
    return $mail;
}

try {
    $mail = fm_build_mail($config, $sender, $subject, $body, $email, $name);
    $mail->isSMTP();
    $mail->Host = $config['host'];
    $mail->Port = isset($config['port']) ? (int) $config['port'] : 465;
    $mail->SMTPAuth = true;
    $mail->Username = $config['user'];
    $mail->Password = $config['password'];
    $secure = isset($config['secure']) ? $config['secure'] : 'ssl';
    if ($secure === 'ssl') {
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($secure === 'tls') {
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mail->SMTPSecure = '';
        $mail->SMTPAutoTLS = false;   // local test sink only; never set in production
    }
    $mail->Timeout = 10;
    $mail->send();
} catch (Throwable $smtpError) {
    // Shared hosts sometimes block outbound SMTP ports. Fall back to the host's own mail queue
    // (SPF and DKIM already cover it) rather than lose an enquiry.
    error_log('[contact-submit] SMTP failed, trying local mail(): ' . $smtpError->getMessage());
    try {
        $mail = fm_build_mail($config, $sender, $subject, $body, $email, $name);
        $mail->isMail();
        $mail->send();
    } catch (Throwable $mailError) {
        error_log('[contact-submit] local mail() failed: ' . $mailError->getMessage());
        fm_finish(false, 'send', 502);
    }
}

fm_window($duplicate, FM_DUPLICATE_WINDOW, 1, true);   // remembered only once the mail is out
fm_finish(true, 'ok');
