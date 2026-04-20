import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Admin from './pages/Admin.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Quiz from './components/Quiz.jsx';
import Leaderboard from './components/Leaderboard.jsx';

function toggleDarkMode() {
  const root = document.documentElement;
  const isDark = root.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

export default function App() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex gap-4 items-center">
        <Link to="/" className="font-semibold">Quiz Game</Link>
        <Link to="/quiz">Play</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/admin">Admin</Link>
        <div className="ml-auto flex gap-2 items-center">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <button
            onClick={toggleDarkMode}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-sm"
          >
            🌓
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
