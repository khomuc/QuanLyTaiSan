import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { api } from '../lib/api';
import * as demo from '../lib/mockData';
import type { AuthUser } from '../lib/types';

export default function LoginScreen({
  onSuccess,
}: {
  onSuccess: (result: { token: string; user: AuthUser }) => void;
}) {
  const [email, setEmail] = useState('hieutruong@ctu.edu.vn');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.login(email, password);
      onSuccess({ token: result.accessToken, user: result.user });
    } catch {
      setError('Khong dang nhap duoc API hien tai');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand large">
          <div className="brand-mark">QL</div>
          <div>
            <strong>Quan Ly Tai San</strong>
            <span>System Lead console</span>
          </div>
        </div>

        <form onSubmit={submit} className="login-form">
          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label>
            Mat khau
            <div className="password-field">
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'An mat khau' : 'Hien mat khau'}
                onClick={() => setShowPassword((current) => !current)}
                title={showPassword ? 'An mat khau' : 'Hien mat khau'}
                type="button"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" disabled={loading} type="submit">
            <KeyRound size={18} />
            Dang nhap
          </button>
          <button
            className="secondary-button"
            onClick={() => onSuccess({ token: 'demo-token', user: demo.demoUser })}
            type="button"
          >
            Mo giao dien demo
          </button>
        </form>
      </section>
    </main>
  );
}
