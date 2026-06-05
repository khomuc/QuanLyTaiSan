import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ClipboardCheck, Users } from 'lucide-react';
import { KpiTile } from '../components/ui';
import { api } from '../lib/api';
import * as demo from '../lib/mockData';
import { useData } from '../contexts/DataContext';
import type { DashboardOverview } from '../lib/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dashboard, setDashboard } = useData();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .dashboard()
      .then((data) => {
        setDashboard(data);
      })
      .catch(() => {
        setDashboard(demo.dashboard);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setDashboard]);

  const handleNavigate = (path: string) => {
    navigate(`/${path}`);
  };

  return (
    <div className="page-grid">
      {loading && <div className="loading-bar" />}
      <KpiTile
        icon={Users}
        label="Nhan vien"
        onClick={() => handleNavigate('employees')}
        tone="green"
        value={dashboard.employees.total}
      />
      <KpiTile
        icon={BarChart3}
        label="Tai san"
        onClick={() => handleNavigate('assets')}
        tone="amber"
        value={dashboard.assets.total}
      />
      <KpiTile
        icon={ClipboardCheck}
        label="Cho ky duyet"
        onClick={() => handleNavigate('approvals')}
        tone="red"
        value={dashboard.approvals.totalPending}
      />

      <section className="panel span-2">
        <div className="panel-header">
          <h2>Trang thai tai san</h2>
        </div>
        <div className="status-grid">
          {dashboard.assets.byStatus.map((item) => (
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
          {dashboard.recentLogs.map((log) => (
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
