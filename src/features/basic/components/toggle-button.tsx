import { useMachine } from '@xstate/react';
import toggleMachine from '../toggle-machine';

// xtate basic
const ToggleButton = () => {
  const [state, send] = useMachine(toggleMachine);

  return (
    <button onClick={() => send({ type: 'TOGGLE' })}>
      {state.value === 'inactive' ? 'Off' : 'On'}
    </button>
  );
};

export default ToggleButton;
