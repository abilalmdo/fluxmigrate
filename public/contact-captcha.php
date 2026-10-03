<?php
/**
 * Issues a captcha question for the contact form (task FM-107).
 *
 * GET -> {"question": "...", "token": "..."}. The token is signed; the answer is not stored anywhere.
 * Questions are rate limited per client so a script cannot harvest them to study.
 * Shares mail-config.php (for the signing secret) and _form/guard.php with contact-submit.php.
 */

ini_set('display_errors', '0');
ini_set('log_errors', '1');

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    echo json_encode(array('error' => 'Method not allowed'));
    exit;
}

$configFile = __DIR__ . '/mail-config.php';
$config = is_file($configFile) ? require $configFile : null;
if (!is_array($config) || empty($config['password'])) {
    error_log('[contact-captcha] mail-config.php is missing or incomplete');
    http_response_code(500);
    echo json_encode(array('error' => 'unavailable'));
    exit;
}

require __DIR__ . '/_form/guard.php';

fm_cleanup();
$client = fm_client_key($config);
if (fm_is_locked_out($client) || fm_window('chal-' . $client, 3600, FM_CHALLENGE_LIMIT, true)) {
    http_response_code(429);
    echo json_encode(array('error' => 'rate'));
    exit;
}

list($question, $token) = fm_captcha_new($config);
echo json_encode(array('question' => $question, 'token' => $token));
