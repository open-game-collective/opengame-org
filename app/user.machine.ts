import type { ActorKitStateMachine } from "actor-kit";
import { produce } from "immer";
import { assign, setup } from "xstate";
import type { UserEvent, UserInput, UserServerContext } from "./user.types";

export const userMachine = setup({
  types: {
    context: {} as UserServerContext,
    events: {} as UserEvent,
    input: {} as UserInput,
  },
  actions: {
    setEmail: assign({
      private: ({ context, event }) =>
        produce(context.private, (draft) => {
          if (event.type === "VERIFY_EMAIL") {
            draft[event.caller.id].email = event.email;
          }
        }),
    }),
  },
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
        EmailVerification: {
          initial: "Incomplete",
          states: {
            Incomplete: {
              on: {
                VERIFY_EMAIL: {
                  target: "Complete",
                  actions: ["setEmail"],
                },
              },
            },
            Complete: {},
          },
        },
        Ready: {},
      },
    },
  },
}) satisfies ActorKitStateMachine<UserEvent, UserInput, UserServerContext>;

export type UserMachine = typeof userMachine;
