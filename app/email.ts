import sgMail from "@sendgrid/mail";
import { Env } from "./env";

const isDevelopment = process.env.NODE_ENV === "development";
const FROM_EMAIL = "noreply@opengame.org";

export async function sendVerificationCode({
  email,
  code,
  env,
}: {
  email: string;
  code: string;
  env: Env;
}) {
  // In development, just log the email
  if (isDevelopment) {
    console.log("Development Mode: Would send email", {
      to: email,
      from: FROM_EMAIL,
      code,
      subject: "Your OpenGame Verification Code",
    });
    return true;
  }

  sgMail.setApiKey(env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: "Your OpenGame Verification Code",
    text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
    html: `
      <h1>Your OpenGame Verification Code</h1>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'response' in e) {
      console.error("SendGrid API Error:", {
        status: (e as any).code,
        body: (e as any).response.body,
      });
    } else {
      console.error("Failed to send email:", e);
    }
    return false;
  }
}
