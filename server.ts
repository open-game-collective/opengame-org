export { User } from "./app/user.server";
import { InteractionResponseType, verifyKey } from "discord-interactions";
import { createRequestHandler, logDevReady } from "@remix-run/cloudflare";
import * as build from "@remix-run/dev/server-build";
import { createActorKitRouter } from "actor-kit/worker";
import { WorkerEntrypoint, DurableObject } from "cloudflare:workers";
import { withAuth, type AuthHooks, createProviderAuthRouter, type ProviderAuthHooks } from "@open-game-collective/auth-kit/server";
import type { Env } from "./app/env";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (process.env.NODE_ENV === "development") {
  logDevReady(build);
}

const handleRemixRequest = createRequestHandler(build);

const DISCORD_PUBLIC_KEY =
  "2a6d6b4cfc7b47e74eb0d936130ede7cfd1f88e01acb556c5ed7725172bdae40";
const actorRouter = createActorKitRouter<Env>(["user"]);

// Create a global variable to store the current environment
let currentEnv: Env;

// Define the auth hooks
const authHooks: AuthHooks<Env> = {
  getUserIdByEmail: async (email: string) => {
    return await currentEnv.KV_STORAGE.get(`email:${email}`);
  },

  storeVerificationCode: async (email: string, code: string, expiresAt: Date) => {
    await currentEnv.KV_STORAGE.put(`code:${email}`, code, {
      expirationTtl: 600,
    });
  },

  verifyVerificationCode: async (email: string, code: string) => {
    console.log("[DEBUG] Verifying code for email:", email);
    console.log("[DEBUG] Received verification code:", code);
    
    const storedCode = await currentEnv.KV_STORAGE.get(`code:${email}`);
    console.log("[DEBUG] Stored code from KV:", storedCode);
    
    const isValid = storedCode === code;
    console.log("[DEBUG] Code validation result:", isValid);
    
    if (isValid) {
      // Check if user exists
      const existingUserId = await currentEnv.KV_STORAGE.get(`email:${email}`);
      console.log("[DEBUG] Existing user ID for email:", existingUserId);
      
      if (!existingUserId) {
        // Create new user ID if one doesn't exist
        const newUserId = crypto.randomUUID();
        console.log("[DEBUG] Creating new user with ID:", newUserId);
        
        try {
          await currentEnv.KV_STORAGE.put(`email:${email}`, newUserId);
          console.log("[DEBUG] Successfully stored email-to-userId mapping");
          
          await currentEnv.KV_STORAGE.put(
            `user:${newUserId}`,
            JSON.stringify({
              email,
              created: new Date().toISOString(),
            })
          );
          console.log("[DEBUG] Successfully stored user data");
          
          console.log("[DEBUG] User creation complete for:", newUserId);
        } catch (error) {
          console.error("[ERROR] Failed to create new user:", error);
        }
      } else {
        console.log("[DEBUG] Using existing user ID:", existingUserId);
      }
    } else {
      console.log("[DEBUG] Code verification failed. Expected:", storedCode, "Received:", code);
    }

    return isValid;
  },

  sendVerificationCode: async (email: string, code: string) => {
    // In non-production environments, just log the code
    if (currentEnv.NODE_ENV !== "production") {
      console.log(`[DEBUG] Verification code for ${email}: ${code}`);
      return;
    }

    try {
      // Use SendGrid to send the email
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentEnv.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email }],
            },
          ],
          from: {
            email: "noreply@opengame.org",
            name: "OpenGame",
          },
          subject: "Your OpenGame Verification Code",
          content: [
            {
              type: "text/plain",
              value: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
            },
            {
              type: "text/html",
              value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">Your OpenGame Verification Code</h2>
                  <p style="font-size: 16px;">Your verification code is:</p>
                  <div style="background-color: #f4f4f4; padding: 12px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
                    ${code}
                  </div>
                  <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
                </div>
              `,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error(
          "[ERROR] Failed to send email:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  },

  onNewUser: async (userId: string, email: string) => {
    await currentEnv.KV_STORAGE.put(
      `user:${userId}`,
      JSON.stringify({
        created: new Date().toISOString(),
      })
    );
  },

  onAuthenticate: async (userId: string) => {
    await currentEnv.KV_STORAGE.put(
      `user:${userId}:lastLogin`,
      new Date().toISOString()
    );
  },

  onEmailVerified: async (userId: string, email: string) => {
    console.log("[DEBUG] onEmailVerified called for userId:", userId, "email:", email);
    
    try {
      await currentEnv.KV_STORAGE.put(`user:${userId}:verified`, "true");
      console.log("[DEBUG] Successfully marked user as verified");
      
      await currentEnv.KV_STORAGE.put(`email:${email}`, userId);
      console.log("[DEBUG] Successfully stored email-to-userId mapping");
      
      console.log("[DEBUG] Email verification complete for user:", userId);
    } catch (error) {
      console.error("[ERROR] Failed to complete email verification:", error);
    }
  }
};

// Define provider-specific hooks
const providerHooks: ProviderAuthHooks = {
  // Include base auth hooks
  getUserIdByEmail: authHooks.getUserIdByEmail,
  storeVerificationCode: authHooks.storeVerificationCode,
  verifyVerificationCode: authHooks.verifyVerificationCode,
  sendVerificationCode: authHooks.sendVerificationCode,
  onNewUser: authHooks.onNewUser,
  onAuthenticate: authHooks.onAuthenticate,
  onEmailVerified: authHooks.onEmailVerified,
  
  // Provider-specific hooks
  getGameIdFromApiKey: async (apiKey: string) => {
    try {
      return await currentEnv.KV_STORAGE.get(`apiKey:${apiKey}`);
    } catch (error) {
      console.error("Error getting game ID from API key:", error);
      return null;
    }
  },
  
  storeAccountLink: async (openGameUserId: string, gameId: string, gameUserId: string) => {
    try {
      const linkData = {
        openGameUserId,
        gameId,
        gameUserId,
        linkedAt: new Date().toISOString(),
      };
      
      // Store link in both directions for easy lookup
      await currentEnv.KV_STORAGE.put(
        `accountLink:${openGameUserId}:${gameId}`, 
        JSON.stringify(linkData)
      );
      
      await currentEnv.KV_STORAGE.put(
        `gameLink:${gameId}:${gameUserId}`, 
        openGameUserId
      );
      
      // Return void instead of boolean
    } catch (error) {
      console.error("Error storing account link:", error);
    }
  },
  
  getLinkedAccounts: async (openGameUserId: string) => {
    try {
      // List all account links for this user
      const links = await currentEnv.KV_STORAGE.list({ prefix: `accountLink:${openGameUserId}:` });
      
      // Fetch each link's data
      const linkedAccountsPromises = links.keys.map(async (key) => {
        const linkDataStr = await currentEnv.KV_STORAGE.get(key.name);
        if (!linkDataStr) return null;
        
        const linkData = JSON.parse(linkDataStr);
        
        return {
          gameId: linkData.gameId,
          gameUserId: linkData.gameUserId,
          linkedAt: linkData.linkedAt,
          gameName: currentEnv.GAME_NAMES?.[linkData.gameId] || linkData.gameId,
        };
      });
      
      // Filter out any null values and return
      const results = await Promise.all(linkedAccountsPromises);
      return results.filter((account): account is { 
        gameId: string; 
        gameUserId: string; 
        linkedAt: string; 
        gameName: string; 
      } => account !== null);
    } catch (error) {
      console.error("Error getting linked accounts:", error);
      return [];
    }
  },
  
  removeAccountLink: async (openGameUserId: string, gameId: string) => {
    try {
      // Get the link data first to get the gameUserId
      const linkDataStr = await currentEnv.KV_STORAGE.get(`accountLink:${openGameUserId}:${gameId}`);
      if (!linkDataStr) return false;
      
      const linkData = JSON.parse(linkDataStr);
      
      // Delete both link directions
      await currentEnv.KV_STORAGE.delete(`accountLink:${openGameUserId}:${gameId}`);
      await currentEnv.KV_STORAGE.delete(`gameLink:${gameId}:${linkData.gameUserId}`);
      
      return true;
    } catch (error) {
      console.error("Error removing account link:", error);
      return false;
    }
  }
};

// Create the provider auth router
const providerAuthRouter = createProviderAuthRouter(providerHooks);

// Create the auth handler that includes Remix request handling
const handler = withAuth<Env>(
  async (request, env, { userId, sessionId, sessionToken }) => {
    // Set the current environment for the hooks to use
    currentEnv = env;
    
    console.log("[DEBUG] Handler called with userId:", userId, "sessionId:", sessionId);
    
    try {
      const url = new URL(request.url);
      console.log("[DEBUG] Request URL:", url.pathname);
      
      // Handle auth-related requests
      if (url.pathname.startsWith('/auth/')) {
        // Handle account linking endpoints
        if (url.pathname.startsWith('/auth/linked-accounts')) {
          return await providerAuthRouter.getLinkedAccounts(request);
        } else if (url.pathname.startsWith('/auth/link-token')) {
          return await providerAuthRouter.createAccountLinkToken(request);
        } else if (url.pathname.startsWith('/auth/verify-link')) {
          return await providerAuthRouter.verifyLinkToken(request);
        } else if (url.pathname.startsWith('/auth/confirm-link')) {
          return await providerAuthRouter.confirmLink(request);
        } else if (url.pathname.startsWith('/auth/unlink')) {
          const gameId = new URL(request.url).searchParams.get('gameId');
          if (!gameId) {
            return new Response(JSON.stringify({ error: "Missing gameId parameter" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            });
          }
          return await providerAuthRouter.unlinkAccount(request, gameId);
        }
      }
      
      // Log auth-related headers
      const authHeader = request.headers.get("Authorization");
      console.log("[DEBUG] Authorization header:", authHeader ? "Present" : "Not present");
      
      return await handleRemixRequest(request, {
        env,
        userId,
        sessionId,
        sessionToken,
        requestId: crypto.randomUUID(),
      });
    } catch (error) {
      console.error("[ERROR] Error processing request:", error);
      return new Response("Internal Error", { status: 500 });
    }
  },
  { hooks: authHooks }
);

// Update the Remix Durable Object to use the auth handler
export class Remix extends DurableObject<Env> {
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
  }

  async fetch(request: Request): Promise<Response> {
    return handler(request, this.env);
  }
}

// Main worker entry point
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    console.log("[DEBUG] Worker received request for:", url.pathname);
    
    if (url.pathname.startsWith("/auth/")) {
      console.log("[DEBUG] Processing auth route:", url.pathname);
      console.log("[DEBUG] Request method:", request.method);
      
      // For auth/verify routes, log more details
      if (url.pathname === "/auth/verify") {
        const clonedRequest = request.clone();
        try {
          const body = await clonedRequest.json();
          console.log("[DEBUG] Verify request body:", JSON.stringify(body, null, 2));
        } catch (error) {
          console.error("[ERROR] Failed to parse verify request body:", error);
        }
      }
    }
    
    if (request.url.includes("/api/")) {
      return actorRouter(request, env, ctx);
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

    // Handle all other requests through the Durable Object
    const id = env.REMIX.idFromName("default");
    const remixDO = env.REMIX.get(id);
    return remixDO.fetch(request);
  },
} satisfies ExportedHandler<Env>;
