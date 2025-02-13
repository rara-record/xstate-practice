import { assign, createMachine } from 'xstate';

interface FormContext {
  data: {
    email?: string;
    password?: string;
  };
}

interface FormEvents {
  type: 'SUBMIT' | 'UPDATE_FIELD' | 'RETRY' | 'RESET';
  field?: string;
  value?: string;
}

const formMachine = createMachine({
  id: 'form',
  initial: 'editing',
  context: { data: {} } as FormContext,
  types: {} as {
    context: FormContext;
    events: FormEvents;
  },
  states: {
    editing: {
      on: {
        SUBMIT: {
          target: 'submitting',
          actions: 'validateForm',
        },
        UPDATE_FIELD: {
          actions: assign({
            data: ({ context, event }) => ({
              ...context.data,
              [event.field!]: event.value,
            }),
          }),
        },
        RESET: {
          target: 'editing',
          actions: assign({
            data: () => ({}),
          }),
        },
      },
    },
    submitting: {
      invoke: {
        src: 'submitForm',
        input: ({ context }) => context,
        onDone: {
          target: 'success',
        },
        onError: {
          target: 'error',
        },
      },
    },
    success: {
      on: {
        RESET: {
          target: 'editing',
          actions: assign({
            data: () => ({}),
          }),
        },
      },
    },
    error: {
      on: {
        RETRY: 'editing',
        RESET: {
          target: 'editing',
          actions: assign({
            data: () => ({}),
          }),
        },
      },
    },
  },
});

export default formMachine;
