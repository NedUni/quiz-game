// components/Leaderboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Leaderboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/quiz/leaderboard');
        if (cancelled) return;
        setEntries(res.data.data.leaderboard);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Failed to load leaderboard');
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Best score per user</p>
      </div>

      {status === 'loading' && <p className="text-slate-600 dark:text-slate-400">Loading…</p>}

      {status === 'error' && <p className="text-red-600">Something went wrong: {error}</p>}

      {status === 'ready' && entries.length === 0 && (
        <div className="space-y-3">
          <p>No scores yet — be the first on the board.</p>
          <Link
            to="/quiz"
            className="inline-block px-4 py-2 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Play a quiz
          </Link>
        </div>
      )}

      {status === 'ready' && entries.length > 0 && (
        <ol className="space-y-1">
          {entries.map((entry, i) => (
            <LeaderboardRow
              key={entry.userId}
              rank={i + 1}
              entry={entry}
              isCurrentUser={user && entry.userId === user._id}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

// Emoji medals for the podium, plain numbers after that.
function rankDisplay(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

function LeaderboardRow({ rank, entry, isCurrentUser }) {
  const { username, score, achievedAt } = entry;
  const when = new Date(achievedAt).toLocaleDateString();

  // Current user row gets a subtle highlight so they can find themselves.
  const highlightClass = isCurrentUser
    ? 'bg-slate-100 dark:bg-slate-800 border-slate-900 dark:border-slate-100'
    : 'border-slate-200 dark:border-slate-700';

  return (
    <li
      className={`flex items-center gap-3 px-3 py-2 border rounded ${highlightClass}`}
      aria-label={`Rank ${rank}, ${username}, score ${score}`}
    >
      <span className="w-10 text-center font-semibold" aria-hidden="true">
        {rankDisplay(rank)}
      </span>
      <div className="flex-1">
        <p className="font-medium">
          {username}
          {isCurrentUser && <span className="ml-2 text-xs text-slate-500">(you)</span>}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Achieved {when}</p>
      </div>
      <span className="text-lg font-semibold">{score}</span>
    </li>
  );
}