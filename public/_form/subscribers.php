<?php
/**
 * Subscriber storage for the newsletter opt-in (task FM-108): one SQLite file OUTSIDE the web root.
 *
 * Default location: a folder called fm-data next to the web root (on cPanel: the account's home folder,
 * beside public_html). Override with `data_dir` in mail-config.php (GitHub secret DATA_DIR). It must
 * not be inside dist/: the FTP deploy deletes every file it did not upload, and the web server would
 * serve anything inside the web root.
 *
 * Library code: included from disk, never requested over HTTP (see _form/.htaccess).
 */

/** The consent wording shown next to the checkbox. Keep identical to optIn.consent in src/data/content.ts (verify-dist checks). */
const FM_CONSENT_TEXT = 'I agree to receive emails from FluxMigrate: blog posts, the newsletter and service updates. I can unsubscribe at any time.';
const FM_INTERESTS = array('blog' => 'Blog posts', 'newsletter' => 'Newsletter', 'updates' => 'Service updates');

/** Absolute path of the data folder, created on first use; false when it cannot be used safely. */
function fm_data_dir($config)
{
    $docRoot = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim((string) $_SERVER['DOCUMENT_ROOT'], '/\\') : '';
    $dir = !empty($config['data_dir']) ? rtrim($config['data_dir'], '/\\') : ($docRoot !== '' ? dirname($docRoot) . '/fm-data' : '');
    if ($dir === '' || (!is_dir($dir) && !@mkdir($dir, 0700, true))) {
        error_log('[newsletter] data folder is missing and cannot be created: ' . $dir);
        return false;
    }
    $real = realpath($dir);
    $realRoot = $docRoot !== '' ? realpath($docRoot) : false;
    if ($real === false || ($realRoot !== false && ($real === $realRoot || strpos($real, $realRoot . DIRECTORY_SEPARATOR) === 0))) {
        error_log('[newsletter] data folder must be outside the web root: ' . $dir);
        return false;
    }
    if (!is_file($real . '/.htaccess')) {
        @file_put_contents($real . '/.htaccess', "Require all denied\n");   // belt and braces if someone later moves it
    }
    return $real;
}

/** Opens (and on first use creates) the subscriber database; null when storage is unavailable. */
function fm_subscribers_db($config)
{
    if (!extension_loaded('pdo_sqlite')) {
        error_log('[newsletter] PHP extension pdo_sqlite is not enabled');
        return null;
    }
    $dir = fm_data_dir($config);
    if ($dir === false) {
        return null;
    }
    try {
        $file = $dir . '/subscribers.sqlite';
        $isNew = !is_file($file);
        $db = new PDO('sqlite:' . $file);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->exec('PRAGMA busy_timeout = 5000');
        $db->exec('CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            interests TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN (\'pending\', \'confirmed\', \'unsubscribed\')),
            consent_text TEXT NOT NULL,
            source_page TEXT NOT NULL DEFAULT \'\',
            ip_hash TEXT NOT NULL DEFAULT \'\',
            confirm_token TEXT NOT NULL UNIQUE,
            unsub_token TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL,
            confirm_sent_at TEXT,
            confirmed_at TEXT,
            unsubscribed_at TEXT
        )');
        if ($isNew) {
            @chmod($file, 0600);
        }
        return $db;
    } catch (Throwable $e) {
        error_log('[newsletter] cannot open the subscriber database: ' . $e->getMessage());
        return null;
    }
}

function fm_now()
{
    return gmdate('Y-m-d H:i:s');
}

function fm_new_token()
{
    return bin2hex(random_bytes(16));
}

/** The content kinds every subscriber receives, as stored in the `interests` column. */
function fm_all_interests()
{
    return implode(',', array_keys(FM_INTERESTS));
}

function fm_interest_labels($csv)
{
    $out = array();
    foreach (explode(',', $csv) as $k) {
        if (isset(FM_INTERESTS[$k])) {
            $out[] = FM_INTERESTS[$k];
        }
    }
    return implode(', ', $out);
}
