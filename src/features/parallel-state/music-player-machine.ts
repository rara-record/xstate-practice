import { createMachine } from 'xstate';

/** 여러 상태가 동시에 활성화되어야 할 때가 있습니다. XState는 이를 위해 병렬 상태 머신을 지원합니다. */
const musicPlayerMachine = createMachine({
  id: 'musicPlayer',
  type: 'parallel',
  states: {
    playback: {
      initial: 'stopped',
      states: {
        playing: {
          on: {
            PAUSE: 'paused',
            STOP: 'stopped',
          },
        },
        paused: {
          on: {
            PLAY: 'playing',
            STOP: 'stopped',
          },
        },
        stopped: {
          on: { PLAY: 'playing' },
        },
      },
    },
    volume: {
      initial: 'normal',
      states: {
        muted: {
          on: { UNMUTE: 'normal' },
        },
        normal: {
          on: { MUTE: 'muted' },
        },
      },
    },
  },
});

export default musicPlayerMachine;
