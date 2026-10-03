<?php
/**
 * Confirmation link target for the newsletter opt-in (task FM-108): GET ?t=<token>.
 * Marks the address "confirmed", mails the FluxMigrate inbox a notice, and sends the visitor to
 * /subscription.html#confirmed (or #invalid, #error).
 *
 * A mail scanner that opens the link can confirm an address; that is a known limit of link-based
 * double opt-in and is accepted here.
 */

ini_set('display_errors', '0');
ini_set('log_errors', '1');

function fm_go($anchor)
{
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    header('Referrer-Policy: no-referrer');
    header('Location: /subscription.html#' . $anchor, true, 303);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    echo 'Method not allowed';
    exit;
}

require __DIR__ . '/_form/guard.php';
require __DIR__ . '/_form/mailer.php';
require __DIR__ . '/_form/subscribers.php';

$config = fm_load_config();
if ($config === null) {
    fm_go('error');
}
$client = fm_client_key($config);
// Tokens are 128-bit, so guessing is hopeless; the limit just keeps scripts from hammering the endpoint.
if (fm_is_locked_out($client) || fm_window('conf-' . $client, 3600, 30, true)) {
    fm_go('invalid');
}

$token = isset($_GET['t']) && is_string($_GET['t']) ? $_GET['t'] : '';
if (!preg_match('/^[a-f0-9]{32}$/', $token)) {
    fm_go('invalid');
}

$db = fm_subscribers_db($config);
if ($db === null) {
    fm_go('error');
}
try {
    $stmt = $db->prepare('SELECT * FROM subscribers WHERE confirm_token = ?');
    $stmt->execute(array($token));
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || $row['status'] === 'unsubscribed') {
        fm_go('invalid');
    }
    if ($row['status'] === 'pending') {
        $db->prepare('UPDATE subscribers SET status = \'confirmed\', confirmed_at = ? WHERE id = ?')->execute(array(fm_now(), $row['id']));
        // Tell the team. Best effort: the address is already saved, the notice is a convenience and a second copy.
        fm_send_mail(
            $config,
            $config['to'],
            'New subscriber: ' . $row['email'],
            "A visitor confirmed their subscription.\n\nEmail: " . $row['email'] . "\nSubscribed to: " . fm_interest_labels($row['interests'])
            . "\nPage: " . ($row['source_page'] !== '' ? $row['source_page'] : '(unknown)') . "\nConfirmed: " . fm_now() . " UTC\n"
        );
    }
} catch (Throwable $e) {
    error_log('[subscribe-confirm] database error: ' . $e->getMessage());
    fm_go('error');
}
fm_go('confirmed');
