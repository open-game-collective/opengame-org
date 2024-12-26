import type { ActorKitStateMachine } from "actor-kit";
import { setup } from "xstate";
import type { UserEvent, UserInput, UserServerContext } from "./user.types";

export const userMachine = setup({
  types: {
    context: {} as UserServerContext,
    events: {} as UserEvent,
    input: {} as UserInput,
  },
  actions: {},
  guards: {},
}).createMachine({
  id: "user",
  type: "parallel",
  context: ({ input }: { input: UserInput }) => {
    return {
      public: {
        id: input.caller.id,
      },
      private: {
        [input.caller.id]: {},
      },
    };
  },
  states: {
    Initialization: {
      initial: "Ready",
      states: {
        Ready: {},
      },
    },
  },
}) satisfies ActorKitStateMachine<UserEvent, UserInput, UserServerContext>;

export type UserMachine = typeof userMachine;
