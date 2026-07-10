import React from 'react';
import { X, Printer, User, Clock, Calendar, Edit3, PackageSearch, Loader2, CheckCircle2 } from 'lucide-react';
import { formatDate, relativeDate } from '../lib/dateUtils';
import { PrintTransferSlip } from './PrintTransferSlip';
import { StatusPill } from './ui';

interface SlipDetailModalProps {
  slipDetail: any;
  departments: any[];
  employees: any[];
  onClose: () => void;
}

export function SlipDetailModal({ slipDetail, departments, employees, onClose }: SlipDetailModalProps) {
  if (!slipDetail) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} className="no-print">
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0',
        animation: 'modalFadeIn 0.2s ease-out'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Chi tiết Phiếu điều chuyển
              <StatusPill value={slipDetail.TrangThaiDuyet} />
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Mã phiếu: {slipDetail.SoPhieu}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="icon-button"
              onClick={onClose}
              style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>

          {/* Loading details state */}
          {slipDetail.isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Loader2 className="spin" size={32} style={{ color: '#3b82f6', margin: '0 auto' }} />
              <div style={{ color: '#64748b', marginTop: '16px', fontSize: '0.95rem' }}>Đang tải dữ liệu chi tiết...</div>
            </div>
          ) : (
            <>
              {/* General Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 500 }}>
                    <User size={14} /> Người lập phiếu
                  </div>
                  <div style={{ fontSize: '0.97rem', fontWeight: 600, color: '#334155' }}>
                    {slipDetail.NguoiLapTen || slipDetail.NguoiLap || '—'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 500 }}>
                    <Clock size={14} /> Ngày lập phiếu
                  </div>
                  <div style={{ fontSize: '0.97rem', fontWeight: 600, color: '#334155' }}>
                    {formatDate(slipDetail.NgayLap)}
                  </div>
                  {slipDetail.NgayLap && (
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                      {relativeDate(slipDetail.NgayLap)}
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: '#eff6ff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 500 }}>
                    <Calendar size={14} /> Ngày điều chuyển
                  </div>
                  <div style={{ fontSize: '0.97rem', fontWeight: 600, color: '#1d4ed8' }}>
                    {formatDate(slipDetail.NgayDieuChuyen)}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 500 }}>
                    <Edit3 size={14} /> Ghi chú
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                    {slipDetail.GhiChu || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Không có ghi chú</span>}
                  </div>
                </div>
              </div>

              {/* Assets Section */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PackageSearch size={18} color="#3b82f6" /> Danh sách tài sản điều chuyển
              </h3>
              
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 14px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>TÀI SẢN</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>LUÂN CHUYỂN</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>LÝ DO / TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(slipDetail.items || []).map((ts: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{ts.TenTaiSan}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{ts.MaTaiSan}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Từ: {ts.TuPhongBanTen || ts.TuPhongBan}</div>
                          <div style={{ fontSize: '0.82rem', color: '#2e795b', fontWeight: 500, marginTop: '2px' }}>Đến: {ts.DenPhongBanTen || ts.DenPhongBan}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontSize: '0.82rem', color: '#334155' }}>{ts.LyDo || <em style={{ color: '#cbd5e1' }}>Không có lý do riêng</em>}</div>
                          {ts.TrangThaiNhan !== 'CHO_NHAN' && ts.TrangThaiNhan && (
                            <div style={{ marginTop: '4px' }}>
                              <span style={{ fontSize: '0.74rem', padding: '2px 5px', borderRadius: '4px', backgroundColor: ts.TrangThaiNhan === 'DA_NHAN' ? '#dcfce7' : '#fee2e2', color: ts.TrangThaiNhan === 'DA_NHAN' ? '#166534' : '#991b1b' }}>
                                {ts.TrangThaiNhan === 'DA_NHAN' ? 'Đã nhận' : 'Từ chối'}
                              </span>
                              {ts.GhiChuNhan && <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '6px' }}>({ts.GhiChuNhan})</span>}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Approvals Section */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '14px' }}>Trạng thái phê duyệt</h3>
              {!(slipDetail.approvals || []).length ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>Không có thông tin tuyến duyệt</div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(slipDetail.approvals || []).map((kd: any, idx: number) => {
                    const isApproved = kd.TrangThaiKy === 'DA_KY';
                    const isRejected = kd.TrangThaiKy === 'TU_CHOI';
                    const statusText = isApproved ? 'Đã xác nhận' : isRejected ? 'Từ chối' : 'Đang chờ';
                    const statusColor = isApproved ? '#10b981' : isRejected ? '#ef4444' : '#f59e0b';
                    const statusBg = isApproved ? '#dcfce7' : isRejected ? '#fef2f2' : '#fffbeb';

                    return (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '12px 16px', 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0' 
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>
                            {kd.HoTen || kd.MaNhanVien}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                            Vai trò: {kd.TenVaiTro || 'Người duyệt'}
                          </div>
                          {kd.ThoiGianKy && (
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                              Thời gian: {new Date(kd.ThoiGianKy).toLocaleString('vi-VN')}
                            </div>
                          )}
                          {kd.LyDoTuChoi && (
                            <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '6px' }}>
                              Lý do từ chối: {kd.LyDoTuChoi}
                            </div>
                          )}
                        </div>
                        <span style={{ 
                          fontSize: '0.82rem', 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          fontWeight: 600, 
                          color: statusColor, 
                          backgroundColor: statusBg 
                        }}>
                          {statusText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            style={{ padding: '8px 24px', fontSize: '0.95rem' }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
