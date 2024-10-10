import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"; 
import { json, redirect } from "@remix-run/node"; 
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getSession, commitSession } from "../sessions";
import db from "~/db";
import { users } from "schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  // session is present
  if (session.has("userId")) return redirect("/");

  const data = { error: session.get("error") };

  // console.log("session", session.has("userId"));
  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}


export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString().trim() || "";
  const name = formData.get("name")?.toString().trim() || "";

  const errors= {} as { email: string; password: string; name: string };

  // Form Validation
  if (name.length < 1) errors.name = "Name is required";
  if (!email.includes("@")) errors.email = "Invalid email address";
  if (password.length < 6)
    errors.password = "Short password";

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  try {
    //user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .execute();

    if (existingUser.length > 0) {
      errors.email = "User already exists";
      return json({ errors }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserting new user to DB
    const insertedUsers = await db
      .insert(users)
      .values({ name, email, password: hashedPassword })
      .returning();

    const newUser = insertedUsers[0];

    // set userId 
    session.set("userId", newUser.id.toString());

    // Commit the session and redirect to the homepage
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    console.error("Error during user signup:", error);
    return json(
      { errors: { general: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }
}

export default function Signup() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData:any = useActionData<typeof action>();
  console.log(loaderData);

  return (
    <section className="flex h-screen w-full border-4">
      <div className="flex flex-col max-w-xs mx-auto gap-5 w-full">
        <h2 className="font-bold text-2xl text-gray-700 mt-20">Signup Form</h2>

        <Form method="post" className="flex gap-5 flex-col w-full">
          <div>
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="font-semibold">
                Name
              </label>
              <input
                type="text"
                className="border border-blue-600 outline-none px-2 py-1"
                id="name"
                name="name"
              />
            </div>
            {actionData?.errors?.name ? (
              <em className="text-red-600">{actionData?.errors?.name}</em>
            ) : null}
          </div>

          <div>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="font-semibold">
                Email address
              </label>
              <input
                type="email"
                name="email"
                className="border border-blue-600 outline-none px-2 py-1"
                id="email"
              />
            </div>
            {actionData?.errors?.email ? (
              <em className="text-red-600">{actionData?.errors.email}</em>
            ) : null}
          </div>

          <div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="font-semibold">
                Password
              </label>
              <input
                type="password"
                className="border border-blue-600 outline-none px-2 py-1"
                id="password"
                name="password"
              />
            </div>
            {actionData?.errors?.password ? (
              <em className="text-red-600">{actionData?.errors.password}</em>
            ) : null}
          </div>

          <button type="submit">Sign Up</button>
        </Form>
      </div>
    </section>
  );
}
