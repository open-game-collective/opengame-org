export { Remix } from "./app/remix.server";
export { User } from "./app/user.server";
import { InteractionResponseType, verifyKey } from "discord-interactions";

import { logDevReady } from "@remix-run/cloudflare";
import * as build from "@remix-run/dev/server-build";
import { createActorKitRouter } from "actor-kit/worker";
import { WorkerEntrypoint } from "cloudflare:workers";
import {
  handleActorToken,
  handleEmailCode,
  handleEmailVerify,
  handleLogout,
  handleNewUser,
  handleRefreshToken,
  handleOneTimeToken,
} from "./app/auth";
import type { Env } from "./app/env";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (process.env.NODE_ENV === "development") {
  logDevReady(build);
}

const DISCORD_PUBLIC_KEY =
  "2a6d6b4cfc7b47e74eb0d936130ede7cfd1f88e01acb556c5ed7725172bdae40";
const actorRouter = createActorKitRouter<Env>(["user"]);

export const createAuthRouter = () => {
  return async (
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts.length < 2 || pathParts[0] !== "auth") {
      return new Response("Not Found", { status: 404 });
    }

    // Remove 'auth' from path parts
    pathParts.shift();
    const route = pathParts.join("/");

    // All other routes must be POST
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
      });
    }

    try {
      switch (route) {
        case "user":
          return handleNewUser(request, env);
        case "email/code":
          return handleEmailCode(request, env);
        case "email/verify":
          return handleEmailVerify(request, env);
        case "refresh":
          return handleRefreshToken(request, env);
        case "access-token":
          return handleActorToken(request, env);
        case "logout":
          return handleLogout(request, env);
        case "one-time-token":
          return handleOneTimeToken(request, env);
        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
          });
      }
    } catch (error) {
      console.error("Auth router error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
      });
    }
  };
};

const authRouter = createAuthRouter();

export default class Worker extends WorkerEntrypoint<Env> {
  async fetch(request: Request): Promise<Response> {
    if (request.url.includes("/auth/")) {
      return authRouter(request, this.env, this.ctx);
    }

    if (request.url.includes("/api/")) {
      return actorRouter(request, this.env, this.ctx);
    }

    if (request.url.includes("/interactions")) {
      console.log("Received Discord interaction request:", request.url);

      // Log all headers for debugging
      const headers = Object.fromEntries(request.headers.entries());
      console.log("Request headers:", headers);

      // Get the signature and timestamp from the headers
      const signature = request.headers.get("x-signature-ed25519");
      const timestamp = request.headers.get("x-signature-timestamp");
      console.log("Verification details:", {
        signature,
        timestamp,
        publicKey: DISCORD_PUBLIC_KEY,
      });

      if (!signature || !timestamp) {
        console.error("Missing headers:", { signature, timestamp });
        return new Response("Missing signature or timestamp", { status: 401 });
      }

      // Get the raw body as text
      const rawBody = await request.clone().text();
      console.log("Request body:", rawBody);

      try {
        // Verify the signature using hardcoded public key
        const isValidRequest = await verifyKey(
          rawBody,
          signature,
          timestamp,
          DISCORD_PUBLIC_KEY
        );
        console.log("Signature verification result:", isValidRequest);

        if (!isValidRequest) {
          console.error("Invalid signature");
          return new Response("Invalid signature", { status: 401 });
        }

        // Parse the body as JSON
        const body = JSON.parse(rawBody);
        console.log("Parsed body:", body);

        // Handle PING (type 1) interactions
        if (body.type === 1) {
          console.log("Responding to PING with PONG");
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.PONG,
            }),
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }

        // Handle other interaction types here
        return new Response(
          JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "Hello from your bot!",
            },
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("Error processing interaction:", error);
        return new Response("Internal server error", { status: 500 });
      }
    }

    const id = this.env.REMIX.idFromName("default");
    return this.env.REMIX.get(id).fetch(request);
  }
}
