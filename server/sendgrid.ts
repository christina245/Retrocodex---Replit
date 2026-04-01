import sgMail from "@sendgrid/mail";

let initialized = false;

function init() {
  if (initialized) return;
  const key = process.env.SENDGRID_API_KEY;
  if (!key) {
    console.warn("[sendgrid] SENDGRID_API_KEY not set — emails will not be sent.");
    return;
  }
  sgMail.setApiKey(key);
  initialized = true;
}

const FROM = () => process.env.EMAIL_FROM || "noreply@retrocodex.com";
const BASE_URL = () => (process.env.APP_URL || "https://theretrocodex.com").replace(/\/$/, "");

const VERIFICATION_TEMPLATE_ID          = "d-4fb365d89cf2451cac18a51f55a5383f";
const SUBMISSION_CONFIRMATION_TEMPLATE_ID = "d-387d05ac44ac453f81b2ac9e8de498db";
const SUBMISSION_REVIEWING_TEMPLATE_ID  = "d-4aace1bea41145ec8e91078c654d8dcc";
const SUBMISSION_PUBLISHED_TEMPLATE_ID  = "d-d6cf98bb71024e23bc6768e3cc4bd7e6";
const FACT_UPDATE_TEMPLATE_ID           = "d-194e0c5efa484f96bf2314c4afc77658";

interface SubmissionFields {
  mythHeader: string;
  mythDetails: string;
  truthHeader: string;
  truthDetails: string;
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  init();
  if (!initialized) return;
  const verifyUrl = `${BASE_URL()}/api/auth/verify-email?token=${token}`;
  await sgMail.send({
    to,
    from: FROM(),
    templateId: VERIFICATION_TEMPLATE_ID,
    dynamicTemplateData: { token, verifyUrl },
  });
}

export async function sendSubmissionConfirmationEmail(to: string, fields: SubmissionFields): Promise<void> {
  init();
  if (!initialized) return;
  await sgMail.send({
    to,
    from: FROM(),
    templateId: SUBMISSION_CONFIRMATION_TEMPLATE_ID,
    dynamicTemplateData: fields,
  });
}

export async function sendSubmissionReviewingEmail(to: string, fields: SubmissionFields): Promise<void> {
  init();
  if (!initialized) return;
  await sgMail.send({
    to,
    from: FROM(),
    templateId: SUBMISSION_REVIEWING_TEMPLATE_ID,
    dynamicTemplateData: fields,
  });
}

export async function sendSubmissionPublishedEmail(to: string, fields: SubmissionFields & { factUrl: string }): Promise<void> {
  init();
  if (!initialized) return;
  await sgMail.send({
    to,
    from: FROM(),
    templateId: SUBMISSION_PUBLISHED_TEMPLATE_ID,
    dynamicTemplateData: fields,
  });
}

export async function sendFactUpdateEmail(
  to: string,
  data: { factMythHeader: string; factUrl: string; updatesHtml: string },
): Promise<void> {
  init();
  if (!initialized) return;
  await sgMail.send({
    to,
    from: FROM(),
    templateId: FACT_UPDATE_TEMPLATE_ID,
    dynamicTemplateData: data,
  });
}

export function buildFactUrl(slug: string): string {
  return `${BASE_URL()}/fact/${slug}`;
}
