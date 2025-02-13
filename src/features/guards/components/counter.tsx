import countMachine from './counter-machine';
import { useMachine } from '@xstate/react';
const Counter = () => {
  const [state, send] = useMachine(countMachine);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => send({ type: 'INC' })}>INC</button>
        <button onClick={() => send({ type: 'DEC' })}>DEC</button>
        <button onClick={() => send({ type: 'SET', value: 20 })}>SET</button>
      </div>
      <div>현재 상태: {state.context.count}</div>
    </div>
  );
};

export default Counter;
