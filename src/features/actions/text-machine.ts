import { setup, fromPromise, assign } from 'xstate';

// 타입 정의
// 상태 머신에서 사용할 컨텍스트와 이벤트 타입을 정의합니다.
type TextContext = {
  value: string;
  committedValue: string;
  error?: string;
  shouldSave?: boolean;
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

export const textMachine = setup({
  types: {
    context: {} as TextContext,
    events: {} as TextEvents,
    output: {} as string,
  },
  actors: {
    // 웹소켓 연결 서비스
    connectWebSocket: fromPromise(async () => {
      await services.connectWebSocket();
    }),
    // 텍스트 저장 서비스
    saveText: fromPromise(async ({ input }: { input: { text: string } }) => {
      const result = await services.saveText(input.text);
      return result;
    }),
  },
  guards: {
    // 입력 값이 변경되었는지 확인하는 가드
    hasChanges: ({ context }) => context.value !== context.committedValue,
    // 변경된 값이 있고 저장해야 하는지 확인하는 가드
    shouldSaveChanges: ({ context }) =>
      context.shouldSave === true && context.value !== context.committedValue,
  },
}).createMachine({
  id: 'textEditor',
  type: 'parallel',
  context: {
    value: '', // 현재 입력 값
    committedValue: '', // 저장된 값
    shouldSave: false, // 저장 여부
  },
  states: {
    input: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            'text.change': {
              target: 'debouncing',
              actions: assign({
                value: ({ event }) => event.value, // 입력 값을 업데이트
                shouldSave: () => false, // 저장 플래그 초기화
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
                shouldSave: () => false,
              }),
              reenter: true, // 입력이 계속되면 상태를 다시 시작
            },
          },
          after: {
            500: [
              {
                target: 'idle',
                guard: 'hasChanges', // 변경 사항이 있을 경우
                actions: [
                  assign({
                    value: ({ context }) => context.value,
                    shouldSave: () => true, // 저장 플래그 설정
                  }),
                ],
              },
              {
                target: 'idle', // 변경 사항이 없으면 바로 idle 상태로 이동
              },
            ],
          },
        },
      },
    },
    // 웹소켓 연결 상태
    connection: {
      initial: 'disconnected',
      states: {
        disconnected: {
          on: {
            'text.focus': 'connecting', // 포커스를 받으면 연결 시도
          },
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
          on: {
            'text.focus': 'connecting', // 다시 포커스를 받으면 재시도
          },
        },
      },
    },
    saving: {
      initial: 'idle',
      states: {
        idle: {
          always: {
            target: 'saving',
            guard: 'shouldSaveChanges', // 저장 플래그가 설정되어 있으면 저장 상태로 이동
          },
        },
        saving: {
          entry: assign({ shouldSave: () => false }), // 저장 후 플래그 초기화
          invoke: {
            src: 'saveText',
            input: ({ context }) => ({
              text: context.value, // 현재 입력 값을 저장
            }),
            onDone: {
              target: 'idle',
              actions: assign({
                committedValue: ({ event }) => event.output, // 저장된 값 업데이트
                error: () => undefined, // 오류 초기화
              }),
            },
            onError: {
              target: 'error',
              actions: assign({
                error: ({ event }) => event.error.message, // 오류 메시지 저장
              }),
            },
          },
        },
        error: {
          on: {
            'text.retry': 'saving', // 재시도하면 다시 저장 시도
          },
        },
      },
    },
  },
});
