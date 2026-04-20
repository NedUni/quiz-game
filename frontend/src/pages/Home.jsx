// pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">
        {user ? `Welcome back, ${user.username}` : 'Welcome'}
      </h1>
      {user ? (
        <p>
          Ready to play? <Link to="/quiz" className="underline">Start a quiz</Link> or check the{' '}
          <Link to="/leaderboard" className="underline">leaderboard</Link>.
        </p>
      ) : (
        <p>
          Single-player quiz game — <Link to="/login" className="underline">log in</Link> or{' '}
          <Link to="/register" className="underline">register</Link> to start playing.
        </p>
      )}
    </section>
  );
}