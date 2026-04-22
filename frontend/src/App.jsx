import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Admin from './pages/Admin.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Quiz from './components/Quiz.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import History from './pages/History.jsx';

function toggleDarkMode() {
  const root = document.documentElement;
  const isDark = root.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

export default function App() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex gap-4 items-center">
        <Link to="/" className="font-semibold">Quiz Game</Link>
        <Link to="/quiz">Play</Link>
        {user && <Link to="/history">History</Link>}
        <Link to="/leaderboard">Leaderboard</Link>
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}

        <div className="ml-auto flex gap-2 items-center">
          {!loading && user && (
            <>
              <span className="text-sm">Hi, <strong>{user.username}</strong></span>
              <button
                onClick={handleLogout}
                className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-sm"
              >
                Log out
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          <button
            onClick={toggleDarkMode}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-sm"
            aria-label="Toggle dark mode"
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
          <Route
            path="/quiz"
            element={<ProtectedRoute><Quiz /></ProtectedRoute>}
          />
          <Route
            path="/leaderboard"
            element={<ProtectedRoute><Leaderboard /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>}
          />
          <Route
            path="/history"
            element={<ProtectedRoute><History /></ProtectedRoute>}
          />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}