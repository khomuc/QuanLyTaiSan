import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toggle } from '../components/ui';
import type { SystemSettings } from '../lib/types';

export default function SettingsPage({
  settings,
  onSave,
}: {
  settings: SystemSettings;
  onSave: (settings: SystemSettings) => void;
}) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  return (
    <section className="panel full">
      <div className="panel-header">
        <h2>Cau hinh he thong</h2>
        <button className="primary-button" onClick={() => onSave(draft)}>
          <Save size={18} />
          Luu cau hinh
        </button>
      </div>
      <div className="settings-grid">
        <label>
          Ten ung dung
          <input
            onChange={(event) => setDraft({ ...draft, appName: event.target.value })}
            value={draft.appName}
          />
        </label>
        <label>
          Thoi han JWT
          <input
            onChange={(event) =>
              setDraft({ ...draft, jwtExpiresIn: event.target.value })
            }
            value={draft.jwtExpiresIn}
          />
        </label>
        <Toggle
          checked={draft.emailNotificationsEnabled}
          label="Email ky duyet"
          onChange={(checked) =>
            setDraft({ ...draft, emailNotificationsEnabled: checked })
          }
        />
        <Toggle
          checked={draft.inAppNotificationsEnabled}
          label="Thong bao trong app"
          onChange={(checked) =>
            setDraft({ ...draft, inAppNotificationsEnabled: checked })
          }
        />
      </div>
    </section>
  );
}
