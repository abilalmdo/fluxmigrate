<?php
/**
 * Unsubscribe link target (task FM-108): GET ?t=<unsub token> (the link in every mail), or POST
 * with the same token (RFC 8058 one-click, for a List-Unsubscribe-Post header in future bulk mail).
 * Marks the address "unsubscribed" and sends the visitor to /subscription.html#unsubscribed.
 * The row is kept, so a later opt-in knows the history; delete it by hand if someone asks to be erased.
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

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method !== 'GET' && $method !== 'POST') {
    http_response_code(405);
    header('Allow: GET, POST');
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
if (fm_is_locked_out($client) || fm_window('unsub-' . $client, 3600, 30, true)) {
    fm_go('invalid');
}

$source = $method === 'POST' ? $_POST : $_GET;
$token = isset($source['t']) && is_string($source['t']) ? $source['t'] : (isset($_GET['t']) && is_string($_GET['t']) ? $_GET['t'] : '');
if (!preg_match('/^[a-f0-9]{32}$/', $token)) {
    fm_go('invalid');
}

$db = fm_subscribers_db($config);
if ($db === null) {
    fm_go('error');
}
try {
    $stmt = $db->prepare('SELECT id, status FROM subscribers WHERE unsub_token = ?');
    $stmt->execute(array($token));
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        fm_go('invalid');
    }
    if ($row['status'] !== 'unsubscribed') {
        $db->prepare('UPDATE subscribers SET status = \'unsubscribed\', unsubscribed_at = ? WHERE id = ?')->execute(array(fm_now(), $row['id']));
    }
} catch (Throwable $e) {
    error_log('[subscribe-unsubscribe] database error: ' . $e->getMessage());
    fm_go('error');
}
fm_go('unsubscribed');
