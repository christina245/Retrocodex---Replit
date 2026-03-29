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

const VERIFICATION_TEMPLATE_ID = "d-4fb365d89cf2451cac18a51f55a5383f";

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  init();
  if (!initialized) return;

  const from = process.env.EMAIL_FROM || "noreply@retrocodex.com";
  const baseUrl = (process.env.APP_URL || "https://theretrocodex.com").replace(/\/$/, "");
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  await sgMail.send({
    to,
    from,
    templateId: VERIFICATION_TEMPLATE_ID,
    dynamicTemplateData: {
      token,
      verifyUrl,
    },
  });
}
