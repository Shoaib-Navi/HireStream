import { useEffect } from "react";
import { APP_NAME } from "@/config/env";

const DEFAULT_TITLE = `${APP_NAME} — Find your next job`;

// Sets the tab title, and the meta description when a page has a more specific one
export const useDocumentTitle = (title, description) => {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : DEFAULT_TITLE;
  }, [title]);

  useEffect(() => {
    if (!description) return;

    const meta = document.querySelector('meta[name="description"]');
    if (!meta) return;

    const original = meta.getAttribute("content");
    meta.setAttribute("content", description);
    return () => meta.setAttribute("content", original);
  }, [description]);
};
