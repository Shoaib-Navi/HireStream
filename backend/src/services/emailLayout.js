import { env } from "../config/env.js";

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

export const appLink = (path) => `${env.appUrl}${path}`;

// Builds a simple branded email in both HTML and plain text.
// paragraphs are plain strings (escaped here); items is an optional list of { title, detail, url } links;
// action is an optional { label, url } button.
export const renderEmail = ({ heading, paragraphs = [], items = [], action, footnote }) => {
  const text = [
    heading,
    ...paragraphs,
    ...items.map((item) => [item.title, item.detail, item.url].filter(Boolean).join("\n")),
    action && `${action.label}: ${action.url}`,
    footnote,
  ]
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
          ${items
            .map(
              (item) =>
                `<p style="margin:0;padding:14px 0;border-top:1px solid #e6e6e3;"><a href="${escapeHtml(item.url)}" style="font-size:15px;font-weight:600;color:#111111;text-decoration:none;">${escapeHtml(item.title)}</a>${item.detail ? `<br><span style="font-size:13px;color:#777777;">${escapeHtml(item.detail)}</span>` : ""}</p>`,
            )
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
