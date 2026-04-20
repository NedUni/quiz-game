// components/Quiz.jsx
import { useEffect } from 'react';
import { useQuiz } from '../context/QuizContext.jsx';

export default function Quiz() {
  const { state, startQuiz, reset } = useQuiz();

  // When the user navigates AWAY from /quiz, reset state. This avoids the
  // confusing "I started a quiz, went to leaderboard, came back, where am I?"
  // problem. A fresh visit to /quiz should always start clean.
  useEffect(() => {
    return () => reset();
  }, [reset]);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Quiz</h1>
      {renderByStatus(state, { startQuiz, reset })}
    </section>
  );
}

function renderByStatus(state, actions) {
  switch (state.status) {
    case 'idle':
      return <IdleScreen onStart={actions.startQuiz} />;
    case 'loading':
      return <LoadingScreen message="Loading questions…" />;
    case 'error':
      return <ErrorScreen error={state.error} onRetry={actions.startQuiz} />;
    case 'active':
      // Properly built in substep 7c. For now, prove the state transition worked.
      return (
        <div className="space-y-2">
          <p className="text-green-600">
            Loaded {state.questions.length} questions. Active gameplay UI coming in 7c.
          </p>
          <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-x-auto">
            {JSON.stringify(
              { count: state.questions.length, sessionToken: state.sessionToken?.slice(0, 20) + '…' },
              null,
              2
            )}
          </pre>
        </div>
      );
    case 'submitting':
      return <LoadingScreen message="Submitting your answers…" />;
    case 'complete':
      return <p>Quiz complete. Result UI coming in 7d.</p>;
    default:
      return <p>Unknown state.</p>;
  }
}

// ----- Sub-screens -----

function IdleScreen({ onStart }) {
  return (
    <div className="space-y-4">
      <p>
        Test your knowledge with a quiz of 6–10 questions. You'll get one point per correct answer.
        Once you select an answer, you can't change it — so think before you click.
      </p>
      <button
        onClick={onStart}
        className="px-4 py-2 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
      >
        Start Quiz
      </button>
    </div>
  );
}

function LoadingScreen({ message }) {
  return <p className="text-slate-600 dark:text-slate-400">{message}</p>;
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div className="space-y-3">
      <p className="text-red-600">Something went wrong: {error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600"
      >
        Try again
      </button>
    </div>
  );
}