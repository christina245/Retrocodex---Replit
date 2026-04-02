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
const PASSWORD_RESET_TEMPLATE_ID            = "d-4ea15870bfe24e59a38e497deaac8be4";
const NEW_FOLLOWER_TEMPLATE_ID          = "d-8e043d858268484e843ca3099904cda0";
const NEW_COMMENT_TEMPLATE_ID           = "d-f3ab4f4127ab4f16bfb00808ce987437";
const NEW_REPLY_TEMPLATE_ID             = "d-cfa7337db2954836ba7a8c5e35c1b597";

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

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  init();
  if (!initialized) return;
  await sgMail.send({
    to,
    from: FROM(),
    templateId: PASSWORD_RESET_TEMPLATE_ID,
    dynamicTemplateData: { resetUrl },
  });
}

export async function sendNewFollowerEmail(
  to: string,
  data: { followerUsername: string; followerAvatarUrl: string | null; followerProfileUrl: string; dashboardUrl: string },
): Promise<void> {
  init();
  if (!initialized) return;
  await sgMail.send({
    to,
    from: FROM(),
    templateId: NEW_FOLLOWER_TEMPLATE_ID,
    dynamicTemplateData: data,
  });
}

export async function sendNewCommentEmail(
  to: string,
  data: { commenterUsername: string; commenterAvatarUrl: string | null; factMythHeader: string; commentBody: string; factUrl: string; dashboardUrl: string },
): Promise<void> {
  init();
  if (!initialized) return;
  await sgMail.send({
    to,
    from: FROM(),
    templateId: NEW_COMMENT_TEMPLATE_ID,
    dynamicTemplateData: data,
  });
}

export async function sendNewReplyEmail(
  to: string,
  data: { replierUsername: string; replierAvatarUrl: string | null; factMythHeader: string; replyBody: string; parentBody: string; factUrl: string; dashboardUrl: string },
): Promise<void> {
  init();
  if (!initialized) return;
  await sgMail.send({
    to,
    from: FROM(),
    templateId: NEW_REPLY_TEMPLATE_ID,
    dynamicTemplateData: data,
  });
}

export function buildFactUrl(slug: string): string {
  return `${BASE_URL()}/fact/${slug}`;
}

export function buildDashboardUrl(): string {
  return `${BASE_URL()}/dashboard`;
}

export function buildProfileUrl(username: string): string {
  return `${BASE_URL()}/profile/${encodeURIComponent(username)}`;
}
