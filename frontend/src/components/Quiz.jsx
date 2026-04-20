// components/Quiz.jsx
import { useEffect } from 'react';
import { useQuiz } from '../context/QuizContext.jsx';

export default function Quiz() {
  const { state, startQuiz, select, commitAnswer, submitQuiz, reset } = useQuiz();

  useEffect(() => {
    return () => reset();
  }, [reset]);

  // Auto-submit when every question has a committed answer.
  useEffect(() => {
    if (
      state.status === 'active' &&
      state.questions.length > 0 &&
      Object.keys(state.answers).length === state.questions.length
    ) {
      submitQuiz();
    }
  }, [state.status, state.questions.length, state.answers, submitQuiz]);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Quiz</h1>
      {renderByStatus(state, { startQuiz, select, commitAnswer, reset })}
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
      return (
        <ActiveScreen
          state={state}
          onSelect={actions.select}
          onConfirm={actions.commitAnswer}
        />
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
        Pick an option and click Next to confirm — once confirmed, you can't change your answer.
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

function ActiveScreen({ state, onSelect, onConfirm }) {
  if (state.currentIndex >= state.questions.length) {
    return <LoadingScreen message="Wrapping up…" />;
  }

  const question = state.questions[state.currentIndex];
  const isLast = state.currentIndex === state.questions.length - 1;
  const hasSelection = state.selection !== null;

  return (
    <div className="space-y-4">
      <Progress current={state.currentIndex + 1} total={state.questions.length} />
      <QuestionCard
        question={question}
        selectedIndex={state.selection}
        onSelect={onSelect}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!hasSelection}
          className="px-4 py-2 rounded bg-slate-900 text-white disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-100 dark:text-slate-900"
        >
          {isLast ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
}

function Progress({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
        Question {current} of {total}
      </p>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded">
        <div
          className="h-2 bg-slate-900 dark:bg-slate-100 rounded transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuestionCard({ question, selectedIndex, onSelect }) {
  return (
    <div className="space-y-4">
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt=""
          className="max-h-64 rounded border border-slate-200 dark:border-slate-700"
        />
      )}

      <h2 className="text-lg font-medium">{question.text}</h2>

      <div className="grid gap-2">
        {question.options.map((option, idx) => {
          const isSelected = selectedIndex === idx;
          const baseClass = 'text-left px-3 py-2 rounded border transition';
          const stateClass = isSelected
            ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
            : 'border-slate-300 hover:border-slate-900 dark:border-slate-600 dark:hover:border-slate-100';

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={`${baseClass} ${stateClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}