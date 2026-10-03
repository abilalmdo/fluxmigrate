<?php
/**
 * The subscription confirmation email (task FM-108): an HTML version with a button, and the plain-text
 * version every mail client falls back to.
 *
 * Edit the two constants below to change the closing statement. Keep to what is true of the company:
 * no client names, no numbers, no promises of results. The HTML is built for mail clients, not
 * browsers: tables, inline styles, ASCII only (HTML entities), no scripts, no web fonts, no CSS grid.
 *
 * Library code: included from disk, never requested over HTTP (see _form/.htaccess).
 */

/**
 * Welcome wording. Each email picks one variant at random, so different people get different words.
 * A variant is one welcome line, one closing tagline and one closing statement; they always travel together.
 * Add, change or remove entries freely (keep at least one). Rules for every entry: no client names, no numbers,
 * no "best/leading/trusted by" claims, no mention of blogs or newsletters, plain ASCII (the template escapes it).
 */
const FM_MAIL_VARIANTS = array(
    array(
        'intro' => 'You are one click away from stepping into a world of expert cloud, DevOps and reliability engineering insight, built to help your business move faster and run with confidence.',
        'tagline' => 'Cloud infrastructure, engineered for change.',
        'statement' => 'We help teams migrate, modernise and run their infrastructure with confidence, as projects or as an extension of your own engineering team.',
    ),
    array(
        'intro' => 'One click opens the door to expert cloud, DevOps and reliability engineering, built around your business.',
        'tagline' => 'Migrate with confidence. Operate with calm.',
        'statement' => 'Cloud, DevOps and reliability engineering, delivered as projects or as part of your team.',
    ),
    array(
        'intro' => 'You are one click away from smarter, calmer infrastructure.',
        'tagline' => 'Your infrastructure, our engineers.',
        'statement' => 'Working alongside your team, from the first migration to day-to-day reliability.',
    ),
    array(
        'intro' => 'Welcome aboard. One click connects you with the engineering expertise behind your next migration.',
        'tagline' => 'Change is constant. Migration should be calm.',
        'statement' => 'We plan, build and run cloud and platform changes so your team can keep shipping.',
    ),
    array(
        'intro' => 'You are one click away from infrastructure ideas that help your business move with confidence.',
        'tagline' => 'Modern infrastructure, built to adapt.',
        'statement' => 'From cloud migration to site reliability, we help teams modernise without slowing down.',
    ),
    array(
        'intro' => 'Welcome. One click starts the conversation about faster, safer, more reliable infrastructure.',
        'tagline' => 'Faster to change. Safer to run.',
        'statement' => 'Practical cloud, DevOps and reliability engineering for teams that cannot afford downtime.',
    ),
);
const FM_MAIL_BUTTON = 'Confirm and connect with FluxMigrate';

function fm_h($s)
{
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Returns array(plainText, html). All three URLs are built by the caller from config, never from the request.
 * $variant: index into FM_MAIL_VARIANTS; null (the normal case) picks one at random.
 */
function fm_confirmation_email($confirmUrl, $unsubUrl, $siteUrl, $variant = null)
{
    $v = FM_MAIL_VARIANTS[$variant !== null ? ((int) $variant) % count(FM_MAIL_VARIANTS) : random_int(0, count(FM_MAIL_VARIANTS) - 1)];
    $text = "Welcome to FluxMigrate\n\n"
        . $v['intro'] . "\n\n"
        . FM_MAIL_BUTTON . ":\n$confirmUrl\n\n"
        . "If you did not ask for this, ignore this email. Nothing happens until the link is opened.\n\n"
        . "--\n" . $v['tagline'] . "\n" . $v['statement'] . "\n\n"
        . "FluxMigrate - $siteUrl\n"
        . "Do not want these emails? $unsubUrl\n";

    $logo = fm_h($siteUrl . '/brand/email-logo.png');
    $confirm = fm_h($confirmUrl);
    $unsub = fm_h($unsubUrl);
    $site = fm_h($siteUrl);
    $intro = fm_h($v['intro']);
    $tagline = fm_h($v['tagline']);
    $statement = fm_h($v['statement']);
    $button = fm_h(FM_MAIL_BUTTON);

    $font = "font-family:'Segoe UI',Helvetica,Arial,sans-serif;";
    $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Confirm your FluxMigrate subscription</title>
</head>
<body style="margin:0;padding:0;background-color:#f1eefb;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f1eefb;">One click to confirm your subscription and connect with FluxMigrate.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1eefb;">
<tr><td align="center" style="padding:32px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:16px;border-top:5px solid #4d36d0;">
    <tr><td style="padding:32px 40px 8px 40px;">
      <a href="$site" style="text-decoration:none;"><img src="$logo" width="200" height="36" alt="FluxMigrate" style="display:block;border:0;outline:none;width:200px;height:auto;"></a>
    </td></tr>
    <tr><td style="padding:24px 40px 0 40px;{$font}color:#1a1530;">
      <h1 style="margin:0 0 12px 0;font-size:26px;line-height:1.25;font-weight:700;color:#1a1530;">Welcome to FluxMigrate</h1>
      <p style="margin:0 0 8px 0;font-size:16px;line-height:1.6;color:#3b3654;">$intro</p>
    </td></tr>
    <tr><td align="left" style="padding:20px 40px 8px 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" bgcolor="#4d36d0" style="border-radius:999px;background-color:#4d36d0;">
          <a href="$confirm" style="display:inline-block;padding:15px 30px;{$font}font-size:16px;font-weight:700;line-height:1.2;color:#ffffff;text-decoration:none;border-radius:999px;">$button &rarr;</a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:12px 40px 0 40px;{$font}font-size:13px;line-height:1.6;color:#5b5675;">
      Button not working? Copy this link into your browser:<br>
      <a href="$confirm" style="color:#4d36d0;word-break:break-all;">$confirm</a>
    </td></tr>
    <tr><td style="padding:16px 40px 0 40px;{$font}font-size:13px;line-height:1.6;color:#5b5675;">
      If you did not ask for this, ignore this email. Nothing happens until the link is opened.
    </td></tr>
    <tr><td style="padding:28px 40px 0 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #e4def5;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table></td></tr>
    <tr><td style="padding:24px 40px 8px 40px;{$font}">
      <p style="margin:0 0 8px 0;font-size:19px;line-height:1.35;font-weight:700;color:#4d36d0;">$tagline</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#3b3654;">$statement</p>
    </td></tr>
    <tr><td style="padding:24px 40px 32px 40px;{$font}font-size:12px;line-height:1.7;color:#76708f;">
      FluxMigrate &middot; <a href="$site" style="color:#76708f;">$site</a><br>
      Do not want these emails? <a href="$unsub" style="color:#76708f;">Unsubscribe</a>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>
HTML;
    return array($text, $html);
}
