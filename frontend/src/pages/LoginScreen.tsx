import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { api } from '../lib/apis/api';
import * as demo from '../lib/mockData';
import type { AuthUser } from '../lib/types';

type LoginScreenProps = {
  onSuccess: (result: { token: string; user: AuthUser }) => void;
};

const DEFAULT_EMAIL = 'hieutruong@ctu.edu.vn';
const DEFAULT_PASSWORD = '123456';

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Không đăng nhập được. Vui lòng kiểm tra email hoặc mật khẩu.';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trimmedEmail = email.trim();

  const emailError = useMemo(() => {
    if (!trimmedEmail) return '';
    if (!isValidEmail(trimmedEmail)) return 'Email không đúng định dạng';
    return '';
  }, [trimmedEmail]);

  const canSubmit = useMemo(() => {
    return Boolean(trimmedEmail && password && !emailError && !loading);
  }, [trimmedEmail, password, emailError, loading]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    if (!trimmedEmail) {
      setError('Vui lòng nhập email.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Email không đúng định dạng.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.login(trimmedEmail, password);

      onSuccess({
        token: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function openDemo() {
    if (loading) return;

    onSuccess({
      token: 'demo-token',
      user: demo.demoUser,
    });
  }

  function openGuest() {
    if (loading) return;

    onSuccess({
      token: 'guest-token',
      user: demo.guestUser,
    });
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-visual">
          <div className="login-badge">
            <ShieldCheck size={18} />
            Secure Asset Management
          </div>

          <div className="login-visual-content">
            <div className="brand large">
              <div className="brand-mark">QL</div>

              <div className="brand-copy">
                <strong>Quản Lý Tài Sản</strong>
                <span>Internal Management Console</span>
              </div>
            </div>

            <h1>Kiểm soát tài sản, kiểm kê và phân quyền tập trung.</h1>

            <p>
              Đăng nhập để quản lý tài sản, kiểm kê, phòng ban, vai trò và quyền
              truy cập trong hệ thống.
            </p>
          </div>

          <div className="login-stats">
            <div>
              <strong>RBAC</strong>
              <span>Phân quyền theo vai trò</span>
            </div>

            <div>
              <strong>JWT</strong>
              <span>Xác thực bảo mật</span>
            </div>

            <div>
              <strong>Audit</strong>
              <span>Lưu lịch sử thao tác</span>
            </div>
          </div>
        </div>

        <div className="login-panel">
          <div className="login-heading">
            <span>Welcome back</span>
            <h2>Đăng nhập hệ thống</h2>
            <p>Nhập tài khoản nhân viên để tiếp tục.</p>
          </div>

          <form onSubmit={submit} className="login-form" noValidate>
            <label className="form-field" htmlFor="email">
              <span>Email</span>

              <div className={`input-shell ${emailError ? 'invalid' : ''}`}>
                <Mail size={18} />

                <input
                  id="email"
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  aria-invalid={Boolean(emailError)}
                />
              </div>

              {emailError && <small className="field-error">{emailError}</small>}
            </label>

            <label className="form-field" htmlFor="password">
              <span>Mật khẩu</span>

              <div className="input-shell password-field">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  autoComplete="current-password"
                  disabled={loading}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  placeholder="Nhập mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />

                <button
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="password-toggle"
                  disabled={loading}
                  onClick={() => setShowPassword((current) => !current)}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  type="button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button
              className="primary-button login-submit"
              disabled={!canSubmit}
              type="submit"
            >
              {loading ? <Loader2 className="spin" size={18} /> : <KeyRound size={18} />}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <button
              className="secondary-button login-demo"
              disabled={loading}
              onClick={openDemo}
              type="button"
            >
              Mở giao diện demo
            </button>

            <button
              className="secondary-button login-demo"
              disabled={loading}
              onClick={openGuest}
              type="button"
            >
              Truy cập với tư cách khách
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
