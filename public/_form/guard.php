<?php
/**
 * Abuse protection shared by contact-submit.php and contact-captcha.php (task FM-107).
 *
 *   - sliding-window counters in the system temp dir (outside the web root)
 *   - strikes and a temporary lockout per client
 *   - a self-hosted captcha: a short question in plain text, answered by typing. The page asks for a
 *     question and gets back a signed token; the server never stores the answer, it checks the
 *     answer against the signature. Nothing is loaded from, or sent to, a third party.
 *
 * Library code: included from disk, never requested over HTTP (see _form/.htaccess).
 */

const FM_STRIKE_LIMIT = 3;          // strikes within the window that lock a client out
const FM_STRIKE_WINDOW = 3600;      // seconds; also how long the lockout lasts at most
const FM_CHALLENGE_LIMIT = 30;      // captcha questions per client per hour
const FM_CAPTCHA_MIN_AGE = 3;       // seconds between question and answer; faster is a script
const FM_CAPTCHA_MAX_AGE = 1800;    // a question expires after 30 minutes
const FM_DUPLICATE_WINDOW = 86400;  // an identical enquiry within 24 h is ignored

/**
 * Sliding-window counter. Returns true when the key already has $limit hits in the window.
 * With $record, a hit is added unless the key is over the limit. Fails open: an unwritable temp dir
 * must never cost us an enquiry.
 */
function fm_window($key, $window, $limit, $record)
{
    $fh = @fopen(sys_get_temp_dir() . '/fm-form-' . $key, 'c+');
    if (!$fh) {
        return false;
    }
    flock($fh, LOCK_EX);
    $now = time();
    $hits = array();
    $raw = stream_get_contents($fh);
    if ($raw) {
        foreach (explode(',', $raw) as $t) {
            if ((int) $t > $now - $window) {
                $hits[] = (int) $t;
            }
        }
    }
    $over = count($hits) >= $limit;
    if ($record && !$over) {
        $hits[] = $now;
    }
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, implode(',', $hits));
    flock($fh, LOCK_UN);
    fclose($fh);
    return $over;
}

/** One-way key for a client. Keyed with the mail password so the IP cannot be read back from the temp dir. */
function fm_client_key($config)
{
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
    return substr(hash_hmac('sha256', $ip, (string) $config['password']), 0, 32);
}

function fm_is_locked_out($client)
{
    return fm_window('strike-' . $client, FM_STRIKE_WINDOW, FM_STRIKE_LIMIT, false);
}

/** Record abuse (honeypot, script-speed, wrong captcha, foreign Origin, spam). Three in an hour lock the client out. */
function fm_strike($client)
{
    fm_window('strike-' . $client, FM_STRIKE_WINDOW, PHP_INT_MAX, true);
}

/** Delete counter files nobody has touched for two days (about one request in fifty). */
function fm_cleanup()
{
    if (random_int(1, 50) !== 1) {
        return;
    }
    foreach ((array) glob(sys_get_temp_dir() . '/fm-form-*') as $f) {
        if (@filemtime($f) < time() - 172800) {
            @unlink($f);
        }
    }
}

// --- captcha ---------------------------------------------------------------------------------

function fm_captcha_secret($config)
{
    return hash_hmac('sha256', 'fluxmigrate-captcha-v1', (string) $config['password']);
}

function fm_number_words()
{
    return array(
        'zero' => 0, 'one' => 1, 'two' => 2, 'three' => 3, 'four' => 4, 'five' => 5, 'six' => 6,
        'seven' => 7, 'eight' => 8, 'nine' => 9, 'ten' => 10, 'eleven' => 11, 'twelve' => 12,
        'thirteen' => 13, 'fourteen' => 14, 'fifteen' => 15, 'sixteen' => 16, 'seventeen' => 17,
        'eighteen' => 18, 'nineteen' => 19, 'twenty' => 20,
    );
}

/** "  Twelve. " and "12" are the same answer; so are "ABC" and "abc". Applied to both sides. */
function fm_captcha_normalize($answer)
{
    $a = strtolower(trim(preg_replace('/\s+/', ' ', (string) $answer), " \t\n\r.\"'"));
    $words = fm_number_words();
    if (isset($words[$a])) {
        return (string) $words[$a];
    }
    return ctype_digit($a) ? (string) (int) $a : $a;
}

