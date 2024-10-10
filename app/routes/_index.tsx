import {
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useId } from "react";
import { users } from "schema";
import db from "~/db";
import { commitSession, destroySession, getSession } from "~/sessions";

export const meta: MetaFunction = () => {
  return [
    { title: "Home Page | Authetication" },
    { name: "description", content: "This is a basic app for authentication" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  let data = {} as any;

  if (!session.has("userId")) return redirect("/signup");

  data.sessionError = session.get("error");
  const userId = session.get("userId") as string;

  // userId is not present
  if (!useId) {
    return redirect("/signup", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }
  const userData = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .execute();
  
  if (userData.length===0) {
    return redirect("/signup", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }
  data.data = userData[0];

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-col items-center gap-16">Home Page</div>
      <div className="flex flex-col gap-2">
        <span>{loaderData?.data?.name}</span>
        <span>{loaderData?.data?.email}</span>
        {loaderData.error && <div>{loaderData.error}</div>}
      </div>
    </div>
  );
}
