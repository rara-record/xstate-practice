import { useMachine } from '@xstate/react';
import MusicPlayerMachine from '../music-player-machine';

/**
 * useMachine 훅을 통해 상태 머신 사용
 * state.matches(): 현재 상태 확인
 * send(): 이벤트를 발생시켜 상태 전환
 */
const MusicPlayerButtons = () => {
  const [state, send] = useMachine(MusicPlayerMachine);

  // 재생 상태와 볼륨 상태를 각각 확인
  const isPlaying = state.matches('playback.playing');
  const isPaused = state.matches('playback.paused');
  const isStopped = state.matches('playback.stopped');
  const isMuted = state.matches('volume.muted');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
      }}
    >
      {/* 재생 컨트롤 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => send({ type: 'PLAY' })} disabled={isPlaying}>
          재생
        </button>
        <button onClick={() => send({ type: 'PAUSE' })} disabled={!isPlaying}>
          일시정지
        </button>
        <button onClick={() => send({ type: 'STOP' })} disabled={isStopped}>
          정지
        </button>
      </div>

      {/* 볼륨 컨트롤 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => send({ type: isMuted ? 'UNMUTE' : 'MUTE' })}>
          {isMuted ? '음소거 해제' : '음소거'}
        </button>
      </div>

      {/* 현재 상태 표시 */}
      <div style={{ marginTop: '20px' }}>
        <p>재생 상태: {isPlaying ? '재생 중' : isPaused ? '일시정지' : '정지'}</p>
        <p>볼륨 상태: {isMuted ? '음소거' : '정상'}</p>
      </div>
    </div>
  );
};

export default MusicPlayerButtons;
