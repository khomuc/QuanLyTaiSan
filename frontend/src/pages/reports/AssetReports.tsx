import React from 'react';
import { Package, TrendingUp, AlertTriangle, Hammer, ShieldAlert } from 'lucide-react';
import { EmptyState } from '../../components/ui';

interface AssetReportsProps {
  data: {
    kpis: {
      totalAssets: number;
      totalValue: number;
      brokenAssets: number;
      maintenanceAssets: number;
    };
    statusDistribution: Array<{
      TrangThai: string;
      count: number;
    }>;
    categoryDistribution: Array<{
      MaLoai: string;
      TenLoai: string | null;
      count: number;
      totalValue: number;
    }>;
    departmentDistribution: Array<{
      maPhongBan: string;
      TenPhongBan: string | null;
      count: number;
      totalValue: number;
    }>;
  };
}

const STATUS_LABELS: Record<string, string> = {
  HOAT_DONG: 'Hoạt động',
  BAO_TRI: 'Bảo trì',
  HONG: 'Hỏng',
  DANG_LUAN_CHUYEN: 'Đang luân chuyển',
  DANG_SU_DUNG: 'Đang sử dụng',
};

const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export function AssetReports({ data }: AssetReportsProps) {
  const { kpis, statusDistribution = [], categoryDistribution = [], departmentDistribution = [] } = data || {};

  // Find max count or value for styling progress bars
  const maxCatCount = Math.max(...categoryDistribution.map((c) => c.count), 1);
  const maxDeptValue = Math.max(...departmentDistribution.map((d) => Number(d.totalValue)), 1);

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* KPI Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* KPI: Total Assets */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <Package size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Tổng số tài sản</span>
            <strong style={{ fontSize: '1.5rem', color: '#1e293b' }}>{kpis?.totalAssets || 0}</strong>
            <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'block', marginTop: '2px', fontWeight: 500 }}>
              <TrendingUp size={12} style={{ display: 'inline', marginRight: 2, verticalAlign: 'middle' }} />
              Hoạt động ổn định
            </span>
          </div>
        </div>

        {/* KPI: Total Value */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Tổng nguyên giá tài sản</span>
            <strong style={{ fontSize: '1.3rem', color: '#1e293b', wordBreak: 'break-all' }}>{formatVND(kpis?.totalValue || 0)}</strong>
          </div>
        </div>

        {/* KPI: Maintenance */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#f59e0b' }}>
            <Hammer size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Thiết bị đang bảo trì</span>
            <strong style={{ fontSize: '1.5rem', color: '#1e293b' }}>{kpis?.maintenanceAssets || 0}</strong>
          </div>
        </div>

        {/* KPI: Broken */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Thiết bị hỏng cần thanh lý</span>
            <strong style={{ fontSize: '1.5rem', color: '#1e293b' }}>{kpis?.brokenAssets || 0}</strong>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Category distribution */}
        <section className="panel" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <div className="panel-header" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>Cơ cấu tài sản theo loại</h2>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            {categoryDistribution.map((cat, idx) => {
              const percentage = Math.round((cat.count / maxCatCount) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                    <span>{cat.TenLoai || cat.MaLoai}</span>
                    <span>
                      <strong>{cat.count}</strong> thiết bị ({formatVND(cat.totalValue)})
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
            {!categoryDistribution.length && <EmptyState text="Chưa có dữ liệu phân loại tài sản." />}
          </div>
        </section>

        {/* Department distribution */}
        <section className="panel" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <div className="panel-header" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>Phân bổ giá trị tài sản theo Phòng/Khoa</h2>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            {departmentDistribution.slice(0, 6).map((dept, idx) => {
              const val = Number(dept.totalValue) || 0;
              const percentage = Math.round((val / maxDeptValue) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                    <span>{dept.TenPhongBan || dept.maPhongBan}</span>
                    <span>
                      <strong>{dept.count}</strong> thiết bị ({formatVND(val)})
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
            {!departmentDistribution.length && <EmptyState text="Chưa có dữ liệu phòng ban." />}
          </div>
        </section>

      </div>
    </div>
  );
}
