import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit3, FileClock, BarChart3, Plus, Trash2, RefreshCw, Save, ArrowLeft, ArrowRight, CheckCircle2, Search, Loader2, User, X, PackageSearch, Printer, Camera, Check, Calendar, Clock } from 'lucide-react';
import { api } from '../lib/api';
import type { Asset, Department, Employee, ApprovalItem, AuthUser } from '../lib/types';
import { EmptyState, StatusPill } from '../components/ui';
import type { ToastData } from '../components/Toast';
import { QRScannerModal } from '../components/QRScannerModal';
import { PrintTransferSlip } from '../components/PrintTransferSlip';
import { formatDate, formatDateTime, todayVietnam, relativeDate } from '../lib/dateUtils';

interface TransferPageProps {
  departments: Department[];
  employees: Employee[];
  assets: Asset[];
  slips: any[];
  history: any;
  approvals?: ApprovalItem[];
  onSignApproval?: (item: ApprovalItem, status: 'DA_KY' | 'TU_CHOI', ghiChu?: string) => Promise<void>;
  onRefresh: () => void;
  setToast: (data: ToastData) => void;
  user?: AuthUser;
}

function TransferPage({
  departments,
  employees,
  assets,
  slips,
  history,
  approvals = [],
  onSignApproval,
  onRefresh,
  setToast,
  user,
}: TransferPageProps) {
  const canApprove = user?.permissions.includes('TRANSFER_APPROVE') || user?.permissions.includes('*') || false;
  const canCreate = user?.permissions.includes('TRANSFER_CREATE') || user?.permissions.includes('*') || !user?.permissions.includes('TRANSFER_APPROVE') || false;

  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab = (tabParam === 'approve' || tabParam === 'history' || tabParam === 'create') 
    ? tabParam 
    : (canCreate ? 'create' : 'approve');

  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'approve'>(initialTab);

  useEffect(() => {
    const param = searchParams.get('tab');
    if (param === 'approve' || param === 'history' || param === 'create') {
      setActiveTab(param);
    } else {
      setActiveTab(canCreate ? 'create' : 'approve');
    }
  }, [searchParams, user]);
  const [nguoiLap, setNguoiLap] = useState(user?.maNhanVien || '');
  const [ghiChu, setGhiChu] = useState('');
  const [sourceDept, setSourceDept] = useState('');
  const [ngayDieuChuyenInput, setNgayDieuChuyenInput] = useState(todayVietnam);
  const [assetRows, setAssetRows] = useState<Array<{ maTaiSan: string; denPhongBan: string; lyDo: string }>>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    if (user?.maNhanVien) {
      setNguoiLap(user.maNhanVien);
    }
  }, [user]);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [step2Search, setStep2Search] = useState('');
  const [quickDestDept, setQuickDestDept] = useState('');
  const [quickReason, setQuickReason] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlipDetail, setSelectedSlipDetail] = useState<any>(null);
  const [isLoadingSlip, setIsLoadingSlip] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [receiptMode, setReceiptMode] = useState(false);
  const [receiptItems, setReceiptItems] = useState<Array<{maTaiSan: string, hanhDong: 'DA_NHAN' | 'TU_CHOI', ghiChu: string}>>([]);
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);
  // For approve-tab detail preview
  const [approveViewSlip, setApproveViewSlip] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'approve' && approvals && approvals.length > 0) {
      const exists = selectedSlipDetail && approvals.some(a => a.maPhieu === selectedSlipDetail.SoPhieu);
      if (!exists) {
        const first = approvals[0];
        setSelectedSlipDetail({ SoPhieu: first.maPhieu, isLoading: true });
        api.getTransferSlip(first.maPhieu)
          .then(d => setSelectedSlipDetail(d))
          .catch(() => setSelectedSlipDetail({ SoPhieu: first.maPhieu, isMocked: true }));
      }
    } else if (activeTab === 'approve' && (!approvals || approvals.length === 0)) {
      if (selectedSlipDetail !== null) {
        setSelectedSlipDetail(null);
      }
    }
  }, [activeTab, approvals, selectedSlipDetail]);

  const pendingApproval = useMemo(() => {
    if (!selectedSlipDetail || !approvals) return null;
    return approvals.find(a => a.maPhieu === selectedSlipDetail.SoPhieu);
  }, [selectedSlipDetail, approvals]);

  const filteredSourceAssets = useMemo(() => {
    if (!sourceDept) return assets;
    return assets.filter(a => a.maPhongBanHienTai === sourceDept);
  }, [assets, sourceDept]);

  const autoApprovers = useMemo(() => {
    const creatorId = nguoiLap || (employees.length > 0 ? employees[0].maNhanVien : '');
    if (!sourceDept || assetRows.length === 0 || !assetRows[0].denPhongBan || employees.length === 0) return [];
    
    // Try to find a QTTB manager, or destination department user, or fallback to the current creator
    const qttb = employees.find(e => e.tenPhongBan?.toLowerCase().includes('quản trị') || e.maPhongBan === 'PB001') 
      || employees.find(e => e.maPhongBan === assetRows[0].denPhongBan)
      || employees.find(e => e.maNhanVien === creatorId)
      || employees[0];

    if (!qttb) return [];

    return [
      { maNhanVien: qttb.maNhanVien, hoTen: qttb.hoTen, chucVu: qttb.chucVu, tenVaiTro: 'Xác nhận của Quản lý', vongKy: 1 }
    ];
  }, [sourceDept, assetRows, employees, nguoiLap]);

  const loadSample = () => {
    if (assets.length < 1) {
      setToast({ message: 'Không có đủ tài sản trong hệ thống để tạo mẫu thử!' });
      return;
    }
    
    // Group assets by department to find a department with assets
    const deptMap: { [key: string]: Asset[] } = {};
    assets.forEach(a => {
      const dept = a.maPhongBanHienTai;
      if (!deptMap[dept]) deptMap[dept] = [];
      deptMap[dept].push(a);
    });
    
    let chosenDept = '';
    let chosenAssets: Asset[] = [];
    for (const [dept, list] of Object.entries(deptMap)) {
      if (list.length >= 2) {
        chosenDept = dept;
        chosenAssets = list.slice(0, 2);
        break;
      }
    }
    
    if (!chosenDept && assets.length > 0) {
      chosenDept = assets[0].maPhongBanHienTai;
      chosenAssets = [assets[0]];
    }
    
    if (!chosenDept) {
      setToast({ message: 'Không tìm thấy phòng ban nào chứa tài sản!' });
      return;
    }
    
    // Find a destination department that is different
    const destDeptObj = departments.find(d => d.maPhongBan !== chosenDept);
    const destDept = destDeptObj ? destDeptObj.maPhongBan : chosenDept;
    
    setGhiChu('Điều chuyển thiết bị phục vụ công việc chuyên môn (Mẫu)');
    setSourceDept(chosenDept);
    setAssetRows(chosenAssets.map(a => ({
      maTaiSan: a.maTaiSan,
      denPhongBan: destDept,
      lyDo: 'Điều động kiểm thử hệ thống'
    })));
    
    if (employees.length > 0) {
      setNguoiLap(user?.maNhanVien || employees[0].maNhanVien);
    }
    
    setToast({ message: 'Đã điền dữ liệu mẫu thực tế thành công!' });
    setCurrentStep(2);
  };

  const addAssetRow = () => {
    setAssetRows([...assetRows, { maTaiSan: '', denPhongBan: '', lyDo: '' }]);
  };

  const removeAssetRow = (index: number) => {
    setAssetRows(assetRows.filter((_, idx) => idx !== index));
  };

  const duplicateAssetRow = (index: number) => {
    const row = assetRows[index];
    setAssetRows([...assetRows, { ...row }]);
  };

  const updateAssetRow = (index: number, field: string, value: any) => {
    setAssetRows(prev => prev.map((row, idx) => idx === index ? { ...row, [field]: value } : row));
  };

  const applyDepartmentToAll = () => {
    const firstDest = assetRows[0]?.denPhongBan;
    if (!firstDest) {
      setToast({ message: 'Chưa chọn phòng ban nhận ở dòng đầu tiên!' });
      return;
    }
    setAssetRows(assetRows.map(row => ({ ...row, denPhongBan: firstDest })));
    setToast({ message: 'Đã áp dụng phòng ban nhận cho toàn bộ dòng!' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const creatorId = nguoiLap.trim() || (employees.length > 0 ? employees[0].maNhanVien : '');
    if (!creatorId) {
      setToast({ message: 'Người lập không được để trống!', type: 'error' });
      return;
    }
    const cleanAssets = assetRows.filter(r => r.maTaiSan && r.denPhongBan);
    if (cleanAssets.length === 0) {
      setToast({ message: 'Cần chọn ít nhất 1 tài sản và phòng ban đến!', type: 'error' });
      return;
    }

    // Optimistic UI updates - Close modal and clear form immediately
    setIsSubmitting(true);
    setToast({ message: 'Đang xử lý tạo phiếu điều chuyển...', type: 'info', duration: 0 }); // Notice duration 0 to avoid auto-close
    
    const payload = {
      nguoiLap: creatorId,
      ghiChu: ghiChu.trim() || undefined,
      ngayDieuChuyen: ngayDieuChuyenInput || todayVietnam(),
      danhSachTaiSan: cleanAssets.map(a => ({
        maTaiSan: a.maTaiSan,
        denPhongBan: a.denPhongBan,
        lyDo: a.lyDo.trim() || undefined
      })),
      danhSachKyDuyet: autoApprovers.length ? autoApprovers.map(a => ({ maNhanVien: a.maNhanVien, tenVaiTro: a.tenVaiTro, vongKy: a.vongKy })) : undefined,
    };
    
    setShowConfirmModal(false);
    setGhiChu('');
    setAssetRows([]);
    setCurrentStep(1);
    setNgayDieuChuyenInput(todayVietnam());
    setActiveTab('history');
    setIsSubmitting(false);

    // Async API call in background
    api.createTransferSlip(payload)
      .then(result => {
        const soPhieu = result.SoPhieu;
        onRefresh();
        setToast({
          message: `Phiếu ${soPhieu} đã được tạo thành công và gửi đi phê duyệt!`,
          type: 'success',
          duration: 8000,
          action: {
            label: `Xem chi tiết phiếu ${soPhieu}`,
            onClick: () => {
              setSelectedSlipDetail({ SoPhieu: soPhieu, isLoading: true });
              setActiveTab('history');
              api.getTransferSlip(soPhieu)
                .then(detail => setSelectedSlipDetail(detail))
                .catch(() => setSelectedSlipDetail({ SoPhieu: soPhieu, isMocked: true }));
            }
          }
        });
      })
      .catch((err: any) => {
        setToast({ message: `Lỗi: ${err.message || 'Không thể tạo phiếu'}`, type: 'error' });
      });
  };

  const filteredSlips = useMemo(() => {
    if (!statusFilter) return slips;
    return slips.filter(s => s.TrangThaiDuyet === statusFilter);
  }, [slips, statusFilter]);

  const handleScanSuccess = (decodedText: string) => {
    // Utility to play a beep sound
    const playBeep = (isError = false) => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = isError ? 'square' : 'sine';
        oscillator.frequency.value = isError ? 300 : 800; // Lower pitch for error
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        setTimeout(() => oscillator.stop(), isError ? 300 : 100);
      } catch (e) {
        // Ignore audio errors (e.g. browser policy)
      }
    };

    // Find asset by MaTaiSan or MaQR
    const asset = assets.find(a => a.maTaiSan === decodedText || a.maQR === decodedText);
    if (!asset) {
      playBeep(true);
      setToast({ message: `Không tìm thấy tài sản với mã: ${decodedText}`, type: 'error' });
      return;
    }
    
    // Auto-select source dept if not selected
    if (!sourceDept) {
      setSourceDept(asset.maPhongBanHienTai);
    } else if (sourceDept !== asset.maPhongBanHienTai) {
      playBeep(true);
      setToast({ message: `Tài sản ${asset.tenTaiSan} không thuộc phòng ban nguồn đang chọn!`, type: 'error' });
      return;
    }

    // Add to list if not already there
    if (!assetRows.find(r => r.maTaiSan === asset.maTaiSan)) {
      playBeep(false);
      setAssetRows(prev => [...prev, { maTaiSan: asset.maTaiSan, denPhongBan: quickDestDept, lyDo: quickReason }]);
      setToast({ message: `Đã thêm tài sản: ${asset.tenTaiSan}` });
    } else {
      setToast({ message: 'Tài sản này đã được chọn rồi!', type: 'info' });
    }
  };

  const submitReceipt = async () => {
    if (!selectedSlipDetail) return;
    
    const unselected = selectedSlipDetail.items.filter((item: any) => 
      !receiptItems.find(r => r.maTaiSan === item.MaTaiSan)
    );

    if (unselected.length > 0) {
      setToast({ message: 'Vui lòng xác nhận (Nhận/Từ chối) cho tất cả tài sản!', type: 'error' });
      return;
    }

    setIsSubmittingReceipt(true);
    try {
      const payload = {
        maNhanVien: nguoiLap, // Simulated current user
        danhSachTaiSan: receiptItems
      };
      await api.confirmReceiptTransferSlip(selectedSlipDetail.SoPhieu, payload);
      setToast({ message: 'Đã lưu xác nhận bàn giao thành công!', type: 'success' });
      setReceiptMode(false);
      setSelectedSlipDetail(null);
      onRefresh();
    } catch (err: any) {
      setToast({ message: `Lỗi: ${err.message}`, type: 'error' });
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  const availableAssets = useMemo(() => {
    return filteredSourceAssets.filter(a => {
      const isAlreadySelected = assetRows.some(row => row.maTaiSan === a.maTaiSan);
      if (isAlreadySelected) return false;
      
      if (!step2Search.trim()) return true;
      const term = step2Search.toLowerCase();
      return (
        a.tenTaiSan.toLowerCase().includes(term) ||
        a.maTaiSan.toLowerCase().includes(term) ||
        (a.maQR && a.maQR.toLowerCase().includes(term))
      );
    });
  }, [filteredSourceAssets, assetRows, step2Search]);

  return (
    <div className="assets-layout">
      {/* Premium navigation tabs */}
      <div className="transfer-tabs no-print">
        {canCreate && (
          <button
            className={`transfer-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => { setActiveTab('create'); setSelectedSlipDetail(null); }}
            type="button"
          >
            <Edit3 size={16} />
            Lập phiếu điều chuyển
          </button>
        )}
        {canApprove && (
          <button
            className={`transfer-tab-btn ${activeTab === 'approve' ? 'active' : ''}`}
            onClick={() => { setActiveTab('approve'); setSelectedSlipDetail(null); }}
            type="button"
          >
            <CheckCircle2 size={16} />
            Duyệt phiếu ({approvals.length})
          </button>
        )}
        <button
          className={`transfer-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => { setActiveTab('history'); setSelectedSlipDetail(null); }}
          type="button"
        >
          <FileClock size={16} />
          Lịch sử phiếu ({slips.length})
        </button>
      </div>

      {activeTab === 'approve' && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', paddingBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', height: 'calc(100vh - 200px)', minHeight: '600px' }}>
            
            {/* LEFT: MASTER COLUMN (Pending list) */}
            <div style={{ 
              backgroundColor: '#fff', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0', 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              height: '100%',
              minHeight: 0,
              overflow: 'hidden'
            }}>
              <div style={{ flexShrink: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                  Danh sách chờ duyệt
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Bạn có {approvals.length} phiếu cần phê duyệt
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                {approvals.map((approval) => {
                  const isActive = selectedSlipDetail && selectedSlipDetail.SoPhieu === approval.maPhieu;
                  return (
                    <div 
                      key={`${approval.loaiPhieu}-${approval.maPhieu}`}
                      onClick={() => {
                        setSelectedSlipDetail({ SoPhieu: approval.maPhieu, isLoading: true });
                        api.getTransferSlip(approval.maPhieu)
                          .then(d => setSelectedSlipDetail(d))
                          .catch(() => setSelectedSlipDetail({ SoPhieu: approval.maPhieu, isMocked: true }));
                      }}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '1.5px solid',
                        borderColor: isActive ? '#3b82f6' : '#e2e8f0',
                        backgroundColor: isActive ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease-in-out',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isActive ? '#1d4ed8' : '#1e293b' }}>
                          {approval.maPhieu}
                        </span>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          color: isActive ? '#1d4ed8' : '#475569', 
                          backgroundColor: isActive ? '#dbeafe' : '#f1f5f9', 
                          padding: '2px 6px', 
                          borderRadius: '4px' 
                        }}>
                          {approval.loaiPhieu || 'Điều chuyển'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
                        Người lập: <strong>{approval.nguoiLap}</strong>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} />
                        {formatDateTime(approval.ngay) !== '—' ? formatDateTime(approval.ngay) : relativeDate(approval.ngay)}
                      </div>
                    </div>
                  );
                })}
                {!approvals.length && (
                  <EmptyState text="Không có phiếu nào cần phê duyệt" />
                )}
              </div>
            </div>

            {/* RIGHT: DETAIL COLUMN (Selected Slip Detail View) */}
            <div style={{ 
              backgroundColor: '#fff', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0', 
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              height: '100%',
              minHeight: 0,
              overflowY: 'auto'
            }}>
              {!selectedSlipDetail ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', color: '#94a3b8' }}>
                  <PackageSearch size={48} strokeWidth={1.5} />
                  <p style={{ marginTop: '12px', fontSize: '0.95rem' }}>Chọn một phiếu ở danh sách bên trái để phê duyệt</p>
                </div>
              ) : selectedSlipDetail.isLoading ? (
                <div className="skeleton-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                  {/* Title & Status Skeleton */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                        <div style={{ height: '1.2rem', width: '300px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ height: '0.85rem', width: '120px', backgroundColor: '#f1f5f9', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                    <div style={{ height: '34px', width: '100px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}></div>
                  </div>

                  {/* General Info Cards Skeleton */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <div style={{ height: '13px', width: '80px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                        </div>
                        <div style={{ height: '0.92rem', width: '120px', backgroundColor: '#cbd5e1', borderRadius: '2px', marginTop: '6px' }}></div>
                      </div>
                    ))}
                  </div>

                  {/* Assets Table Skeleton */}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: '10px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ height: '16px', width: '16px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                    <div style={{ height: '0.95rem', width: '180px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                  </h4>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '10px 14px' }}><div style={{ height: '0.8rem', width: '60px', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div></th>
                          <th style={{ padding: '10px 14px' }}><div style={{ height: '0.8rem', width: '60px', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div></th>
                          <th style={{ padding: '10px 14px' }}><div style={{ height: '0.8rem', width: '60px', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div></th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1].map(i => (
                          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ height: '0.88rem', width: '150px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                              <div style={{ height: '0.75rem', width: '80px', backgroundColor: '#f1f5f9', borderRadius: '2px', marginTop: '4px' }}></div>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ height: '0.8rem', width: '120px', backgroundColor: '#f1f5f9', borderRadius: '2px' }}></div>
                              <div style={{ height: '0.8rem', width: '120px', backgroundColor: '#f1f5f9', borderRadius: '2px', marginTop: '4px' }}></div>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ height: '0.8rem', width: '100px', backgroundColor: '#f1f5f9', borderRadius: '2px' }}></div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Approvals Progress Skeleton */}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: '10px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ height: '16px', width: '16px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                    <div style={{ height: '0.95rem', width: '180px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                  </h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {[1].map(i => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '10px 14px', 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0' 
                      }}>
                        <div>
                          <div style={{ height: '0.9rem', width: '140px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                          <div style={{ height: '0.78rem', width: '100px', backgroundColor: '#f1f5f9', borderRadius: '2px', marginTop: '4px' }}></div>
                        </div>
                        <div style={{ height: '22px', width: '80px', backgroundColor: '#fef3c7', borderRadius: '9999px' }}></div>
                      </div>
                    ))}
                  </div>

                  {/* Actions Toolbar Skeleton */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '12px', 
                    borderTop: '1px solid #f1f5f9', 
                    paddingTop: '20px',
                    marginTop: 'auto'
                  }}>
                    <div style={{ width: '120px', height: '38px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}></div>
                    <div style={{ width: '160px', height: '38px', backgroundColor: '#e2e8f0', borderRadius: '6px' }}></div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                  {/* Title & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                        Chi tiết phiếu điều chuyển {selectedSlipDetail.SoPhieu}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                        Trạng thái duyệt: <StatusPill value={selectedSlipDetail.TrangThaiDuyet} />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        window.print();
                      }}
                      style={{ height: '34px', fontSize: '0.85rem' }}
                    >
                      <Printer size={14} /> In Biên bản
                    </button>
                  </div>

                  {/* General Info Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                        <User size={13} /> Người lập phiếu
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                        {selectedSlipDetail.NguoiLapTen || selectedSlipDetail.NguoiLap || '—'}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                        <Clock size={13} /> Ngày lập phiếu
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                        {formatDate(selectedSlipDetail.NgayLap)}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#eff6ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                        <Calendar size={13} /> Ngày điều chuyển
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1d4ed8' }}>
                        {formatDate(selectedSlipDetail.NgayDieuChuyen)}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                        <Edit3 size={13} /> Ghi chú
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedSlipDetail.GhiChu || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Không có ghi chú</span>}
                      </div>
                    </div>
                  </div>

                  {/* Assets Table */}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: '10px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PackageSearch size={16} color="#3b82f6" /> Danh sách tài sản điều chuyển
                  </h4>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TÀI SẢN</th>
                          <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>LUÂN CHUYỂN</th>
                          <th style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>LÝ DO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedSlipDetail.items || []).map((ts: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.88rem' }}>{ts.TenTaiSan}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1px' }}>{ts.MaTaiSan}</div>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Từ: {ts.TuPhongBanTen || ts.TuPhongBan}</div>
                              <div style={{ fontSize: '0.8rem', color: '#2e795b', fontWeight: 500, marginTop: '1px' }}>Đến: {ts.DenPhongBanTen || ts.DenPhongBan}</div>
                            </td>
                            <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#475569' }}>
                              {ts.LyDo || <em style={{ color: '#cbd5e1' }}>Không có lý do riêng</em>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Approvals Progress */}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: '10px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="#10b981" /> Trạng thái phê duyệt
                  </h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {(selectedSlipDetail.approvals || []).map((kd: any, idx: number) => {
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
                          padding: '10px 14px', 
                          backgroundColor: '#f8fafc', 
                          borderRadius: '8px', 
                          border: '1px solid #e2e8f0' 
                        }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                              {kd.HoTen || kd.MaNhanVien}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px' }}>
                              Vai trò: {kd.TenVaiTro || 'Người duyệt'}
                            </div>
                          </div>
                          <span style={{ 
                            fontSize: '0.78rem', 
                            padding: '3px 8px', 
                            borderRadius: '4px', 
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

                  {/* Actions Toolbar */}
                  {pendingApproval && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end', 
                      gap: '12px', 
                      borderTop: '1px solid #f1f5f9', 
                      paddingTop: '20px',
                      marginTop: 'auto'
                    }}>
                      <button
                        className="secondary-button danger-text"
                        onClick={async () => {
                          if (!onSignApproval) return;
                          setIsSigning(true);
                          try {
                            await onSignApproval(pendingApproval, 'TU_CHOI');
                            setSelectedSlipDetail(null);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsSigning(false);
                          }
                        }}
                        type="button"
                        disabled={isSigning}
                        style={{ minWidth: '120px', height: '38px', fontSize: '0.9rem' }}
                      >
                        {isSigning ? <Loader2 size={16} className="spin" style={{ margin: '0 auto' }} /> : 'Từ chối'}
                      </button>
                      
                      <button
                        className="primary-button"
                        onClick={async () => {
                          if (!onSignApproval) return;
                          setIsSigning(true);
                          try {
                            await onSignApproval(pendingApproval, 'DA_KY');
                            setSelectedSlipDetail(null);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsSigning(false);
                          }
                        }}
                        type="button"
                        disabled={isSigning}
                        style={{ minWidth: '160px', height: '38px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        {isSigning ? (
                          <>
                            <Loader2 size={16} className="spin" />
                            Đang duyệt...
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            Xác nhận ký duyệt
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="gov-layout" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* CỘT TRÁI: KHU VỰC THAO TÁC & QUÉT QR */}
          <div className="gov-card no-print">
            <div className="gov-card-body">
              <button
                type="button"
                className="gov-qr-btn"
                onClick={() => setShowScanner(true)}
              >
                <Camera size={22} /> Quét mã QR Tài sản
              </button>

              <div className="gov-instruction-box">
                <strong>Tự động điền thông tin tài sản</strong>
                <i>*Không bắt buộc sử dụng</i>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px dashed #cbd5e1', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '12px', textTransform: 'uppercase' }}>
                  Hoặc chọn thủ công
                </h4>
                
                {/* Bước 1: Chọn phòng ban chứa tài sản */}
                <div className="gov-field" style={{ marginBottom: '16px' }}>
                  <label>Phòng ban nguồn <span>*</span></label>
                  <select
                    className="gov-select"
                    value={sourceDept}
                    onChange={e => { setSourceDept(e.target.value); setAssetRows([]); }}
                    required
                  >
                    <option value="">— Chọn phòng ban —</option>
                    {departments.map(d => (
                      <option key={d.maPhongBan} value={d.maPhongBan}>{d.tenPhongBan}</option>
                    ))}
                  </select>
                </div>

                {/* Chọn & Tìm kiếm tài sản */}
                {sourceDept ? (
                  <div>
                    <div className="search-box" style={{ width: '100%', marginBottom: '12px', height: '36px', minHeight: '36px' }}>
                      <Search size={14} color="#94a3b8" />
                      <input
                        value={step2Search}
                        onChange={e => setStep2Search(e.target.value)}
                        placeholder="Tìm tài sản trong phòng..."
                        style={{ height: '32px', fontSize: '0.82rem' }}
                      />
                    </div>

                    <div className="transfer-pool-list" style={{ maxHeight: '300px' }}>
                      {availableAssets.map(a => (
                        <div key={a.maTaiSan} className="transfer-pool-item" style={{ cursor: 'pointer' }} onClick={() => setAssetRows([...assetRows, { maTaiSan: a.maTaiSan, denPhongBan: quickDestDept || '', lyDo: quickReason || '' }])}>
                          <div className="transfer-pool-item-info">
                            <div className="transfer-pool-item-name" style={{ fontSize: '0.82rem' }}>{a.tenTaiSan}</div>
                            <div className="transfer-pool-item-meta" style={{ fontSize: '0.7rem' }}>{a.maQR || a.maTaiSan}</div>
                          </div>
                          <div className="transfer-pool-item-action">
                            <button
                              type="button"
                              className="secondary-button"
                              style={{ padding: '2px 6px', fontSize: '0.72rem', height: '24px', minHeight: '24px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssetRows([...assetRows, { maTaiSan: a.maTaiSan, denPhongBan: quickDestDept || '', lyDo: quickReason || '' }]);
                              }}
                            >
                              Thêm
                            </button>
                          </div>
                        </div>
                      ))}
                      {availableAssets.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '24px 10px', color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic' }}>
                          {filteredSourceAssets.length === 0 ? 'Phòng ban không có tài sản nào khả dụng' : 'Đã thêm tất cả tài sản vào phiếu'}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', border: '1px dashed #e2e8f0', borderRadius: '6px' }}>
                    Vui lòng chọn phòng ban.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM KHAI BÁO */}
          <form onSubmit={submit} className="gov-card">
            <div className="gov-card-header">
              <h3>Thông tin Điều chuyển Tài sản</h3>
            </div>
            
            <div className="gov-card-body">
              
              {/* Form Lưới Grid */}
              <div className="gov-form-grid">
                
                <div className="gov-field">
                  <label>Người lập yêu cầu <span>*</span></label>
                  <input
                    type="text"
                    className="gov-input"
                    value={employees.find(e => e.maNhanVien === nguoiLap)?.hoTen || nguoiLap}
                    readOnly
                    title="Tài khoản đang đăng nhập"
                  />
                </div>

                <div className="gov-field">
                  <label>Bộ phận chuyển (Nguồn) <span>*</span></label>
                  <input
                    type="text"
                    className="gov-input"
                    value={departments.find(d => d.maPhongBan === sourceDept)?.tenPhongBan || ''}
                    readOnly
                    placeholder="Chưa xác định"
                  />
                </div>

                <div className="gov-field">
                  <label>Ngày điều chuyển <span>*</span></label>
                  <input
                    type="date"
                    className="gov-input"
                    value={ngayDieuChuyenInput}
                    onChange={e => setNgayDieuChuyenInput(e.target.value)}
                    required
                  />
                </div>
                <div className="gov-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Lý do / Mục đích điều chuyển <span>*</span></label>
                  <input
                    className="gov-input"
                    value={ghiChu}
                    onChange={e => setGhiChu(e.target.value)}
                    placeholder="Ví dụ: Phục vụ công tác giảng dạy..."
                    required
                  />
                </div>
              </div>

              {/* Bảng Danh sách Tài sản (Asset Table) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#374151', fontWeight: 600 }}>Danh sách thiết bị</h4>
                
                {assetRows.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      className="gov-select"
                      value={quickDestDept}
                      onChange={e => setQuickDestDept(e.target.value)}
                      style={{ height: '32px', padding: '0 8px' }}
                    >
                      <option value="">— Chọn nhanh Nơi đến —</option>
                      {departments.filter(d => d.maPhongBan !== sourceDept).map(d => (
                        <option key={d.maPhongBan} value={d.maPhongBan}>{d.tenPhongBan}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ height: '32px', minHeight: '32px', padding: '0 12px', fontSize: '0.8rem' }}
                      onClick={() => {
                        if (!quickDestDept) { setToast({ message: 'Vui lòng chọn phòng nhận trước!' }); return; }
                        setAssetRows(assetRows.map(row => ({ ...row, denPhongBan: quickDestDept })));
                        setToast({ message: 'Đã áp dụng phòng nhận cho toàn bộ tài sản đang chọn!' });
                      }}
                    >
                      Áp dụng
                    </button>
                  </div>
                )}
              </div>

              <div className="gov-table-wrapper">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>STT</th>
                      <th style={{ width: '120px' }}>Mã TS</th>
                      <th>Tên tài sản</th>
                      <th style={{ width: '220px' }}>Phòng ban nhận <span>*</span></th>
                      <th style={{ width: '200px' }}>Ghi chú</th>
                      <th style={{ width: '40px', textAlign: 'center' }}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                          Chưa có tài sản nào. Vui lòng quét mã QR hoặc chọn từ danh sách bên trái.
                        </td>
                      </tr>
                    ) : (
                      assetRows.map((row, index) => {
                        const assetObj = assets.find(a => a.maTaiSan === row.maTaiSan);
                        return (
                          <tr key={row.maTaiSan}>
                            <td style={{ textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{row.maTaiSan}</td>
                            <td style={{ fontWeight: 600 }}>{assetObj?.tenTaiSan}</td>
                            <td>
                              <select
                                className="gov-select"
                                value={row.denPhongBan}
                                onChange={e => setAssetRows(assetRows.map(r => r.maTaiSan === row.maTaiSan ? { ...r, denPhongBan: e.target.value } : r))}
                                required
                                style={{ height: '32px', padding: '0 8px' }}
                              >
                                <option value="">— Chọn phòng nhận —</option>
                                {departments.filter(d => d.maPhongBan !== sourceDept).map(d => (
                                  <option key={d.maPhongBan} value={d.maPhongBan}>{d.tenPhongBan}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                className="gov-input"
                                value={row.lyDo}
                                onChange={e => setAssetRows(assetRows.map(r => r.maTaiSan === row.maTaiSan ? { ...r, lyDo: e.target.value } : r))}
                                placeholder="..."
                                style={{ height: '32px', padding: '0 8px' }}
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setAssetRows(assetRows.filter(r => r.maTaiSan !== row.maTaiSan))}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              >
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>



            </div>

            {/* Các nút lệnh web dưới cùng */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', borderTop: '2px solid #cbd5e1', paddingTop: '16px' }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setGhiChu(''); setSourceDept(''); setAssetRows([]);
                  setNgayDieuChuyenInput(todayVietnam());
                  setToast({ message: 'Đã làm mới biểu mẫu.' });
                }}
                style={{ height: '40px', padding: '0 20px' }}
              >
                Làm mới phiếu
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  const creatorId = nguoiLap || (employees.length > 0 ? employees[0].maNhanVien : '');
                  if (!creatorId) { setToast({ message: 'Vui lòng chọn người lập phiếu!' }); return; }
                  if (!sourceDept) { setToast({ message: 'Vui lòng chọn phòng ban nguồn!' }); return; }
                  if (assetRows.length === 0) { setToast({ message: 'Vui lòng chọn ít nhất 1 tài sản!' }); return; }
                  if (assetRows.some(r => !r.denPhongBan)) { setToast({ message: 'Còn tài sản chưa được chọn nơi nhận!' }); return; }
                  setShowConfirmModal(true);
                }}
                style={{ height: '40px', fontSize: '0.92rem', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={16} /> Xem lại & Gửi duyệt phiếu
              </button>
            </div>
          </form>

        </div>
      )}

      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '640px',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Bản tóm tắt phiếu điều chuyển</h2>
              <button onClick={() => setShowConfirmModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <p style={{ color: '#475569', marginBottom: '20px', marginTop: 0 }}>Kiểm tra thông tin trước khi hoàn tất gửi phê duyệt.</p>
              
              <div className="transfer-summary-card">
                <div className="transfer-summary-grid">
                  <div className="transfer-summary-item">
                    <span>Người lập phiếu</span>
                    <strong>{employees.find(e => e.maNhanVien === nguoiLap)?.hoTen || nguoiLap || employees[0]?.hoTen}</strong>
                  </div>
                  <div className="transfer-summary-item">
                    <span>Phòng nguồn</span>
                    <strong>{departments.find(d => d.maPhongBan === sourceDept)?.tenPhongBan || sourceDept}</strong>
                  </div>
                  <div className="transfer-summary-item">
                    <span>Ngày điều chuyển</span>
                    <strong style={{color:'#1d6fb4'}}>{formatDate(ngayDieuChuyenInput)}</strong>
                  </div>
                  <div className="transfer-summary-item">
                    <span>Tổng số tài sản</span>
                    <strong>{assetRows.length} tài sản đang chọn</strong>
                  </div>
                </div>
                {ghiChu && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Ghi chú tổng thể</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#374151' }}>{ghiChu}</p>
                  </div>
                )}
              </div>


              <h3 style={{ fontSize: '0.9rem', marginBottom: '12px', marginTop: '20px' }}>Danh sách tài sản và nơi nhận:</h3>
              <div className="table-wrap" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Tên tài sản</th>
                      <th>Phòng nhận</th>
                      <th>Lý do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetRows.map(row => {
                      const assetObj = assets.find(a => a.maTaiSan === row.maTaiSan);
                      const deptObj = departments.find(d => d.maPhongBan === row.denPhongBan);
                      return (
                        <tr key={row.maTaiSan}>
                          <td>{assetObj?.tenTaiSan} ({row.maTaiSan})</td>
                          <td><strong style={{ color: '#2e795b' }}>{deptObj?.tenPhongBan || row.denPhongBan}</strong></td>
                          <td>{row.lyDo || <em style={{ color: '#9ca3af' }}>Không có lý do riêng</em>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
              <button
                className="secondary-button"
                onClick={() => setShowConfirmModal(false)}
                type="button"
                style={{ height: '42px' }}
              >
                Hủy
              </button>
              <button
                className="primary-button"
                onClick={submit}
                type="button"
                style={{ height: '42px', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang lập phiếu...</>
                ) : (
                  <><CheckCircle2 size={18} /> Xác nhận & Gửi duyệt</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showScanner && (
        <QRScannerModal 
          onClose={() => setShowScanner(false)} 
          onScanSuccess={handleScanSuccess} 
        />
      )}

      {activeTab === 'history' && (
        <section className="panel full">
          <div className="panel-header">
            <h2>Lịch sử phiếu điều chuyển</h2>
            <div className="panel-actions">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: '180px', height: '36px', minHeight: '36px' }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="CHO_KY">Chờ duyệt</option>
                <option value="DA_DUYET">Đã phê duyệt</option>
                <option value="TU_CHOI">Bị từ chối</option>
              </select>
              <button className="icon-button" onClick={onRefresh} title="Tải lại">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Số Phiếu</th>
                  <th>Ngày Điều Chuyển</th>
                  <th>Trạng Thái</th>
                  <th>Người Lập</th>
                  <th>Số Tài Sản</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlips.map(slip => (
                  <tr 
                    key={slip.SoPhieu} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      // Open modal instantly with basic info and loading state
                      setSelectedSlipDetail({ ...slip, isLoading: true });
                      
                      api.getTransferSlip(slip.SoPhieu)
                        .then(detail => {
                          setSelectedSlipDetail(detail);
                        })
                        .catch(() => {
                          setSelectedSlipDetail({ ...slip, isMocked: true });
                        });
                    }}
                  >
                    <td><strong>{slip.SoPhieu}</strong></td>
                    <td>
                      <span title={`Ngày lập: ${formatDate(slip.NgayLap)}`}>
                        {formatDate(slip.NgayDieuChuyen)}
                      </span>
                    </td>
                    <td><StatusPill value={slip.TrangThaiDuyet} /></td>
                    <td>{slip.NguoiLapTen || slip.NguoiLap}</td>
                    <td>{slip.TongTaiSan || 0} tài sản</td>
                  </tr>
                ))}
                {!filteredSlips.length && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                      <EmptyState text="Không tìm thấy phiếu điều chuyển nào phù hợp." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedSlipDetail && activeTab !== 'approve' && (
        <div className="modal-backdrop" style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', padding: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  Chi tiết phiếu điều chuyển
                  <StatusPill value={selectedSlipDetail.TrangThaiDuyet} />
                </h2>
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Mã phiếu: {selectedSlipDetail.SoPhieu}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => window.print()}
                  style={{ height: '36px' }}
                >
                  <Printer size={16} /> In Biên bản
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => { setSelectedSlipDetail(null); setReceiptMode(false); }}
                  style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#fff' }}>

              {/* General Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 500 }}>
                    <User size={14} /> Người lập phiếu
                  </div>
                  <div style={{ fontSize: '0.97rem', fontWeight: 600, color: '#334155' }}>
                    {selectedSlipDetail.NguoiLapTen || selectedSlipDetail.NguoiLap || '—'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 500 }}>
                    <Clock size={14} /> Ngày lập phiếu
                  </div>
                  <div style={{ fontSize: '0.97rem', fontWeight: 600, color: '#334155' }}>
                    {formatDate(selectedSlipDetail.NgayLap)}
                  </div>
                  {selectedSlipDetail.NgayLap && (
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                      {relativeDate(selectedSlipDetail.NgayLap)}
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: '#eff6ff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 500 }}>
                    <Calendar size={14} /> Ngày điều chuyển
                  </div>
                  <div style={{ fontSize: '0.97rem', fontWeight: 600, color: '#1d4ed8' }}>
                    {formatDate(selectedSlipDetail.NgayDieuChuyen)}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 500 }}>
                    <Edit3 size={14} /> Ghi chú
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                    {selectedSlipDetail.GhiChu || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Không có ghi chú</span>}
                  </div>
                </div>
              </div>

              {/* Assets Section */}
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PackageSearch size={20} color="#3b82f6" /> Danh sách tài sản điều chuyển
                {selectedSlipDetail.TrangThaiDuyet === 'DA_DUYET' && !receiptMode && (
                  <button 
                    className="primary-button" 
                    style={{ marginLeft: 'auto', height: '32px', fontSize: '0.85rem' }}
                    onClick={() => {
                      setReceiptMode(true);
                      setReceiptItems([]);
                    }}
                  >
                    Xác nhận Bàn giao / Nhận tài sản
                  </button>
                )}
              </h3>
              
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>TÀI SẢN</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>LUÂN CHUYỂN</th>
                      {receiptMode ? (
                        <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>XÁC NHẬN</th>
                      ) : (
                        <th style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>LÝ DO / TRẠNG THÁI</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSlipDetail.items || []).map((ts: any, idx: number) => {
                      const rItem = receiptItems.find(r => r.maTaiSan === ts.MaTaiSan);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.92rem' }}>{ts.TenTaiSan}</div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{ts.MaTaiSan}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Từ: {ts.TuPhongBanTen || ts.TuPhongBan}</div>
                            <div style={{ fontSize: '0.85rem', color: '#2e795b', fontWeight: 500, marginTop: '2px' }}>Đến: {ts.DenPhongBanTen || ts.DenPhongBan}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {receiptMode ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <select 
                                  value={rItem?.hanhDong || ''}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setReceiptItems(prev => {
                                      const filtered = prev.filter(p => p.maTaiSan !== ts.MaTaiSan);
                                      if (val) return [...filtered, { maTaiSan: ts.MaTaiSan, hanhDong: val as any, ghiChu: rItem?.ghiChu || '' }];
                                      return filtered;
                                    });
                                  }}
                                  style={{ height: '32px', fontSize: '0.85rem', border: rItem ? '1px solid #2e795b' : '1px solid #cbd5e1' }}
                                >
                                  <option value="">— Chọn trạng thái nhận —</option>
                                  <option value="DA_NHAN">Đã nhận đủ & nguyên vẹn</option>
                                  <option value="TU_CHOI">Từ chối nhận (Trả về)</option>
                                </select>
                                <input 
                                  placeholder="Ghi chú tình trạng (nếu có)..."
                                  value={rItem?.ghiChu || ''}
                                  onChange={e => {
                                    const val = e.target.value;
                                    if (rItem) {
                                      setReceiptItems(prev => prev.map(p => p.maTaiSan === ts.MaTaiSan ? { ...p, ghiChu: val } : p));
                                    }
                                  }}
                                  style={{ height: '28px', fontSize: '0.8rem', padding: '0 8px' }}
                                />
                              </div>
                            ) : (
                              <>
                                <div style={{ fontSize: '0.85rem', color: '#334155' }}>{ts.LyDo || <em style={{ color: '#cbd5e1' }}>Không có lý do riêng</em>}</div>
                                {ts.TrangThaiNhan !== 'CHO_NHAN' && ts.TrangThaiNhan && (
                                  <div style={{ marginTop: '4px' }}>
                                    <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: ts.TrangThaiNhan === 'DA_NHAN' ? '#dcfce7' : '#fee2e2', color: ts.TrangThaiNhan === 'DA_NHAN' ? '#166534' : '#991b1b' }}>
                                      {ts.TrangThaiNhan === 'DA_NHAN' ? 'Đã nhận' : 'Từ chối'}
                                    </span>
                                    {ts.GhiChuNhan && <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '6px' }}>({ts.GhiChuNhan})</span>}
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {selectedSlipDetail.isLoading ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '40px 24px' }}>
                          <Loader2 className="spin" size={28} style={{ color: '#94a3b8', margin: '0 auto' }} />
                          <div style={{ color: '#64748b', marginTop: '12px', fontSize: '0.9rem' }}>Đang tải dữ liệu chi tiết...</div>
                        </td>
                      </tr>
                    ) : !(selectedSlipDetail.items || []).length ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '24px' }}>
                          <EmptyState text="Chưa có thông tin chi tiết tài sản" />
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {receiptMode && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <button className="secondary-button" onClick={() => { setReceiptMode(false); setReceiptItems([]); }}>
                    Hủy xác nhận
                  </button>
                  <button className="primary-button" onClick={submitReceipt} disabled={isSubmittingReceipt}>
                    {isSubmittingReceipt ? <Loader2 size={16} className="spin" /> : <Save size={16} />} 
                    Lưu kết quả bàn giao
                  </button>
                </div>
              )}

              {/* Approvals Section (Visual Timeline) */}
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#10b981" /> Trạng thái phê duyệt
              </h3>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                {selectedSlipDetail.isLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Loader2 className="spin" size={28} style={{ color: '#94a3b8', margin: '0 auto' }} />
                    <div style={{ color: '#64748b', marginTop: '12px', fontSize: '0.9rem' }}>Đang tải...</div>
                  </div>
                ) : !(selectedSlipDetail.approvals || []).length ? (
                  <EmptyState text="Chưa có thông tin tuyến duyệt" />
                ) : (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(selectedSlipDetail.approvals || []).map((kd: any, idx: number) => {
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
                          backgroundColor: '#fff', 
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
                                Thời gian: {formatDateTime(kd.ThoiGianKy)}
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
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                className="secondary-button"
                onClick={() => setSelectedSlipDetail(null)}
                style={{ padding: '8px 24px', fontSize: '0.95rem' }}
                disabled={isSigning}
              >
                Đóng
              </button>
              
              {pendingApproval && (
                <>
                  <button
                    className="secondary-button danger-text"
                    onClick={async () => {
                      if (!onSignApproval) return;
                      setIsSigning(true);
                      try {
                        await onSignApproval(pendingApproval, 'TU_CHOI');
                        setSelectedSlipDetail(null);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsSigning(false);
                      }
                    }}
                    type="button"
                    disabled={isSigning}
                    style={{ minWidth: '120px', height: '38px', fontSize: '0.95rem' }}
                  >
                    {isSigning ? <Loader2 size={16} className="spin" style={{ margin: '0 auto' }} /> : 'Từ chối'}
                  </button>
                  
                  <button
                    className="primary-button"
                    onClick={async () => {
                      if (!onSignApproval) return;
                      setIsSigning(true);
                      try {
                        await onSignApproval(pendingApproval, 'DA_KY');
                        setSelectedSlipDetail(null);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsSigning(false);
                      }
                    }}
                    type="button"
                    disabled={isSigning}
                    style={{ minWidth: '160px', height: '38px', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {isSigning ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        Đang duyệt...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Xác nhận ký duyệt
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Print Layout */}
      <PrintTransferSlip 
        slipDetail={selectedSlipDetail} 
        departments={departments} 
        employees={employees} 
      />
    </div>
  );
}

export default TransferPage;
