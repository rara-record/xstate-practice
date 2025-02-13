import { setup, fromPromise, assign, sendTo } from 'xstate';

// 타입 정의
// 상태 머신에서 사용할 컨텍스트와 이벤트 타입을 정의합니다.
type TextContext = {
  value: string;
  committedValue: string;
  error?: string;
};

type TextEvents =
  | { type: 'text.focus' } // 입력 창 포커스 이벤트
  | { type: 'text.change'; value: string } // 입력 값 변경 이벤트
  | { type: 'text.save'; value: string } // 저장 이벤트
  | { type: 'text.retry' }; // 저장 재시도 이벤트

// 서비스 함수들
const services = {
  // 텍스트를 저장하는 모의 API 함수 (실제 서버 호출 대신 사용)
  saveText: async (text: string) => {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          resolve(text); // 90% 확률로 성공
        } else {
          reject(new Error('저장 실패'));
        }
      }, 1000);
    });
    return text;
  },

  // 웹소켓 연결을 모의하는 함수
  connectWebSocket: () => {
    console.log('웹소켓 연결 성공');
    return Promise.resolve();
  },
};

// 공통 액터 정의
const actors = {
  connectWebSocket: fromPromise(async () => {
    await services.connectWebSocket();
  }),
  saveText: fromPromise(async ({ input }: { input: { text: string } }) => {
    const result = await services.saveText(input.text);
    return result;
  }),
} as const;

// 1. 웹소켓 연결 머신
const connectionMachine = setup({
  types: {} as {
    context: { error?: string };
    events: { type: 'text.focus' };
  },
  actors: {
    connectWebSocket: actors.connectWebSocket,
  },
}).createMachine({
  id: 'connection',
  initial: 'disconnected',
  context: { error: undefined },
  states: {
    disconnected: {
      on: { 'text.focus': 'connecting' },
    },
    connecting: {
      invoke: {
        src: 'connectWebSocket',
        onDone: 'connected',
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error.message,
          }),
        },
      },
    },
    connected: {},
    error: {
      on: { 'text.focus': 'connecting' },
    },
  },
});

// 2. 저장 머신
const savingMachine = setup({
  types: {} as {
    context: { value: string; committedValue: string; error?: string };
    events: { type: 'text.save'; value: string } | { type: 'text.retry' };
  },
  actors: {
    saveText: actors.saveText,
  },
}).createMachine({
  id: 'saving',
  initial: 'idle',
  context: {
    value: '',
    committedValue: '',
  },
  states: {
    idle: {
      always: {
        target: 'saving',
        guard: ({ context }) => context.value !== context.committedValue,
      },
    },
    saving: {
      invoke: {
        src: 'saveText',
        input: ({ context }) => ({
          text: context.value,
        }),
        onDone: {
          target: 'idle',
          actions: assign({
            committedValue: ({ event }) => event.output,
            error: () => undefined,
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error.message,
          }),
        },
      },
    },
    error: {
      on: { 'text.retry': 'saving' },
    },
  },
});

// 3. 입력 머신
const inputMachine = setup({
  types: {} as {
    context: { value: string };
    events: { type: 'text.change'; value: string };
  },
}).createMachine({
  id: 'input',
  initial: 'idle',
  context: { value: '' },
  states: {
    idle: {
      on: {
        'text.change': {
          target: 'debouncing',
          actions: assign({
            value: ({ event }) => event.value,
          }),
        },
      },
    },
    debouncing: {
      on: {
        'text.change': {
          target: 'debouncing',
          actions: assign({
            value: ({ event }) => event.value,
          }),
          reenter: true,
        },
      },
      after: {
        500: [
          {
            target: 'idle',
            guard: ({ context }) => context.value !== '',
            actions: assign({
              value: ({ context }) => context.value,
            }),
          },
          {
            target: 'idle',
          },
        ],
      },
    },
  },
});

// 메인 머신
export const textMachine = setup({
  types: {
    context: {} as TextContext,
    events: {} as TextEvents,
    output: {} as string,
  },
  actors,
}).createMachine({
  id: 'textEditor',
  type: 'parallel',
  context: {
    value: '',
    committedValue: '',
  },
  states: {
    input: {
      initial: 'idle',
      states: inputMachine.config.states,
      onDone: {
        actions: sendTo('saving', ({ context }) => ({
          type: 'text.save',
          value: context.value,
        })),
      },
    },
    connection: {
      initial: 'disconnected',
      states: connectionMachine.config.states,
    },
    saving: {
      initial: 'idle',
      states: savingMachine.config.states,
    },
  },
});
