import { Eye, EyeOff, Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { StatusPill } from '../components/ui';
import type { AuthUser, Department, ProfileUpdatePayload } from '../lib/types';

export default function ProfilePage({
  departments,
  onChangePassword,
  onSaveProfile,
  user,
}: {
  departments: Department[];
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  onSaveProfile: (payload: ProfileUpdatePayload) => Promise<void>;
  user: AuthUser;
}) {
  const [profileDraft, setProfileDraft] = useState<ProfileUpdatePayload>({
    hoTen: user.hoTen,
    soDienThoai: user.soDienThoai ?? '',
  });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setProfileDraft({
      hoTen: user.hoTen,
      soDienThoai: user.soDienThoai ?? '',
    });
    setHasChanges(false);
  }, [user]);

  const detectChanges = () => {
    setHasChanges(
      profileDraft.hoTen !== user.hoTen ||
        profileDraft.soDienThoai !== (user.soDienThoai ?? '')
    );
  };

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await onSaveProfile({
        ...profileDraft,
        soDienThoai: profileDraft.soDienThoai || null,
      });
      setHasChanges(false);
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    try {
      await onChangePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="two-column">
      <section className="panel">
        <div className="panel-header">
          <h2>Ho so</h2>
        </div>
        <div className="profile-summary">
          <div className="avatar">{user.hoTen.slice(0, 1)}</div>
          <strong>{user.hoTen}</strong>
          <span>{user.email}</span>
          <span>
            {user.tenPhongBan ?? user.maPhongBan ?? 'Chua gan phong ban'}
          </span>
          <StatusPill value={user.tenVaiTro ?? user.maVaiTro} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Cap nhat thong tin</h2>
        </div>
        <form className="stack-form" onSubmit={submitProfile}>
          <label>
            Ho ten
            <input
              onChange={(event) => {
                setProfileDraft({ ...profileDraft, hoTen: event.target.value });
                detectChanges();
              }}
              required
              value={profileDraft.hoTen}
            />
          </label>

          <label>
            Email dang nhap
            <input readOnly disabled value={user.email} />
            <small style={{ color: '#888', fontSize: '0.85em' }}>
              De bao mat, email khong the thay doi. Lien he Admin de cap nhat.
            </small>
          </label>

          <label>
            Chuc vu
            <input readOnly disabled value={user.chucVu || 'Chua gan'} />
            <small style={{ color: '#888', fontSize: '0.85em' }}>
              Chuc vu do to chuc gan. Lien he Admin de cap nhat.
            </small>
          </label>

          <label>
            So dien thoai
            <input
              onChange={(event) => {
                setProfileDraft({
                  ...profileDraft,
                  soDienThoai: event.target.value,
                });
                detectChanges();
              }}
              value={profileDraft.soDienThoai ?? ''}
              placeholder="012345678"
            />
          </label>

          <label>
            Phong ban
            <input readOnly disabled value={user.tenPhongBan || user.maPhongBan || 'Chua gan'} />
            <small style={{ color: '#888', fontSize: '0.85em' }}>
              Phong ban do to chuc gan. Lien he Admin de cap nhat.
            </small>
          </label>

          <button
            className="primary-button"
            disabled={savingProfile || !hasChanges}
            type="submit"
          >
            <Save size={18} />
            Luu thong tin
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Doi mat khau</h2>
        </div>
        <form className="stack-form" onSubmit={submitPassword}>
          <label>
            Mat khau cu
            <div className="password-field">
              <input
                onChange={(event) => setOldPassword(event.target.value)}
                required
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
              />
              <button
                aria-label={showOldPassword ? 'An mat khau cu' : 'Hien mat khau cu'}
                onClick={() => setShowOldPassword((current) => !current)}
                type="button"
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <label>
            Mat khau moi
            <div className="password-field">
              <input
                minLength={6}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
              />
              <button
                aria-label={showNewPassword ? 'An mat khau moi' : 'Hien mat khau moi'}
                onClick={() => setShowNewPassword((current) => !current)}
                type="button"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <button className="primary-button" disabled={savingPassword} type="submit">
            <Save size={18} />
            Cap nhat mat khau
          </button>
        </form>
      </section>
    </div>
  );
}