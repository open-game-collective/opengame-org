import { createAccessToken } from "actor-kit/server";
import { z } from "zod";
import { REFRESH_TOKEN_COOKIE_KEY, SESSION_TOKEN_COOKIE_KEY } from "./constants";
import { sendVerificationCode } from "./email";
import { Env } from "./env";
import {
  createNewUserSession,
  createRefreshToken,
  createSessionToken,
  generateVerificationCode,
  getUserIdByEmail,
  linkEmailToUser,
  verifyCode,
  verifyRefreshToken,
  verifySessionToken,
} from "./utils";

// Schema Definitions
const emailCodeSchema = z.object({
  email: z.string().email(),
});

const emailVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

const actorTokenSchema = z.object({
  actorType: z.string(),
  actorId: z.string(),
});

export async function handleNewUser(request: Request, env: Env) {
  const { userId, sessionId, sessionToken, refreshToken } =
    await createNewUserSession({
      secret: env.SESSION_JWT_SECRET,
    });

  return new Response(
    JSON.stringify({
      userId,
      sessionId,
      sessionToken,
      refreshToken,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function handleEmailCode(request: Request, env: Env) {
  const body = await request.json().catch(() => ({}));
  const result = emailCodeSchema.safeParse(body);

  if (!result.success) {
    return new Response(JSON.stringify({ error: "Invalid request format" }), {
      status: 400,
    });
  }

  // Get the user's ID from their session token
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing authorization header" }),
      { status: 401 }
    );
  }

  const sessionToken = authHeader.slice(7);
  const session = await verifySessionToken({
    token: sessionToken,
    secret: env.SESSION_JWT_SECRET,
  });

  if (!session) {
    return new Response(JSON.stringify({ error: "Invalid session token" }), {
      status: 401,
    });
  }

  // Check if email is already linked to another user
  const existingUserId = await getUserIdByEmail(
    result.data.email,
    env.KV_STORAGE
  );
  if (existingUserId && existingUserId !== session.userId) {
    return new Response(
      JSON.stringify({ error: "Email already linked to another account" }),
      { status: 409 }
    );
  }

  const code = await generateVerificationCode({
    email: result.data.email,
    kv: env.KV_STORAGE,
  });

  const sent = await sendVerificationCode({
    email: result.data.email,
    code,
    env,
  });

  if (!sent) {
    return new Response(
      JSON.stringify({ error: "Failed to send verification code" }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Code sent to email",
      expiresIn: 600,
    }),
    { status: 200 }
  );
}

export async function handleEmailVerify(request: Request, env: Env) {
  const body = await request.json().catch(() => ({}));
  const result = emailVerifySchema.safeParse(body);

  if (!result.success) {
    return new Response(JSON.stringify({ error: "Invalid request format" }), {
      status: 400,
    });
  }

  // Get the user's ID from their session token
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing authorization header" }),
      { status: 401 }
    );
  }

  const sessionToken = authHeader.slice(7);
  const session = await verifySessionToken({
    token: sessionToken,
    secret: env.SESSION_JWT_SECRET,
  });

  if (!session) {
    return new Response(JSON.stringify({ error: "Invalid session token" }), {
      status: 401,
    });
  }

  const isValid = await verifyCode({
    email: result.data.email,
    code: result.data.code,
    kv: env.KV_STORAGE,
  });

  if (!isValid) {
    return new Response(JSON.stringify({ error: "Invalid or expired code" }), {
      status: 400,
    });
  }

  // Check if email is already linked to a user
  const existingUserId = await getUserIdByEmail(
    result.data.email,
    env.KV_STORAGE
  );

  if (existingUserId && existingUserId !== session.userId) {
    return new Response(
      JSON.stringify({ error: "Email already linked to another account" }),
      { status: 409 }
    );
  }

  // Link email to user
  await linkEmailToUser(result.data.email, session.userId, env.KV_STORAGE);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function handleRefreshToken(request: Request, env: Env) {
  const body = await request.json().catch(() => ({}));
  const result = refreshTokenSchema.safeParse(body);

  if (!result.success) {
    return new Response(JSON.stringify({ error: "Invalid request format" }), {
      status: 400,
    });
  }

  const payload = await verifyRefreshToken({
    token: result.data.refreshToken,
    secret: env.SESSION_JWT_SECRET,
  });

  if (!payload) {
    return new Response(JSON.stringify({ error: "Invalid refresh token" }), {
      status: 401,
    });
  }

  const { userId } = payload;
  const sessionId = crypto.randomUUID();

  const sessionToken = await createSessionToken({
    userId,
    sessionId,
    secret: env.SESSION_JWT_SECRET,
  });

  const refreshToken = await createRefreshToken({
    userId,
    secret: env.SESSION_JWT_SECRET,
  });

  return new Response(
    JSON.stringify({
      userId,
      sessionToken,
      refreshToken,
    }),
    { status: 200 }
  );
}

export async function handleLogout(request: Request, env: Env) {
  const headers = new Headers();
  headers.set("Location", "/");
  
  headers.append(
    "Set-Cookie",
    `${SESSION_TOKEN_COOKIE_KEY}=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
  headers.append(
    "Set-Cookie",
    `${REFRESH_TOKEN_COOKIE_KEY}=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );

  return new Response(null, {
    status: 302,
    headers
  });
}

export async function handleActorToken(request: Request, env: Env) {
  const body = await request.json().catch(() => ({}));
  const result = actorTokenSchema.safeParse(body);

  if (!result.success) {
    return new Response(JSON.stringify({ error: "Invalid request format" }), {
      status: 400,
    });
  }

  const { actorType, actorId } = result.data;

  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing authorization header" }),
      { status: 401 }
    );
  }

  const sessionToken = authHeader.slice(7); // Remove "Bearer " prefix
  const session = await verifySessionToken({
    token: sessionToken,
    secret: env.SESSION_JWT_SECRET,
  });

  if (!session) {
    return new Response(JSON.stringify({ error: "Invalid session token" }), {
      status: 401,
    });
  }

  // For now, only allow users to get tokens for themselves
  if (actorType === "user" && actorId !== session.userId) {
    return new Response(
      JSON.stringify({ error: "Not authorized for this actor" }),
      { status: 403 }
    );
  }

  const accessToken = await createAccessToken({
    signingKey: env.ACTOR_KIT_SECRET,
    actorId,
    actorType,
    callerId: session.userId,
    callerType: "client",
  });

  return new Response(JSON.stringify({ accessToken }), { status: 200 });
}