/** Returns array(question, token). */
function fm_captcha_new($config)
{
    $terms = array('kubernetes', 'terraform', 'pipeline', 'cluster', 'container', 'migration', 'hypervisor', 'ansible', 'reliability', 'observability');
    switch (random_int(0, 4)) {
        case 0:
            $a = random_int(2, 9);
            $b = random_int(2, 9);
            $question = "What is $a plus $b?";
            $answer = $a + $b;
            break;
        case 1:
            $a = random_int(11, 19);
            $b = random_int(2, 9);
            $question = "What is $a minus $b?";
            $answer = $a - $b;
            break;
        case 2:
            $nums = array();
            while (count($nums) < 3) {
                $nums[random_int(10, 99)] = true;
            }
            $nums = array_keys($nums);
            $question = 'Which number is the largest: ' . $nums[0] . ', ' . $nums[1] . ' or ' . $nums[2] . '?';
            $answer = max($nums);
            break;
        case 3:
            $w = $terms[random_int(0, count($terms) - 1)];
            $question = 'Type the first three letters of the word "' . $w . '".';
            $answer = substr($w, 0, 3);
            break;
        default:
            $w = $terms[random_int(0, count($terms) - 1)];
            $question = 'Type the last three letters of the word "' . $w . '".';
            $answer = substr($w, -3);
    }
    $id = bin2hex(random_bytes(8));
    $issued = time();
    $sig = hash_hmac('sha256', "$id|$issued|" . fm_captcha_normalize((string) $answer), fm_captcha_secret($config));
    return array($question, "$id.$issued.$sig");
}

/**
 * Checks an answer against its token. A token works once, right or wrong, so a script cannot try
 * several answers against one question.
 * Returns 'ok', 'missing' (no token: a script, or a visitor without JavaScript), 'expired',
 * 'fast' (answered quicker than a person can read it), 'replay' or 'bad'.
 */
function fm_captcha_check($config, $token, $answer)
{
    if (!is_string($token) || !is_string($answer) || $token === '') {
        return 'missing';
    }
    if (!preg_match('/^([a-f0-9]{16})\.(\d{1,12})\.([a-f0-9]{64})$/', $token, $m)) {
        return 'bad';
    }
    list(, $id, $issued, $sig) = $m;
    $age = time() - (int) $issued;
    if ($age > FM_CAPTCHA_MAX_AGE) {
        return 'expired';
    }
    if ($age < 0 || fm_window('cap-' . $id, FM_CAPTCHA_MAX_AGE + 60, 1, true)) {
        return 'replay';
    }
    $expected = hash_hmac('sha256', "$id|$issued|" . fm_captcha_normalize($answer), fm_captcha_secret($config));
    if (!hash_equals($expected, $sig)) {
        return 'bad';
    }
    return $age < FM_CAPTCHA_MIN_AGE ? 'fast' : 'ok';
}

// --- content ---------------------------------------------------------------------------------

/** Links in a name field, more than two links in the message, markup or the usual spam trades. */
function fm_looks_like_spam($shortFields, $details)
{
    $link = '~https?://|www\.~i';
    foreach ($shortFields as $v) {
        if (preg_match($link, $v) || preg_match('~<\s*/?\s*[a-z]|\[/?url~i', $v)) {
            return true;
        }
    }
    if (preg_match_all($link, $details) > 2 || preg_match('~<\s*/?\s*(a|script|iframe|img|link|form)\b|\[/?(url|link|img)\b~i', $details)) {
        return true;
    }
    $all = implode(' ', $shortFields) . ' ' . $details;
    return (bool) preg_match('~\b(viagra|cialis|casino|porn\w*|escorts?|payday loans?|backlinks?|guest posts?|buy followers|binary options|essay writing|seo (services|expert|packages)|crypto(currency)? invest\w*)\b~i', $all);
}

/** Same person, same words: the same key whatever the spacing or case. */
function fm_duplicate_key($email, $name, $company, $details)
{
    $text = strtolower(preg_replace('/\s+/', ' ', "$email|$name|$company|$details"));
    return 'dup-' . substr(hash('sha256', $text), 0, 32);
}
