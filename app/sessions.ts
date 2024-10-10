// app/sessions.ts
import { createCookieSessionStorage } from "@remix-run/node"; // or cloudflare/deno

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      cookie: {
        name: "user_session", // Changed from "userId" to a more generic name
        // domain: "remix.run", // Remove or set to your actual domain
        httpOnly: true,
        maxAge: 24 * 60 * 60, // 1 day in seconds
        path: "/",
        sameSite: "lax",
        secrets: ["s3cret1"], // Replace with a strong, environment-specific secret
        secure: process.env.NODE_ENV === "production", // Set secure based on environment
      },
    }
  );

export { getSession, commitSession, destroySession };
