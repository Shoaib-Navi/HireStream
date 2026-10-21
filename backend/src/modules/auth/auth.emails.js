import { appLink, renderEmail } from "../../services/emailLayout.js";

const firstName = (user) => user.fullName.split(" ")[0];

export const verificationEmail = (user, token, hours) => ({
  to: user.email,
  subject: "Verify your email address",
  ...renderEmail({
    heading: `Welcome to HireStream, ${firstName(user)}`,
    paragraphs: ["Please confirm that this is your email address."],
    action: { label: "Verify email", url: appLink(`/verify-email?token=${token}`) },
    footnote: `This link expires in ${hours} hours. If you didn't create a HireStream account, you can ignore this email.`,
  }),
});

export const passwordResetEmail = (user, token, minutes) => ({
  to: user.email,
  subject: "Reset your password",
  ...renderEmail({
    heading: "Reset your password",
    paragraphs: [`Hi ${firstName(user)}, we received a request to reset your HireStream password.`],
    action: { label: "Choose a new password", url: appLink(`/reset-password?token=${token}`) },
    footnote: `This link expires in ${minutes} minutes. If you didn't ask for this, you can ignore this email and your password won't change.`,
  }),
});
