import { useEffect } from "react";
import { APP_NAME } from "@/config/env";

export const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : `${APP_NAME} — Find your next job`;
  }, [title]);
};
