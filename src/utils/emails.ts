import Transporter from "./transporter";
import { transporter, url, emailCoolDownTimeinMin, expireTimeOTP } from "../config/config";
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
    time.getTime() + emailCoolDownTimeinMin * expireTimeOTP * 1000;
  if (mail_sent_cooldown > Date.now()) {
    return false;
  }
  return true;
}

export function forgotPasswordMail(email: string, otp: string) {
  Transporter.sendMail({
    to: email,
    from: transporter.auth.user,
    subject: "Reset Password",
    html: `
    <h1>Use OTP below to reset your password</h1>
    <h2>OTP: ${otp}</h2>
    <p>OTP will expire in ${expireTimeOTP/60} minutes</p>
    `,
  });
}

export function passwordChangedMail(email: string) {
  Transporter.sendMail({
    to: email,
    from: transporter.auth.user,
    subject: "Password Changed",
    html: `
    <h1>Your password has been changed successfully!</h1>
    `,
  });
}