import './App.css';
import SignupForm from './features/actions/components/SignupForm';
import TextEditor from './features/actions/components/TextEditor';
import ToggleButton from './features/basic/components/toggle-button';
import Counter from './features/guards/components/counter';
import MusicPlayerButtons from './features/parallel-state/components/music-player-buttons';

/**
 * 계층적 상태 머신: 사용자 프로필 관리 (기본 정보, 재능 정보, 결제 정보 등)
 * 병렬 상태 머신: 실시간 채팅 기능 (메시지 입력 상태와 연결 상태를 동시에 관리)
 * 가드 조건: 결제 프로세스 (잔액 확인 후 결제 진행)
 * 액션: 프로필 업데이트 시 서버에 변경 사항 전송
 * 서비스: 재능 검색 기능 (비동기 API 호출 처리)
 */

function App() {
  return (
    <div>
      <h1>XState 예제</h1>
      <h2>Basic</h2>
      <ToggleButton />
      <hr />
      <h2>Parallel State</h2>
      <MusicPlayerButtons />
      <hr />
      <h2>Guards</h2>
      <Counter />
      <hr />
      <h2>Actions</h2>
      <SignupForm />
      <hr />
      <h2>Text Editor</h2>
      <TextEditor />
    </div>
  );
}

export default App;
