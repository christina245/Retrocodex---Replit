import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendMail(options: MailOptions): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("[mailer] SMTP not configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASS). Skipping email send.");
    return;
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

export function buildSubmissionConfirmationEmail(mythHeader: string): { subject: string; text: string; html: string } {
  const subject = "We received your fact submission";

  const text = [
    "Hi,",
    "",
    "Thanks for submitting a fact to Retrocodex! We received your submission and our team will review it shortly.",
    "",
    `Your submitted myth: "${mythHeader}"`,
    "",
    "What happens next:",
    "- Our team reviews every submission for accuracy and quality.",
    "- If approved, your fact will be published on the site.",
    "- We'll reach out if we have questions or need additional information.",
    "",
    "Reviews typically take 1–2 weeks. We appreciate your contribution to helping people learn the truth behind common myths.",
    "",
    "— The Retrocodex Team",
    "https://retrocodex.com",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { font-family: Georgia, serif; background: #f9f6f1; margin: 0; padding: 0; color: #1a1a1a; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #e0dbd2; }
    .header { background: #1a1a1a; padding: 24px 32px; }
    .header h1 { color: #f5f0e8; font-size: 20px; margin: 0; letter-spacing: 0.05em; font-weight: normal; }
    .body { padding: 32px; }
    .body p { line-height: 1.7; margin: 0 0 16px; font-size: 15px; }
    .myth-quote { background: #f5f0e8; border-left: 3px solid #8b6e4e; padding: 14px 18px; border-radius: 4px; margin: 20px 0; font-style: italic; font-size: 15px; color: #3a2e24; }
    .steps { padding-left: 20px; margin: 0 0 16px; }
    .steps li { line-height: 1.7; margin-bottom: 6px; font-size: 15px; }
    .footer { border-top: 1px solid #e0dbd2; padding: 20px 32px; font-size: 13px; color: #888; }
    .footer a { color: #8b6e4e; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Retrocodex</h1>
    </div>
    <div class="body">
      <p>Hi,</p>
      <p>Thanks for submitting a fact to Retrocodex! We received your submission and our team will review it shortly.</p>
      <p><strong>Your submitted myth:</strong></p>
      <div class="myth-quote">${escapeHtml(mythHeader)}</div>
      <p><strong>What happens next:</strong></p>
      <ul class="steps">
        <li>Our team reviews every submission for accuracy and quality.</li>
        <li>If approved, your fact will be published on the site.</li>
        <li>We'll reach out if we have questions or need additional information.</li>
      </ul>
      <p>Reviews typically take 1–2 weeks. We appreciate your contribution to helping people learn the truth behind common myths.</p>
      <p>— The Retrocodex Team</p>
    </div>
    <div class="footer">
      <a href="https://retrocodex.com">retrocodex.com</a>
    </div>
  </div>
</body>
</html>
`.trim();

  return { subject, text, html };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
