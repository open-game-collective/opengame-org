import { z } from "zod";

export const SessionClientEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("START_GAME"),
  }),
  z.object({
    type: z.literal("CONNECT_WALLET"),
  }),
  z.object({
    type: z.literal("CREATE_ACCOUNT"),
  }),
]);

export const SessionServiceEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("SYNC"),
  }),
]);

export const SessionInputPropsSchema = z.object({
  requestId: z.string(),
});
