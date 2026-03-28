import sgMail from "@sendgrid/mail";

let initialized = false;

function init() {
  if (initialized) return;
  const key = process.env.SENDGRID_API_KEY;
  if (!key) {
    console.warn("[sendgrid] SENDGRID_API_KEY not set — verification emails will not be sent.");
    return;
  }
  sgMail.setApiKey(key);
  initialized = true;
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  init();
  if (!initialized) return;

  const baseUrl = process.env.APP_URL || "https://retrocodex.com";
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your Retrocodex email</title>
  <style>
    body { font-family: Georgia, serif; background: #f9f6f1; margin: 0; padding: 0; color: #1a1a1a; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #e0dbd2; }
    .header { background: #1a1a1a; padding: 24px 32px; }
    .header h1 { color: #f5f0e8; font-size: 20px; margin: 0; letter-spacing: 0.05em; font-weight: normal; }
    .body { padding: 32px; }
    .body p { line-height: 1.7; margin: 0 0 16px; font-size: 15px; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: #ff5353; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-family: 'Public Sans', sans-serif; font-weight: 700; letter-spacing: 0.02em; }
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
      <p>Thanks for joining Retrocodex! Please verify your email address to unlock saving facts, voting on polls, and more.</p>
      <div class="btn-wrap">
        <a href="${verifyUrl}" class="btn">Verify email now</a>
      </div>
      <p>This link expires in 24 hours. If you didn't create a Retrocodex account, you can safely ignore this email.</p>
      <p>— The Retrocodex Team</p>
    </div>
    <div class="footer">
      <a href="https://retrocodex.com">retrocodex.com</a>
    </div>
  </div>
</body>
</html>`.trim();

  const text = [
    "Hi,",
    "",
    "Thanks for joining Retrocodex! Please verify your email address by clicking the link below:",
    "",
    verifyUrl,
    "",
    "This link expires in 24 hours.",
    "",
    "— The Retrocodex Team",
  ].join("\n");

  const from = process.env.EMAIL_FROM || "noreply@retrocodex.com";

  await sgMail.send({
    to,
    from,
    subject: "Verify your Retrocodex email",
    text,
    html,
  });
}
