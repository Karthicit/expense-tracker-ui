import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from './api';

const SWATCHES = ['--note-10', '--note-20', '--note-50', '--note-100', '--note-200', '--note-2000', '--note-500'];

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      const body = isLogin ? { email: form.email, password: form.password } : form;
      const data = await api(isLogin ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        body,
      });
      setToken(data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return (
    <div className="auth">
      <aside className="auth-side">
        <div className="brand">Expense Tracker</div>
        <div>
          <p className="auth-headline">See where your money goes.</p>
          <p>Log income and expenses, then read your month at a glance.</p>
          <div className="swatches">
            {SWATCHES.map((v) => (
              <span key={v} style={{ background: `var(${v})` }} />
            ))}
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <form className="auth-form" onSubmit={submit}>
          <h1>{isLogin ? 'Log in' : 'Create your account'}</h1>

          {!isLogin && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" autoComplete="name" value={form.name} onChange={update} />
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" autoComplete="email" value={form.email} onChange={update} />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={update}
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          {error && !hasFieldErrors && <p className="error">{error}</p>}

          <button type="submit" disabled={busy}>
            {busy ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
          </button>

          <p className="auth-switch">
            {isLogin ? (
              <>
                No account yet? <Link to="/register">Create one</Link>
              </>
            ) : (
              <>
                Already have an account? <Link to="/login">Log in</Link>
              </>
            )}
          </p>
        </form>
      </main>
    </div>
  );
}