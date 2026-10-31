import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from './api';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
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
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '60px auto', padding: 24 }}>
      <h1>{isLogin ? 'Log in' : 'Create account'}</h1>
      <form onSubmit={submit}>
        {!isLogin && (
          <div>
            <input name="name" placeholder="Name" value={form.name} onChange={update} />
            {fieldErrors.name && <small style={{ color: 'crimson' }}>{fieldErrors.name}</small>}
          </div>
        )}
        <div>
          <input name="email" placeholder="Email" value={form.email} onChange={update} />
          {fieldErrors.email && <small style={{ color: 'crimson' }}>{fieldErrors.email}</small>}
        </div>
        <div>
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={update} />
          {fieldErrors.password && <small style={{ color: 'crimson' }}>{fieldErrors.password}</small>}
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit">{isLogin ? 'Log in' : 'Register'}</button>
      </form>
      <p>
        {isLogin ? (
          <>No account? <Link to="/register">Register</Link></>
        ) : (
          <>Already registered? <Link to="/login">Log in</Link></>
        )}
      </p>
    </div>
  );
}