import React, { useState } from 'react';
import { FileText, ArrowRight, Download, Eye, Calendar, ArrowRightLeft, Users } from 'lucide-react';
import { EmptyState } from '../../components/ui';

interface TransferReportsProps {
  data: {
    summary: Array<{
      TuPhongBan: string;
      TuPhongBanTen?: string;
      DenPhongBan: string;
      DenPhongBanTen?: string;
      SoLuongTaiSan: number;
    }>;
    items: Array<{
      SoPhieu: string;
      TenTaiSan: string;
      MaTaiSan: string;
      TuPhongBan: string;
      TuPhongBanTen?: string;
      DenPhongBan: string;
      DenPhongBanTen?: string;
      LyDo?: string;
      NguoiLap: string;
      NguoiLapTen?: string;
      NgayDieuChuyen: string;
    }>;
  };
  onSelectSlip: (soPhieu: string) => void;
  searchText: string;
}

export function TransferReports({ data, onSelectSlip, searchText }: TransferReportsProps) {
  const { summary = [], items = [] } = data || {};
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // 1. Calculate KPIs locally for responsiveness and exact details matching filters
  const uniqueSlips = new Set(items.map(i => i.SoPhieu)).size;
  const totalAssetsTransferred = items.length;

  // Top Sender Department
  const senderMap: Record<string, number> = {};
  items.forEach(item => {
    const name = item.TuPhongBanTen || item.TuPhongBan || 'Chưa rõ';
    senderMap[name] = (senderMap[name] || 0) + 1;
  });
  let topSender = '—';
  let maxSend = 0;
  Object.entries(senderMap).forEach(([dept, count]) => {
    if (count > maxSend) {
      maxSend = count;
      topSender = dept;
    }
  });

  // Top Receiver Department
  const receiverMap: Record<string, number> = {};
  items.forEach(item => {
    const name = item.DenPhongBanTen || item.DenPhongBan || 'Chưa rõ';
    receiverMap[name] = (receiverMap[name] || 0) + 1;
  });
  let topReceiver = '—';
  let maxRecv = 0;
  Object.entries(receiverMap).forEach(([dept, count]) => {
    if (count > maxRecv) {
      maxRecv = count;
      topReceiver = dept;
    }
  });

  // Filter items by search bar
  const filteredItems = items.filter(item => {
    if (!searchText) return true;
    const lower = searchText.toLowerCase();
    return (
      item.SoPhieu.toLowerCase().includes(lower) ||
      item.TenTaiSan.toLowerCase().includes(lower) ||
      (item.MaTaiSan && item.MaTaiSan.toLowerCase().includes(lower)) ||
      (item.NguoiLapTen && item.NguoiLapTen.toLowerCase().includes(lower))
    );
  });

  const handleExport = (type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      setIsExportingExcel(true);
      setTimeout(() => setIsExportingExcel(false), 1500);
    } else {
      setIsExportingPdf(true);
      setTimeout(() => setIsExportingPdf(false), 1500);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      
      {/* 4 Premium KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }} className="no-print">
        <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <FileText size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500, display: 'block' }}>Tổng số phiếu</span>
            <strong style={{ fontSize: '1.35rem', color: '#1e293b' }}>{uniqueSlips} phiếu</strong>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <ArrowRightLeft size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500, display: 'block' }}>Tài sản luân chuyển</span>
            <strong style={{ fontSize: '1.35rem', color: '#1e293b' }}>{totalAssetsTransferred} thiết bị</strong>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <Users size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500, display: 'block' }}>Đơn vị chuyển đi nhiều</span>
            <strong style={{ fontSize: '1rem', color: '#1e293b', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '170px' }} title={topSender}>
              {topSender}
            </strong>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Users size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500, display: 'block' }}>Đơn vị tiếp nhận nhiều</span>
            <strong style={{ fontSize: '1rem', color: '#1e293b', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '170px' }} title={topReceiver}>
              {topReceiver}
            </strong>
          </div>
        </div>
      </div>

      {/* Visual Connection Flows */}
      <section className="panel" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
        <div className="panel-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>Sơ đồ dòng chảy luân chuyển tích lũy</h2>
          
          {/* Export Buttons */}
          <div style={{ display: 'flex', gap: '8px' }} className="no-print">
            <button 
              onClick={() => handleExport('excel')}
              disabled={isExportingExcel || isExportingPdf}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 500,
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              {isExportingExcel ? 'Đang xuất Excel...' : 'Xuất Excel'}
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              disabled={isExportingExcel || isExportingPdf}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 500,
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              {isExportingPdf ? 'Đang xuất PDF...' : 'Xuất PDF'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {summary.map((item, idx) => (
            <div 
              key={idx} 
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>TỪ PHÒNG</div>
                <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.TuPhongBanTen || item.TuPhongBan}>
                  {item.TuPhongBanTen || item.TuPhongBan}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px', minWidth: '90px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '20px', marginBottom: '4px' }}>
                  {item.SoLuongTaiSan} tài sản
                </span>
                <ArrowRight size={16} style={{ color: '#94a3b8' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>ĐẾN PHÒNG</div>
                <div style={{ fontWeight: 700, color: '#2e795b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.DenPhongBanTen || item.DenPhongBan}>
                  {item.DenPhongBanTen || item.DenPhongBan}
                </div>
              </div>
            </div>
          ))}
          {!summary.length && (
            <div style={{ gridColumn: '1 / -1' }}>
              <EmptyState text="Chưa có luồng điều chuyển nào được hoàn tất ký duyệt." />
            </div>
          )}
        </div>
      </section>

      {/* Slips Details Log with Drill-down */}
      <section className="panel full" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
        <div className="panel-header" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>Nhật ký điều chuyển tài sản chi tiết</h2>
        </div>
        
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>MÃ PHIẾU</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>TÀI SẢN</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>LUỒNG ĐIỀU CHUYỂN</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>LẬP BỞI / NGÀY</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textAlign: 'center' }} className="no-print">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <tr 
                  key={idx} 
                  style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                  onClick={() => onSelectSlip(item.SoPhieu)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#1d4ed8', fontWeight: 700 }}>{item.SoPhieu}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>{item.TenTaiSan}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{item.MaTaiSan}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                      <strong>{item.TuPhongBanTen || item.TuPhongBan}</strong> ➜ <strong>{item.DenPhongBanTen || item.DenPhongBan}</strong>
                    </div>
                    {item.LyDo && (
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', fontStyle: 'italic' }}>
                        Lý do: {item.LyDo}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                      {item.NguoiLapTen || item.NguoiLap}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {item.NgayDieuChuyen ? String(item.NgayDieuChuyen).slice(0, 10) : ''}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }} className="no-print">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSlip(item.SoPhieu);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#2563eb',
                        backgroundColor: '#eff6ff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={12} />
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredItems.length && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                    <EmptyState text={searchText ? "Không tìm thấy phiếu phù hợp với từ khóa." : "Chưa có thông tin chi tiết lịch sử điều chuyển."} />
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
