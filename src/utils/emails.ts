import Transporter from "./transporter";
import { transporter, url, emailCoolDownTimeinMin } from "../config/config";
import { encodeString } from "./encoding";

export function validationMail(email: string, id: string) {
  Transporter.sendMail({
    to: email,
    from: transporter.auth.user,
    subject: "Validate your email",
    html: `
    <h1>Click the link below to validate your email</h1>
    <a href="${url}/verify/${encodeString(id)}">Click here</a>
    `,
  });
}

export function verifiedMail(email: string, id: string) {
  Transporter.sendMail({
    to: email,
    from: transporter.auth.user,
    subject: "Email verified",
    html: `
    <h1>Your email has been verified</h1>
    `,
  });
}

export function emailCoolDown(time: Date) {
  const mail_sent_cooldown =
    time.getTime() + emailCoolDownTimeinMin * 60 * 1000;
  if (mail_sent_cooldown > Date.now()) {
    return false;
  }
  return true;
}

export function forgotPasswordMail(email: string, id: string) {
  Transporter.sendMail({
    to: email,
    from: transporter.auth.user,
    subject: "Reset Password",
    html: `
    <h1>Click the link below to reset your password</h1>
    <a href="${url}/reset/${encodeString(id)}">Click here</a>
    `,
  });
}
