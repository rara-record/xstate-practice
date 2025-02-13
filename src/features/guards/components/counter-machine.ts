import { createMachine, assign } from 'xstate';

// 타입 정의
type CounterContext = {
  count: number;
};

const countMachine = createMachine({
  id: 'counter',
  context: {
    count: 0,
  } as CounterContext,
  on: {
    INC: {
      /** assign: 상태 컨텍스트(context)를 업데이트하는 액션 */
      actions: assign({
        count: ({ context }) => context.count + 1,
      }),
    },
    DEC: {
      guard: ({ context }) => context.count > 0,
      actions: assign({
        count: ({ context }) => context.count - 1,
      }),
    },
    SET: {
      actions: assign({
        count: ({ event }) => event.value,
      }),
    },
  },
});

export default countMachine;
