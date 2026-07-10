import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, ArrowRightLeft, ClipboardCheck, Loader2, Search } from 'lucide-react';
import { api, getStoredToken } from '../lib/api';
import { AssetReports } from './reports/AssetReports';
import { TransferReports } from './reports/TransferReports';
import { InventoryReports } from './reports/InventoryReports';
import { SlipDetailModal } from '../components/SlipDetailModal';

const mockAssetStats = {
  kpis: {
    totalAssets: 15,
    totalValue: 345000000,
    brokenAssets: 1,
    maintenanceAssets: 2,
  },
  statusDistribution: [
    { TrangThai: 'HOAT_DONG', count: 12 },
    { TrangThai: 'BAO_TRI', count: 2 },
    { TrangThai: 'HONG', count: 1 }
  ],
  categoryDistribution: [
    { MaLoai: 'L01', TenLoai: 'Thiết bị điện tử', count: 8, totalValue: 240000000 },
    { MaLoai: 'L02', TenLoai: 'Bàn ghế', count: 5, totalValue: 35000000 },
    { MaLoai: 'L03', TenLoai: 'Công cụ dụng cụ', count: 2, totalValue: 70000000 }
  ],
  departmentDistribution: [
    { maPhongBan: 'PB01', TenPhongBan: 'Phòng Thiết bị', count: 6, totalValue: 120000000 },
    { maPhongBan: 'PB02', TenPhongBan: 'Khoa CNTT', count: 5, totalValue: 150000000 },
    { maPhongBan: 'PB03', TenPhongBan: 'Khoa Điện tử', count: 4, totalValue: 75000000 }
  ]
};

const mockInventoryStats = {
  kpis: {
    totalAudits: 2,
    discrepancyRate: 1.5,
    auditedAssets: 197,
    lostAssetsValue: 18450000,
  },
  recentAudits: [
    { maDot: 'KK-2026-01', tenDot: 'Kiểm kê thiết bị đầu năm 2026', ngay: '2026-01-15', trangThai: 'Đã hoàn thành', khop: 142, lech: 3 },
    { maDot: 'KK-2025-02', tenDot: 'Kiểm kê máy tính phòng LAB 2025', ngay: '2025-11-20', trangThai: 'Đã hoàn thành', khop: 55, lech: 0 }
  ]
};

const mockTransferStats = {
  summary: [
    { TuPhongBan: 'PB01', TuPhongBanTen: 'Phòng Thiết bị', DenPhongBan: 'PB02', DenPhongBanTen: 'Khoa CNTT', SoLuongTaiSan: 3 },
    { TuPhongBan: 'PB02', TuPhongBanTen: 'Khoa CNTT', DenPhongBan: 'PB03', DenPhongBanTen: 'Khoa Điện tử', SoLuongTaiSan: 1 }
  ],
  items: [
    { SoPhieu: 'PDC-2026-0005', TenTaiSan: 'Máy in Canon LBP', MaTaiSan: 'TS-DEMO-002', TuPhongBan: 'PB01', TuPhongBanTen: 'Phòng Thiết bị', DenPhongBan: 'PB02', DenPhongBanTen: 'Khoa CNTT', LyDo: 'Điều động kiểm thử hệ thống', NguoiLap: 'NV008', NguoiLapTen: 'Nguyen Thi Huynh Nhu', NgayDieuChuyen: '2026-07-09' }
  ]
};

