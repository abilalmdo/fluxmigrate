/**
 * Copy for /privacy-policy.html and /terms-of-service.html (FM-801).
 *
 * Rules for editing:
 *  - Keep every statement true of the site as built. If a tool is added (analytics, a newsletter
 *    sending service, a CRM), name it here before it goes live and move the `updated` date.
 *  - Postal addresses are NOT printed here (only /contact.html and /contact-us.html may show them,
 *    verify-dist enforces it); the policies point to the Contact Us page instead.
 *  - Standard-form text, not legal advice: have a lawyer review it before relying on it.
 */

export type LegalSection = { id: string; title: string; paragraphs?: string[]; list?: string[]; after?: string[] };

export type LegalDoc = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
};

const UPDATED = "3 October 2026";

export const privacyPolicy: LegalDoc = {
  slug: "privacy-policy",
  title: "Privacy Policy | FluxMigrate",
  description:
    "How FluxMigrate collects, uses and protects personal data from fluxmigrate.com: the contact form, the email subscription, security logging and your rights.",
  h1: "Privacy **Policy**",
  subtitle: "What we collect through this website, why, who sees it, how long we keep it, and the rights you have.",
  updated: UPDATED,
  intro: [
    "This policy explains how FluxMigrate (\"we\", \"us\") handles personal data when you visit fluxmigrate.com, send us an enquiry or subscribe to our emails. We keep it plain on purpose.",
    "In short: we collect only what you give us through our forms, plus a little technical data to keep the site safe. We do not run analytics or advertising tools, we do not set cookies, and we do not sell personal data.",
  ],
  sections: [
    {
      id: "who",
      title: "Who is responsible for your data",
      paragraphs: [
        "FluxMigrate is the controller of the personal data described here. You can reach us by email at the address below, by phone, or by post at the addresses on our Contact Us page.",
      ],
    },
    {
      id: "collect",
      title: "What we collect",
      paragraphs: ["We collect personal data in three ways."],
      list: [
        "Contact form. When you send an enquiry: your name, company, business email address, role, what you need, your technology environment, the number of engineers and the type of engagement you are considering, and anything you write in the message.",
        "Email subscription. When you subscribe: your email address, the wording you agreed to and the time you agreed, the page you subscribed from, whether you confirmed, and later whether you unsubscribed. We also keep a one-way coded form of your IP address (not the address itself) with the subscription record.",
        "Technical and security data. To stop spam and abuse of our forms, our server briefly counts requests per connection using your IP address, and records repeated suspicious attempts. These records are short-lived (see Retention). Our hosting provider's web server may also keep standard access logs (IP address, time, page requested, browser type).",
      ],
      after: [
        "If you call or email us directly, we receive and keep what you tell us in the call or message.",
        "We do not collect payment details, and we do not knowingly collect data about children.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies and browser storage",
      paragraphs: [
        "This site sets no cookies. It stores two small items in your browser's local storage: your consent choice and, if you allow it, a note that you closed the newsletter prompt. Details, and a way to change your choice, are in our Cookie Policy.",
        "We load no third-party scripts, fonts, trackers, maps or embedded content.",
      ],
    },
    {
      id: "use",
      title: "Why we use your data and our legal basis",
      list: [
        "To answer your enquiry and, if you ask, discuss a project or engagement. Basis: steps you ask us to take before a contract, and our legitimate interest in running our business.",
        "To send you blog posts, our newsletter and service updates. Basis: your consent, which you give by ticking the box and confirming by email. You can withdraw it at any time.",
        "To keep the website and forms secure and to prevent spam and abuse. Basis: our legitimate interest in protecting the service.",
        "To keep records and meet legal obligations. Basis: legal obligation and legitimate interest.",
      ],
      after: ["We do not use your data for automated decision-making or profiling."],
    },
    {
      id: "newsletter",
      title: "Our email subscription",
      paragraphs: [
        "When you subscribe, we use double opt-in: we send one email asking you to confirm, and you are subscribed only after you open the link in it. If you do not confirm, you are not added to the list.",
        "Subscribers receive blog posts, our newsletter and service updates. Every email carries an unsubscribe link, and you can also write to us to be removed. After you unsubscribe we keep your address on a suppression record, marked as unsubscribed, so that we do not email you again unless you choose to subscribe again. You can ask us to delete that record too (see Your rights).",
      ],
    },
    {
      id: "share",
      title: "Who we share data with",
      paragraphs: [
        "We do not sell personal data and we do not share it for advertising. We share it only with service providers who help us run the site and our email, under their own data-protection obligations:",
      ],
      list: [
        "Our web hosting and email provider, Namecheap, Inc. (United States), which stores the website, the subscriber list and our mailbox.",
        "Our own team in the United States and Pakistan, who read enquiries and manage the subscriber list.",
      ],
      after: [
        "We may disclose data if the law requires it, to respond to valid legal requests, or to protect our rights and the safety of others. If we start using another provider that handles personal data (for example a service for sending newsletters), we will name it here before we do.",
      ],
    },
    {
      id: "transfers",
      title: "Where your data goes",
      paragraphs: [
        "We operate from Pakistan and the United States, and our hosting provider is in the United States, so your data is processed outside your own country and may be outside the European Economic Area or the United Kingdom. Where the law requires safeguards for such transfers, we rely on appropriate mechanisms such as standard contractual clauses.",
      ],
    },
    {
      id: "retention",
      title: "How long we keep it",
      list: [
        "Enquiries: for as long as needed to answer you and keep a business record of the relationship, then we delete them.",
        "Subscriptions: while you are subscribed. After you unsubscribe, the suppression record stays until you ask us to delete it.",
        "Spam-protection records (request counts, repeated-attempt records, short-term duplicate checks): from one hour up to two days.",
        "Browser storage: as stated in the Cookie Policy (12 months for the consent choice, 30 days for the newsletter prompt).",
      ],
    },
    {
      id: "security",
      title: "How we protect it",
      paragraphs: [
        "We use reasonable technical and organisational measures: encrypted connections to the site and to our mail server, access limited to people who need it, the subscriber list kept in a private folder that is not reachable from the web, and spam and abuse controls on our forms. No method of storage or transmission is completely secure, so we cannot guarantee absolute security.",
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      paragraphs: ["Depending on where you live, you may have the right to:"],
      list: [
        "ask for a copy of the personal data we hold about you;",
        "have inaccurate data corrected;",
        "have your data deleted;",
        "restrict or object to how we use it;",
        "receive your data in a portable format;",
        "withdraw your consent at any time, without affecting what we did before you withdrew it;",
        "complain to your data-protection authority (in the UK, the Information Commissioner's Office; in the EU, your national authority).",
      ],
      after: [
        "Residents of California and other US states with privacy laws have similar rights to know, correct and delete their personal information. We do not sell or share personal information for cross-context behavioural advertising, and we will not treat you differently for using your rights.",
        "To use any of these rights, write to us at the email address below. We may ask you to confirm who you are, and we aim to answer within one month.",
      ],
    },
    {
      id: "children",
      title: "Children",
      paragraphs: ["This website is for businesses. It is not aimed at children, and we do not knowingly collect data from anyone under 16."],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      paragraphs: [
        "We may update this policy as the site or the law changes. The date at the top shows the latest version. If a change is significant, we will say so on the site.",
      ],
    },
  ],
};

export const termsOfService: LegalDoc = {
  slug: "terms-of-service",
  title: "Terms of Service | FluxMigrate",
  description: "The terms for using fluxmigrate.com: what the site is for, acceptable use, intellectual property, disclaimers and limits of liability.",
  h1: "Terms of **Service**",
  subtitle: "The rules for using this website. Work we do for clients is covered by a separate written agreement.",
  updated: UPDATED,
  intro: [
    "These terms apply to your use of fluxmigrate.com (the \"site\"), operated by FluxMigrate (\"we\", \"us\"). By using the site you agree to them. If you do not agree, please do not use the site.",
  ],
  sections: [
    {
      id: "site",
      title: "What this site is",
      paragraphs: [
        "The site describes FluxMigrate's services and lets you contact us or subscribe to our emails. It is general information, not a contract, an offer or professional advice. Any work we do for you is governed by a separate written agreement signed by both parties, which takes priority over these terms for that work.",
        "Diagrams and images on the site are illustrations. They are labelled as such and do not show real client systems, results or measurements.",
      ],
    },
    {
      id: "use",
      title: "Using the site",
      paragraphs: ["You agree not to:"],
      list: [
        "break the law or use the site to harm others;",
        "attempt to gain unauthorised access to the site, our servers or other users' data;",
        "interfere with the site, for example by overloading it, scraping it at a rate that affects other visitors, or sending automated or bulk submissions through our forms;",
        "send us spam, malware, unlawful or misleading content;",
        "pretend to be another person or organisation.",
      ],
      after: ["We may block access, without notice, to anyone who breaks these rules."],
    },
    {
      id: "enquiries",
      title: "Enquiries and emails",
      paragraphs: [
        "When you send an enquiry or subscribe, you must give accurate details and, for a subscription, use an address you own or are allowed to use. Sending an enquiry does not create a client relationship or any duty of confidentiality until we agree in writing. Please do not send us passwords, secrets or sensitive personal data through the form. How we handle your data is described in our Privacy Policy.",
      ],
    },
    {
      id: "ip",
      title: "Intellectual property",
      paragraphs: [
        "The site, its text, design, illustrations and the FluxMigrate name and logo belong to us or our licensors and are protected by law. You may view the site and share links to it. You may not copy, adapt or republish its content, or use our name or logo, without our written permission. Product and company names mentioned on the site belong to their owners and are used only to describe the technology involved; their use does not imply endorsement or partnership.",
      ],
    },
    {
      id: "warranty",
      title: "No warranty",
      paragraphs: [
        "We work to keep the information on the site accurate and current, but we provide the site \"as is\" and \"as available\", without warranties of any kind, express or implied, including accuracy, completeness, fitness for a particular purpose and uninterrupted or error-free operation.",
      ],
    },
    {
      id: "liability",
      title: "Limit of liability",
      paragraphs: [
        "To the fullest extent the law allows, FluxMigrate is not liable for any indirect, incidental, special or consequential loss, or for loss of profit, revenue, data or goodwill, arising from your use of, or inability to use, the site or from relying on its content. Nothing in these terms limits liability that cannot be limited by law, such as liability for fraud or for death or personal injury caused by negligence.",
      ],
    },
    {
      id: "links",
      title: "Links to other sites",
      paragraphs: [
        "The site may link to websites we do not control. We are not responsible for their content or practices, and a link is not an endorsement.",
      ],
    },
    {
      id: "changes",
      title: "Changes and ending access",
      paragraphs: [
        "We may change the site or these terms at any time. The date at the top shows the latest version, and continuing to use the site after a change means you accept it. We may suspend or end access to the site at any time.",
      ],
    },
    {
      id: "law",
      title: "Governing law",
      paragraphs: [
        "These terms are governed by the laws of the State of Wyoming, United States, without regard to its conflict-of-laws rules. Courts located in Wyoming have non-exclusive jurisdiction over any dispute about the site or these terms, except where mandatory consumer law in your country gives you the right to bring a claim where you live.",
      ],
    },
  ],
};
