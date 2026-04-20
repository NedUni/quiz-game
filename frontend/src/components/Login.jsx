// components/Login.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const schema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setServerError('');
    try {
      await login(values.username, values.password);
      const dest = location.state?.from || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed');
    }
  }

  return (
    <section className="max-w-sm">
      <h1 className="text-2xl font-semibold mb-4">Log in</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <div>
          <label className="block text-sm mb-1" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="w-full border rounded px-3 py-2 dark:bg-slate-800 dark:border-slate-600"
            {...register('username')}
          />
          {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full border rounded px-3 py-2 dark:bg-slate-800 dark:border-slate-600"
            {...register('password')}
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 text-white py-2 rounded disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-sm">
        No account? <Link to="/register" className="underline">Register</Link>
      </p>
    </section>
  );
}