export function ReportsPage() {
  const [activeSubTab, setActiveSubTab] = useState<'assets' | 'transfers' | 'inventory'>('assets');
  const [isLoading, setIsLoading] = useState(true);
  
  const [assetData, setAssetData] = useState<any>(null);
  const [transferData, setTransferData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);

  // Filters for transfers reports
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');
  const [maPhongBan, setMaPhongBan] = useState('');
  const [searchText, setSearchText] = useState('');
  
  // Data lists to translate IDs in modal details
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedSlipDetail, setSelectedSlipDetail] = useState<any>(null);

  useEffect(() => {
    // Load metadata lists
    Promise.all([api.departments(), api.employees()])
      .then(([deptList, empList]) => {
        setDepartments(deptList);
        setEmployees(empList.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const isDemo = getStoredToken() === 'demo-token';

    if (activeSubTab === 'assets') {
      if (isDemo) {
        setAssetData(mockAssetStats);
        setIsLoading(false);
      } else {
        api.reportsAssets()
          .then(setAssetData)
          .catch(() => setAssetData(mockAssetStats))
          .finally(() => setIsLoading(false));
      }
    } else if (activeSubTab === 'transfers') {
      if (isDemo) {
        setTransferData(mockTransferStats);
        setIsLoading(false);
      } else {
        api.reportsTransfers({ tuNgay, denNgay, maPhongBan })
          .then(setTransferData)
          .catch(() => setTransferData(mockTransferStats))
          .finally(() => setIsLoading(false));
      }
    } else if (activeSubTab === 'inventory') {
      if (isDemo) {
        setInventoryData(mockInventoryStats);
        setIsLoading(false);
      } else {
        api.reportsInventory()
          .then(setInventoryData)
          .catch(() => setInventoryData(mockInventoryStats))
          .finally(() => setIsLoading(false));
      }
    }
  }, [activeSubTab, tuNgay, denNgay, maPhongBan]);

  const handleSelectSlip = (soPhieu: string) => {
    setSelectedSlipDetail({ SoPhieu: soPhieu, isLoading: true });
    const isDemo = getStoredToken() === 'demo-token';
    if (isDemo) {
      setTimeout(() => {
        const item = mockTransferStats.items.find(i => i.SoPhieu === soPhieu);
        setSelectedSlipDetail({
          SoPhieu: soPhieu,
          NgayLap: '2026-07-09',
          NgayDieuChuyen: '2026-07-10',
          NguoiLap: 'NV008',
          NguoiLapTen: 'Nguyen Thi Huynh Nhu',
          TrangThaiDuyet: 'DA_DUYET',
          GhiChu: 'Dữ liệu điều chuyển mẫu',
          items: item ? [{
            MaTaiSan: item.MaTaiSan,
            TenTaiSan: item.TenTaiSan,
            TuPhongBan: item.TuPhongBan,
            TuPhongBanTen: item.TuPhongBanTen,
            DenPhongBan: item.DenPhongBan,
            DenPhongBanTen: item.DenPhongBanTen,
            LyDo: item.LyDo,
            TrangThaiNhan: 'DA_NHAN'
          }] : [],
          approvals: [
            { VongKy: 1, TenVaiTro: 'Xác nhận của Quản lý', MaNhanVien: 'NV008', HoTen: 'Nguyen Thi Huynh Nhu', TrangThaiKy: 'DA_KY', ThoiGianKy: '2026-07-09T13:46:40.000Z' }
          ]
        });
      }, 300);
    } else {
      api.getTransferSlip(soPhieu)
        .then(setSelectedSlipDetail)
        .catch(() => setSelectedSlipDetail({ SoPhieu: soPhieu, isMocked: true, items: [], approvals: [] }));
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
      
      {/* Premium subtabs navigation */}
      <div className="transfer-tabs no-print" style={{ marginBottom: '24px' }}>
        <button
          className={`transfer-tab-btn ${activeSubTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('assets')}
          type="button"
        >
          <BarChart3 size={16} />
          Tổng quan tài sản
        </button>
        <button
          className={`transfer-tab-btn ${activeSubTab === 'transfers' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('transfers')}
          type="button"
        >
          <ArrowRightLeft size={16} />
          Thống kê luân chuyển
        </button>
        <button
          className={`transfer-tab-btn ${activeSubTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('inventory')}
          type="button"
        >
          <ClipboardCheck size={16} />
          Kiểm kê & Khấu hao
        </button>
      </div>

      {/* Action Filters Panel (Only visible in Transfer Reports) */}
      {activeSubTab === 'transfers' && (
        <div style={{
          backgroundColor: '#fff',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }} className="no-print">
          
          {/* Quick Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px', position: 'relative' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Tìm kiếm:</span>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Tìm mã phiếu, tài sản..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '6px 10px 6px 30px', 
                  borderRadius: '6px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '0.85rem' 
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Từ ngày:</span>
            <input 
              type="date" 
              value={tuNgay} 
              onChange={e => setTuNgay(e.target.value)} 
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Đến ngày:</span>
            <input 
              type="date" 
              value={denNgay} 
              onChange={e => setDenNgay(e.target.value)} 
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Phòng ban:</span>
            <select 
              value={maPhongBan} 
              onChange={e => setMaPhongBan(e.target.value)} 
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', minWidth: '180px' }}
            >
              <option value="">— Tất cả các phòng —</option>
              {departments.map(d => (
                <option key={d.maPhongBan} value={d.maPhongBan}>{d.tenPhongBan}</option>
              ))}
            </select>
          </div>
          {(tuNgay || denNgay || maPhongBan || searchText) && (
            <button 
              onClick={() => { setTuNgay(''); setDenNgay(''); setMaPhongBan(''); setSearchText(''); }}
              style={{
                marginLeft: 'auto',
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Xóa lọc
            </button>
          )}
        </div>
      )}

      {/* Main Reports Sub-view Router */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <Loader2 className="spin" size={32} style={{ color: '#3b82f6', margin: '0 auto' }} />
          <div style={{ color: '#64748b', marginTop: '16px', fontSize: '0.95rem', fontWeight: 500 }}>Đang tổng hợp số liệu báo cáo...</div>
        </div>
      ) : (
        <>
          {activeSubTab === 'assets' && assetData && <AssetReports data={assetData} />}
          {activeSubTab === 'transfers' && transferData && (
            <TransferReports 
              data={transferData} 
              onSelectSlip={handleSelectSlip}
              searchText={searchText}
            />
          )}
          {activeSubTab === 'inventory' && inventoryData && <InventoryReports data={inventoryData} />}
        </>
      )}

      {/* Slip Detail Drill-down Modal */}
      {selectedSlipDetail && (
        <SlipDetailModal
          slipDetail={selectedSlipDetail}
          departments={departments}
          employees={employees}
          onClose={() => setSelectedSlipDetail(null)}
        />
      )}

    </div>
  );
}

export default ReportsPage;
