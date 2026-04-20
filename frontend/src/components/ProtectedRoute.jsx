// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="p-4">Loading…</p>;
  }

  if (!user) {
    // Stash the intended destination so we can send them back after login.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <section>
        <h1 className="text-2xl font-semibold mb-2">Forbidden</h1>
        <p>You need admin access to view this page.</p>
      </section>
    );
  }

  return children;
}