import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

// Emails are sent while the request waits, so a stalled mail server must fail fast
// instead of holding the request open (nodemailer's own defaults run to minutes)
const SMTP_TIMEOUTS = { connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000 };

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
    ...SMTP_TIMEOUTS,
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
