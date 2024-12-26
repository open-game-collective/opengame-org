import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { CallerSnapshotFrom } from "actor-kit";
import { createAccessToken, createActorFetch } from "actor-kit/server";
import { Navigation } from "./components/Navigation";
import type { UserMachine } from "./user.machine";

import { useState } from "react";
import styles from "./styles.css";
import { UserProvider } from "./user.context";

// Update the UserSnapshot type to match the machine's structure
type UserSnapshot = CallerSnapshotFrom<UserMachine>;

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const fetchUser = createActorFetch<UserMachine>({
    actorType: "user",
    host: context.env.ACTOR_KIT_HOST,
  });

  const accessToken = await createAccessToken({
    signingKey: context.env.ACTOR_KIT_SECRET,
    actorId: context.userId,
    actorType: "user",
    callerId: context.userId,
    callerType: "client",
  });
  const payload = await fetchUser({
    actorId: context.userId,
    accessToken,
    input: {
      url: request.url,
    },
  });

  return json({
    userId: context.userId,
    accessToken,
    payload,
    host: context.env.ACTOR_KIT_HOST,
    NODE_ENV: context.env.NODE_ENV,
  });
}

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userId, payload, accessToken, host } = useLoaderData<typeof loader>();

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <UserProvider
        actorId={userId}
        accessToken={accessToken}
        host={host}
        checksum={payload.checksum}
        initialSnapshot={payload.snapshot}
      >
        <body className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="min-h-full">
            <Navigation
              userEmail="user@example.com"
              isOpen={isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
            />
            <div
              className={`
            lg:pl-64
            flex flex-col min-h-full
            transition-transform duration-300 ease-in-out
            ${
              isMobileMenuOpen
                ? "translate-x-64 lg:translate-x-0"
                : "translate-x-0"
            }
          `}
            >
              <Outlet />
            </div>
          </div>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </UserProvider>
    </html>
  );
}
