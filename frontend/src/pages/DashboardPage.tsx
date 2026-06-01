import { BarChart3, ClipboardCheck, Users } from 'lucide-react';
import { KpiTile } from '../components/ui';
import type { DashboardOverview, ViewKey } from '../lib/types';

export default function DashboardPage({
  data,
  onNavigate,
}: {
  data: DashboardOverview;
  onNavigate: (view: ViewKey) => void;
}) {
  return (
    <div className="page-grid">
      <KpiTile
        icon={Users}
        label="Nhan vien"
        onClick={() => onNavigate('employees')}
        tone="green"
        value={data.employees.total}
      />
      <KpiTile
        icon={BarChart3}
        label="Tai san"
        onClick={() => onNavigate('assets')}
        tone="amber"
        value={data.assets.total}
      />
      <KpiTile
        icon={ClipboardCheck}
        label="Cho ky duyet"
        onClick={() => onNavigate('approvals')}
        tone="red"
        value={data.approvals.totalPending}
      />

      <section className="panel span-2">
        <div className="panel-header">
          <h2>Trang thai tai san</h2>
        </div>
        <div className="status-grid">
          {data.assets.byStatus.map((item) => (
            <div className="status-row" key={item.name}>
              <span>{item.name}</span>
              <strong>{item.total}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Log gan day</h2>
        </div>
        <div className="compact-list">
          {data.recentLogs.map((log) => (
            <div className="compact-item" key={log.maLog}>
              <strong>{log.hanhDong}</strong>
              <span>{log.hoTen ?? log.maNhanVien ?? 'He thong'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
