import type {
  ActorKitSystemEvent,
  BaseActorKitEvent,
  WithActorKitEvent,
  WithActorKitInput,
} from "actor-kit";
import { z } from "zod";
import { Env } from "./env";
import { UserInputPropsSchema, UserServiceEventSchema } from "./user.schemas";

export type UserClientEvent =
  | { type: "START_GAME"; gameId: string }
  | { type: "CONNECT_WALLET"; publicKey: string };
export type UserServiceEvent = z.infer<typeof UserServiceEventSchema>;
export type UserInput = WithActorKitInput<
  z.infer<typeof UserInputPropsSchema>,
  Env
>;

type UserPublicContext = {
  id: string;
};

type UserPrivateContext = {
  keypair?: string;
  email?: string;
};

export type UserServerContext = {
  public: UserPublicContext;
  private: Record<string, UserPrivateContext>;
};
export type UserEvent = (
  | WithActorKitEvent<UserClientEvent, "client">
  | WithActorKitEvent<UserServiceEvent, "service">
  | ActorKitSystemEvent
) &
  BaseActorKitEvent<Env>;
