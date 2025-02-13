import { useMachine } from '@xstate/react';
import { textMachine } from '../text-machine';
import { useEffect } from 'react';
import type { StateFrom } from 'xstate';

type TextMachineState = StateFrom<typeof textMachine>;

// 상태 유틸리티 함수들
const getEditorStatus = (state: TextMachineState['value']) => ({
  isTyping: state.input === 'debouncing',
  isSaving: state.saving === 'saving',
  isConnecting: state.connection === 'connecting',
});

// 상태 머신 관련 커스텀 훅
const useTextEditor = () => {
  const [state, send] = useMachine(textMachine);
  const { value, committedValue, error } = state.context;

  const { isTyping, isSaving, isConnecting } = getEditorStatus(state.value);
  const isLoading = isSaving || isConnecting;

  // 상태 메시지 로직
  const getStatusMessage = ({ isTyping, isLoading }: { isTyping: boolean; isLoading: boolean }) => {
    if (isTyping) return '입력 중...';
    if (isLoading) return '요청 처리중...';
    return '';
  };

  // 이벤트 리스너 설정
  useEffect(() => {
    const editor = document.querySelector('.text-box');
    if (!editor) {
      console.warn('텍스트 에디터를 찾을 수 없습니다.');
      return;
    }

    const handleFocus = () => send({ type: 'text.focus' });
    const handleInput = (event: Event) => {
      const target = event.target as HTMLTextAreaElement;
      send({ type: 'text.change', value: target.value });
    };

    editor.addEventListener('input', handleInput);
    editor.addEventListener('focus', handleFocus);

    return () => {
      editor.removeEventListener('input', handleInput);
      editor.removeEventListener('focus', handleFocus);
    };
  }, [send]);

  return {
    value,
    committedValue,
    error,
    statusMessage: getStatusMessage({ isTyping, isLoading }),
    handleRetry: () => send({ type: 'text.retry' }),
  };
};

const TextEditor = () => {
  const { error, committedValue, statusMessage, handleRetry } = useTextEditor();

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xl font-bold">실시간 텍스트 에디터</h2>

      <div className="flex flex-col gap-2">
        <div className="text-sm h-6 flex items-center gap-2">
          <span>{statusMessage}</span>

          {error && (
            <div className="text-red-500">
              오류 발생: {error}
              <button onClick={handleRetry} className="ml-2 text-blue-500 underline">
                재시도
              </button>
            </div>
          )}
        </div>

        <textarea
          className="text-box min-w-[400px] min-h-[200px] p-2 border rounded resize-none"
          placeholder="텍스트를 입력하세요..."
        />

        <div>저장: {committedValue}</div>
      </div>
    </div>
  );
};

export default TextEditor;
