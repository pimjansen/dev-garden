import { createCookieSessionStorage } from "react-router";
import { createSessionMiddleware } from "remix-utils/middleware/session";

// Get session secret from environment or use a default for development
const sessionSecret = process.env.SESSION_SECRET || "dev-secret-change-in-production";

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

// Create session middleware that automatically manages the session
export const [sessionMiddleware, getSessionFromContext] = createSessionMiddleware(sessionStorage);
