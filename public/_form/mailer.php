<?php
/**
 * Config loading and mail sending shared by the newsletter endpoints (task FM-108).
 * contact-submit.php keeps its own copy; it predates this file and is covered by its own tests.
 *
 * Library code: included from disk, never requested over HTTP (see _form/.htaccess).
 */

/** The array CI writes to mail-config.php, or null when it is missing or incomplete. */
function fm_load_config()
{
    $file = __DIR__ . '/../mail-config.php';
    $config = is_file($file) ? require $file : null;
    if (!is_array($config) || empty($config['host']) || empty($config['user']) || empty($config['password']) || empty($config['to'])) {
        error_log('[newsletter] mail-config.php is missing or incomplete');
        return null;
    }
    return $config;
}

/** Public origin used in links inside mails. From config, never from the request: a forged Host header must not reach a mail. */
function fm_site_url($config)
{
    return rtrim(!empty($config['site_url']) ? $config['site_url'] : 'https://www.fluxmigrate.com', '/');
}

/**
 * Sends a plain-text mail over SMTP, falling back to the host's mail(). True when one of them accepted it.
 * $extraHeaders: array of name => value (values are stripped of CR/LF).
 * $html: optional HTML version; $body then becomes the plain-text alternative of a multipart mail.
 */
function fm_send_mail($config, $to, $subject, $body, $extraHeaders = array(), $html = null)
{
    require_once __DIR__ . '/phpmailer/Exception.php';
    require_once __DIR__ . '/phpmailer/PHPMailer.php';
    require_once __DIR__ . '/phpmailer/SMTP.php';

    $sender = !empty($config['from']) ? $config['from'] : $config['user'];
    $build = function () use ($config, $sender, $to, $subject, $body, $extraHeaders, $html) {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($sender, 'FluxMigrate');
        $mail->addAddress($to);
        $mail->Subject = preg_replace('/[\r\n]+/', ' ', $subject);
        if ($html !== null) {
            $mail->isHTML(true);
            $mail->Body = $html;
            $mail->AltBody = $body;
        } else {
            $mail->isHTML(false);
            $mail->Body = $body;
        }
        foreach ($extraHeaders as $name => $value) {
            $mail->addCustomHeader($name, preg_replace('/[\r\n]+/', ' ', $value));
        }
        return $mail;
    };

    try {
        $mail = $build();
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
        return true;
    } catch (Throwable $smtpError) {
        error_log('[newsletter] SMTP failed, trying local mail(): ' . $smtpError->getMessage());
        try {
            $mail = $build();
            $mail->isMail();
            $mail->send();
            return true;
        } catch (Throwable $mailError) {
            error_log('[newsletter] local mail() failed: ' . $mailError->getMessage());
            return false;
        }
    }
}
