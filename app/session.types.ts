import type {
  ActorKitSystemEvent,
  BaseActorKitEvent,
  WithActorKitEvent,
  WithActorKitInput,
} from "actor-kit";
import { z } from "zod";
import { Env } from "./env";
import {
  SessionInputPropsSchema,
  SessionServiceEventSchema,
} from "./session.schemas";

export type SessionClientEvent =
  | { type: "START_GAME"; gameId: string }
  | { type: "CONNECT_WALLET"; publicKey: string };
export type SessionServiceEvent = z.infer<typeof SessionServiceEventSchema>;
export type SessionInput = WithActorKitInput<
  z.infer<typeof SessionInputPropsSchema>,
  Env
>;

type SessionPublicContext = {
  userId: string;
};

type SessionPrivateContext = {
  keypair?: string;
};

export type SessionServerContext = {
  public: SessionPublicContext;
  private: Record<string, SessionPrivateContext>;
};
export type SessionEvent = (
  | WithActorKitEvent<SessionClientEvent, "client">
  | WithActorKitEvent<SessionServiceEvent, "service">
  | ActorKitSystemEvent
) &
  BaseActorKitEvent<Env>;
