import React from 'react';
import { Asset, Department, Employee } from '../lib/types';
import { StatusPill } from './ui';

interface PrintTransferSlipProps {
  slipDetail: any;
  departments: Department[];
  employees: Employee[];
}

export function PrintTransferSlip({ slipDetail, departments, employees }: PrintTransferSlipProps) {
  if (!slipDetail) return null;

  return (
    <div className="print-only" style={{ padding: '20px', color: '#000', fontFamily: '"Times New Roman", Times, serif', lineHeight: 1.5 }}>
      {/* Print-specific styles */}
      <style>
        {`
          @media screen {
            .print-only {
              display: none !important;
            }
          }
          @media print {
            body * {
              visibility: hidden;
            }
            .print-only, .print-only * {
              visibility: visible;
            }
            .print-only {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              display: block !important;
            }
            .no-print {
              display: none !important;
            }
            .page-break {
              page-break-before: always;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              -webkit-print-color-adjust: exact;
            }
          }
        `}
      </style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '14pt', textTransform: 'uppercase' }}>Công ty CP Quản lý Tài sản</h2>
          <p style={{ margin: 0, fontSize: '11pt' }}>Phòng Hành chính - Nhân sự</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '14pt', fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
          <h3 style={{ margin: 0, fontSize: '12pt', fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</h3>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '18pt', fontWeight: 'bold', textTransform: 'uppercase' }}>BIÊN BẢN BÀN GIAO / ĐIỀU CHUYỂN TÀI SẢN</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '12pt', fontStyle: 'italic' }}>Số: {slipDetail.SoPhieu}</p>
        <p style={{ margin: 0, fontSize: '11pt' }}>Ngày lập: {slipDetail.NgayLap ? new Date(slipDetail.NgayLap).toLocaleDateString('vi-VN') : '--'}</p>
      </div>

      {/* Info Section */}
      <div style={{ marginBottom: '20px', fontSize: '12pt' }}>
        <p><strong>Người lập phiếu:</strong> {slipDetail.NguoiLapTen || slipDetail.NguoiLap}</p>
        <p><strong>Ngày dự kiến điều chuyển:</strong> {slipDetail.NgayDieuChuyen ? new Date(slipDetail.NgayDieuChuyen).toLocaleDateString('vi-VN') : '--'}</p>
        <p><strong>Ghi chú/Mục đích:</strong> {slipDetail.GhiChu || '...........................................................................'}</p>
      </div>

      {/* Assets Table */}
      <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>1. Danh sách tài sản điều chuyển:</h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: '5%' }}>STT</th>
            <th style={{ width: '15%' }}>Mã tài sản</th>
            <th style={{ width: '25%' }}>Tên tài sản</th>
            <th style={{ width: '20%' }}>Từ phòng ban</th>
            <th style={{ width: '20%' }}>Đến phòng ban</th>
            <th style={{ width: '15%' }}>Tình trạng nhận</th>
          </tr>
        </thead>
        <tbody>
          {(slipDetail.items || []).map((item: any, index: number) => (
            <tr key={item.MaTaiSan}>
              <td style={{ textAlign: 'center' }}>{index + 1}</td>
              <td>{item.MaTaiSan}</td>
              <td>{item.TenTaiSan}</td>
              <td>{item.TuPhongBanTen || item.TuPhongBan}</td>
              <td>{item.DenPhongBanTen || item.DenPhongBan}</td>
              <td>{item.TrangThaiNhan === 'DA_NHAN' ? 'Đã nhận' : item.TrangThaiNhan === 'TU_CHOI' ? 'Từ chối' : '...................'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signatures */}
      <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px', marginTop: '30px' }}>2. Xác nhận của các bên:</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <div style={{ textAlign: 'center', width: '50%' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '60px' }}>ĐẠI DIỆN BÊN GIAO</p>
          <p><i>(Ký, ghi rõ họ tên)</i></p>
        </div>
        <div style={{ textAlign: 'center', width: '50%' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '60px' }}>ĐẠI DIỆN BÊN NHẬN</p>
          <p><i>(Ký, ghi rõ họ tên)</i></p>
        </div>
      </div>
    </div>
  );
}
