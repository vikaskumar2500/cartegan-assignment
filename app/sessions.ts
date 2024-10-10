import { createCookieSessionStorage } from "@remix-run/node"; 
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
        name: "user_session",
        httpOnly: true,
        maxAge: 24 * 60 * 60, // 1 day in seconds
        path: "/",
        sameSite: "lax",
        secrets: ["s3cret1"],
        secure: process.env.NODE_ENV === "production", // true only in production
      },
    }
  );

export { getSession, commitSession, destroySession };
