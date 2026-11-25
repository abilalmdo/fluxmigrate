<?php
/**
 * Business-email check for contact-submit.php (task FM-110).
 *
 * The contact form is for companies. This refuses addresses on public mailbox providers (Gmail,
 * Yahoo, Hotmail ...), on disposable-mail services, and on domains that cannot receive mail.
 *
 *   fm_email_domain_problem($email, $checkDns) returns:
 *     null        the domain looks like a business domain
 *     'freemail'  public mailbox provider
 *     'disposable' throw-away mail service
 *     'nodomain'  the domain does not exist or has no mail server
 *
 * Library code: included from disk, never requested over HTTP (see _form/.htaccess).
 * Lists: FM_FREEMAIL_DOMAINS and FM_FREEMAIL_BRANDS below (edit freely), and
 * disposable-domains.txt (disposable-email-domains project, CC0; one domain per line).
 */

/** Exact domains of public mailbox providers. A subdomain of one of these also matches. */
const FM_FREEMAIL_DOMAINS = array(
    'gmail.com', 'googlemail.com',
    'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'passport.com', 'windowslive.com',
    'yahoo.com', 'ymail.com', 'rocketmail.com', 'myyahoo.com',
    'aol.com', 'aim.com', 'verizon.net', 'att.net', 'sbcglobal.net', 'bellsouth.net', 'comcast.net',
    'icloud.com', 'me.com', 'mac.com',
    'proton.me', 'protonmail.com', 'protonmail.ch', 'pm.me',
    'tutanota.com', 'tutanota.de', 'tuta.io', 'tuta.com', 'keemail.me',
    'mail.com', 'email.com', 'usa.com', 'post.com', 'consultant.com', 'engineer.com', 'techie.com', 'programmer.net',
    'zoho.com', 'zohomail.com', 'zohomail.in',
    'gmx.com', 'gmx.net', 'gmx.de', 'gmx.at', 'gmx.ch', 'web.de', 't-online.de', 'freenet.de',
    'yandex.com', 'yandex.ru', 'ya.ru', 'mail.ru', 'inbox.ru', 'list.ru', 'bk.ru', 'rambler.ru',
    'qq.com', 'foxmail.com', '126.com', '163.com', '188.com', 'yeah.net', 'sina.com', 'sina.cn', 'sohu.com', 'aliyun.com',
    'naver.com', 'daum.net', 'hanmail.net', 'kakao.com',
    'rediffmail.com', 'rediff.com',
    'fastmail.com', 'fastmail.fm', 'hushmail.com', 'runbox.com', 'mailfence.com', 'posteo.de', 'posteo.net',
    'hey.com', 'duck.com', 'mail.ee', 'seznam.cz', 'centrum.cz', 'wp.pl', 'o2.pl', 'interia.pl', 'onet.pl',
    'libero.it', 'virgilio.it', 'tiscali.it', 'laposte.net', 'orange.fr', 'free.fr', 'sfr.fr', 'wanadoo.fr',
    'btinternet.com', 'sky.com', 'virginmedia.com', 'talktalk.net', 'blueyonder.co.uk',
    'rogers.com', 'shaw.ca', 'sympatico.ca', 'telus.net', 'bigpond.com', 'optusnet.com.au',
    'cox.net', 'charter.net', 'earthlink.net', 'juno.com', 'netzero.net',
    'ptcl.net.pk', 'nayatel.com', 'cyber.net.pk',
);

/**
 * A provider that exists under many country domains: yahoo.co.uk, hotmail.fr, outlook.de ...
 * Matches when the domain's registrable label is one of these, whatever follows it.
 */
const FM_FREEMAIL_BRANDS = array('yahoo', 'hotmail', 'outlook', 'live', 'gmx', 'yandex', 'msn', 'icloud', 'protonmail', 'zoho', 'aol');

/** Lower-case, strip a trailing dot, convert an internationalised domain to ASCII. */
function fm_email_domain($email)
{
    $at = strrpos($email, '@');
    if ($at === false) {
        return '';
    }
    $domain = strtolower(rtrim(substr($email, $at + 1), '.'));
    if ($domain !== '' && function_exists('idn_to_ascii') && preg_match('/[^\x00-\x7F]/', $domain)) {
        $ascii = defined('INTL_IDNA_VARIANT_UTS46')
            ? idn_to_ascii($domain, IDNA_DEFAULT, INTL_IDNA_VARIANT_UTS46)
            : idn_to_ascii($domain);
        if ($ascii !== false) {
            $domain = $ascii;
        }
    }
    return $domain;
}

/** "mail.eu.yahoo.co.uk" -> mail.eu.yahoo.co.uk, eu.yahoo.co.uk, yahoo.co.uk, co.uk, uk */
function fm_domain_suffixes($domain)
{
    $labels = explode('.', $domain);
    $out = array();
    for ($i = 0; $i < count($labels); $i++) {
        $out[] = implode('.', array_slice($labels, $i));
    }
    return $out;
}

function fm_is_freemail($domain)
{
    $exact = array_flip(FM_FREEMAIL_DOMAINS);
    $brands = array_flip(FM_FREEMAIL_BRANDS);
    foreach (fm_domain_suffixes($domain) as $suffix) {
        if (isset($exact[$suffix])) {
            return true;
        }
        // yahoo.<anything>, also yahoo.co.uk, yahoo.com.br: the label before a one- or two-part ending
        $parts = explode('.', $suffix);
        if (count($parts) >= 2 && isset($brands[$parts[0]])) {
            $rest = array_slice($parts, 1);
            if (count($rest) === 1 || (count($rest) === 2 && strlen($rest[0]) <= 3 && strlen($rest[1]) === 2)) {
                return true;
            }
        }
    }
    return false;
}

function fm_is_disposable($domain)
{
    static $list = null;
    if ($list === null) {
        $lines = @file(__DIR__ . '/disposable-domains.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $list = $lines ? array_flip($lines) : array();
    }
    foreach (fm_domain_suffixes($domain) as $suffix) {
        if (isset($list[$suffix])) {
            return true;
        }
    }
    return false;
}

/** Reserved and non-delegated names that can never receive mail (RFC 2606, 6761). */
function fm_is_unroutable($domain)
{
    if (strpos($domain, '.') === false) {
        return true;
    }
    return (bool) preg_match('/\.(invalid|test|localhost|local|example|internal|lan|home|corp)$/', $domain);
}

/** True when the domain has a mail server (MX) or, as mail rules allow, an address record. */
function fm_domain_receives_mail($domain)
{
    if (!function_exists('checkdnsrr')) {
        return true;   // cannot tell: do not turn a visitor away for it
    }
    $fqdn = $domain . '.';   // absolute name: skip the resolver's search suffixes
    return checkdnsrr($fqdn, 'MX') || checkdnsrr($fqdn, 'A') || checkdnsrr($fqdn, 'AAAA');
}

function fm_email_domain_problem($email, $checkDns = true)
{
    $domain = fm_email_domain($email);
    if ($domain === '' || fm_is_unroutable($domain)) {
        return 'nodomain';
    }
    if (fm_is_freemail($domain)) {
        return 'freemail';
    }
    if (fm_is_disposable($domain)) {
        return 'disposable';
    }
    if ($checkDns && !fm_domain_receives_mail($domain)) {
        return 'nodomain';
    }
    return null;
}
