import { createAction } from "@reduxjs/toolkit";

// Kept in their own module so the API layer can dispatch them without a circular import

// The API answered 401: the session cookie is missing or expired
export const sessionExpired = createAction("auth/sessionExpired");

export const loggedOut = createAction("auth/loggedOut");
