// pages/History.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api.js';
import QuestionImage from '../components/QuestionImage.jsx';

export default function History() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null); // attemptId currently expanded, or null

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/quiz/history');
        if (cancelled) return;
        setAttempts(res.data.data.attempts);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Failed to load history');
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Your History</h1>

      {status === 'loading' && <p className="text-slate-600 dark:text-slate-400">Loading…</p>}

      {status === 'error' && (
        <p className="text-red-600">Something went wrong: {error}</p>
      )}

      {status === 'ready' && attempts.length === 0 && (
        <div className="space-y-3">
          <p>You haven't taken any quizzes yet.</p>
          <Link
            to="/quiz"
            className="inline-block px-4 py-2 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Start your first quiz
          </Link>
        </div>
      )}

      {status === 'ready' && attempts.length > 0 && (
        <ul className="space-y-2">
          {attempts.map((a) => (
            <AttemptRow
              key={a._id}
              attempt={a}
              isExpanded={expanded === a._id}
              onToggle={() => setExpanded(expanded === a._id ? null : a._id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function AttemptRow({ attempt, isExpanded, onToggle }) {
  const { score, total, createdAt, answers } = attempt;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const when = new Date(createdAt).toLocaleString();

  return (
    <li className="border border-slate-200 dark:border-slate-700 rounded">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <div>
          <p className="font-medium">
            {score} / {total} <span className="text-slate-500">({pct}%)</span>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{when}</p>
        </div>
        <span aria-hidden="true" className="text-slate-400">
          {isExpanded ? '▾' : '▸'}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-3">
          {answers.map((ans, i) => (
            <AttemptAnswer key={i} index={i + 1} answer={ans} />
          ))}
        </div>
      )}
    </li>
  );
}

function AttemptAnswer({ index, answer }) {
  const { question, selectedAnswer, isCorrect } = answer;

  // Defensive: the question may have been deleted by an admin after the
  // attempt was saved. The /quiz/history endpoint returns question: null
  // in that case. Show a graceful placeholder.
  if (!question) {
    return (
      <div className="border-l-2 border-slate-200 dark:border-slate-700 pl-3 text-sm text-slate-500">
        {index}. (Question no longer exists) — your answer: option {selectedAnswer + 1}
        {isCorrect ? ' ✓' : ' ✗'}
      </div>
    );
  }

  const { text, options, correctIndex, imageUrl } = question;

  return (
    <div className="border-l-2 border-slate-200 dark:border-slate-700 pl-3">
      <div className="flex items-start gap-2 mb-1">
        <span
          aria-hidden="true"
          className={`inline-block w-5 text-center font-semibold ${
            isCorrect ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isCorrect ? '✓' : '✗'}
        </span>
        <p className="text-sm font-medium flex-1">
          {index}. {text}
        </p>
      </div>

      {imageUrl && (
        <div className="mb-2 ml-7">
          <QuestionImage src={imageUrl} size="sm" />
        </div>
      )}

      <ul className="text-sm space-y-0.5 ml-7">
        {options.map((opt, idx) => {
          const isUserChoice = idx === selectedAnswer;
          const isCorrectOption = idx === correctIndex;

          let className = 'text-slate-600 dark:text-slate-400';
          let label = opt;

          if (isCorrectOption && isUserChoice) {
            className = 'text-green-700 dark:text-green-400 font-medium';
            label = `${opt} — your answer ✓`;
          } else if (isCorrectOption) {
            className = 'text-green-700 dark:text-green-400 font-medium';
            label = `${opt} — correct answer`;
          } else if (isUserChoice) {
            className = 'text-red-700 dark:text-red-400 line-through';
            label = `${opt} — your answer ✗`;
          }

          return <li key={idx} className={className}>{label}</li>;
        })}
      </ul>
    </div>
  );
}