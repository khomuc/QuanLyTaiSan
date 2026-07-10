import React from 'react';
import { ClipboardCheck, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';
import { EmptyState } from '../../components/ui';

interface InventoryReportsProps {
  data: {
    kpis: {
      totalAudits: number;
      discrepancyRate: number;
      auditedAssets: number;
      lostAssetsValue: number;
    };
    recentAudits: Array<{
      maDot: string;
      tenDot: string;
      ngay: string;
      trangThai: string;
      khop: number;
      lech: number;
    }>;
  };
}

const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export function InventoryReports({ data }: InventoryReportsProps) {
  const { kpis, recentAudits = [] } = data || {};
  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      
      {/* KPI Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* KPI: Total Audits */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <ClipboardCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Tổng số đợt kiểm kê</span>
            <strong style={{ fontSize: '1.5rem', color: '#1e293b' }}>{kpis?.totalAudits || 0} đợt</strong>
          </div>
        </div>

        {/* KPI: Audited Assets */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Tài sản đã quét đối chiếu</span>
            <strong style={{ fontSize: '1.5rem', color: '#1e293b' }}>{kpis?.auditedAssets || 0} tài sản</strong>
          </div>
        </div>

        {/* KPI: Discrepancy Rate */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Tỷ lệ chênh lệch/thất thoát</span>
            <strong style={{ fontSize: '1.5rem', color: '#ef4444' }}>{kpis?.discrepancyRate || 0}%</strong>
          </div>
        </div>

        {/* KPI: Lost value */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#f59e0b' }}>
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Giá trị hao hụt ước tính</span>
            <strong style={{ fontSize: '1.3rem', color: '#1e293b' }}>{formatVND(kpis?.lostAssetsValue || 0)}</strong>
          </div>
        </div>

      </div>

      {/* Recent Audits Table */}
      <section className="panel full" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
        <div className="panel-header" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>Kết quả các đợt kiểm kê gần đây</h2>
        </div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>ĐỢT KIỂM KÊ</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>NGÀY THỰC HIỆN</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>TRẠNG THÁI</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>KHỚP / LỆCH</th>
              </tr>
            </thead>
            <tbody>
              {recentAudits.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.92rem' }}>{item.tenDot}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>Mã đợt: {item.maDot}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.88rem', color: '#334155' }}>
                    {item.ngay}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 500 }}>
                      {item.trangThai}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.88rem' }}>
                    <span style={{ color: '#166534', fontWeight: 500 }}>{item.khop} khớp</span>
                    {item.lech > 0 && <span style={{ color: '#ef4444', fontWeight: 500, marginLeft: '8px' }}>({item.lech} lệch)</span>}
                  </td>
                </tr>
              ))}
              {!recentAudits.length && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>
                    <EmptyState text="Chưa thực hiện đợt kiểm kê nào." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
