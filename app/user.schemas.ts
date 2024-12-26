import { z } from "zod";

export const UserClientEventSchema = z.discriminatedUnion("type", [
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

export const UserServiceEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("SYNC"),
  }),
]);

export const UserInputPropsSchema = z.object({
  requestId: z.string(),
});
