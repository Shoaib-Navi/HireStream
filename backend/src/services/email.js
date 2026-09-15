import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

// Emails "sent" while running tests, so tests can read links and tokens
export const testOutbox = [];

export const isEmailEnabled = () => Boolean(env.email.smtp.host);

const getTransporter = () => {
  const { host, port, secure, user, pass } = env.email.smtp;
  transporter ??= nodemailer.createTransport({
    host,
    port,
    secure,
    ...(user && { auth: { user, pass } }),
  });
  return transporter;
};

// Never throws: a failed email must not fail the request that triggered it.
// Returns whether the email was handed to the mail server.
export const sendEmail = async ({ to, subject, text, html }) => {
  const message = { from: env.email.from, to, subject, text, html };

  if (env.isTest) {
    testOutbox.push(message);
    return true;
  }
  if (!isEmailEnabled()) {
    if (!env.isProduction) console.info(`[email] To: ${to}\nSubject: ${subject}\n\n${text}\n`);
    return false;
  }

  try {
    await getTransporter().sendMail(message);
    return true;
  } catch (error) {
    console.error(`Email "${subject}" could not be sent:`, error.message);
    return false;
  }
};
