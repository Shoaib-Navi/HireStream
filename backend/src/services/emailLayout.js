import { env } from "../config/env.js";

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

export const appLink = (path) => `${env.appUrl}${path}`;

// Builds a simple branded email in both HTML and plain text.
// paragraphs are plain strings (escaped here); action is an optional { label, url } button.
export const renderEmail = ({ heading, paragraphs = [], action, footnote }) => {
  const text = [heading, ...paragraphs, action && `${action.label}: ${action.url}`, footnote]
    .filter(Boolean)
    .join("\n\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#f4f4f2;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;">
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 24px;font-size:18px;font-weight:700;letter-spacing:-0.02em;">hirestream</p>
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;">${escapeHtml(heading)}</h1>
          ${paragraphs
            .map((paragraph) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3a3a3a;white-space:pre-line;">${escapeHtml(paragraph)}</p>`)
            .join("")}
          ${
            action
              ? `<p style="margin:24px 0;"><a href="${escapeHtml(action.url)}" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">${escapeHtml(action.label)}</a></p>`
              : ""
          }
          ${footnote ? `<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#777777;">${escapeHtml(footnote)}</p>` : ""}
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { text, html };
};
