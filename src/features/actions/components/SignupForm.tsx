import { useMachine } from '@xstate/react';
import { FormEvent } from 'react';
import { fromPromise } from 'xstate';
import formMachine from '../form-machine';

interface FormContext {
  data: {
    email?: string;
    password?: string;
  };
}

const SignupForm = () => {
  const [state, send] = useMachine(
    formMachine.provide({
      actions: {
        validateForm: ({ context }) => {
          if (!context.data.email || !context.data.password) {
            throw new Error('모든 필드를 입력해주세요');
          }
        },
      },
      actors: {
        submitForm: fromPromise(async ({ input }) => {
          // 실제 API 호출을 시뮬레이션
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const context = input as FormContext;

          if (!context.data.email || !context.data.password) {
            throw new Error('모든 필드를 입력해주세요');
          }

          if (context.data.email === 'test@test.com') {
            throw new Error('이메일이 이미 존재합니다.');
          }

          console.log('폼 제출 성공:', context.data);
          return context.data;
        }),
      },
    })
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send({ type: 'SUBMIT' });
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    send({ type: 'UPDATE_FIELD', field, value: e.target.value });
  };

  const handleReset = () => {
    send({ type: 'RESET' });
    const form = document.querySelector('form');
    if (form) {
      form.reset();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">이메일</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            onChange={handleInputChange('email')}
            disabled={state.matches('submitting')}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">비밀번호</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            onChange={handleInputChange('password')}
            disabled={state.matches('submitting')}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={state.matches('submitting')}
          >
            {state.matches('submitting') ? '제출 중...' : '가입하기'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="mt-4 w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            초기화
          </button>
        </div>
      </form>

      {state.matches('error') && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          오류가 발생했습니다.
          <button onClick={() => send({ type: 'RETRY' })} className="ml-2 text-red-500 underline">
            다시 시도
          </button>
        </div>
      )}

      {state.matches('success') && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">가입이 완료되었습니다!</div>
      )}
    </div>
  );
};

export default SignupForm;
