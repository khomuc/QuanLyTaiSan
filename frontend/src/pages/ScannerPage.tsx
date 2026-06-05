import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  QrCode,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Save,
  ArrowLeft,
  Search,
  Flashlight,
  FlashlightOff,
  ListChecks,
} from 'lucide-react';
import { useZxing } from 'react-zxing';
import { useNavigate, useParams } from 'react-router-dom';
import { inventoryApi } from '../lib/apis/inventoryApi';
import { Toast } from '../components/Toast';

type ScanStatus = 'success' | 'error' | 'pending';
type AssetStatusFilter = 'all' | 'scanned' | 'missing';

type ScanHistoryItem = {
  time: string;
  maTaiSan: string;
  tenTaiSan: string;
  status: ScanStatus;
  message: string;
};

type Department = {
  MaPhongBan: string;
  TenPhongBan: string;
};

function unwrapData<T>(data: any, fallback: T): T {
  if (!data) return fallback;
  if (data.data !== undefined) return data.data as T;
  if (data.result !== undefined) return data.result as T;
  return data as T;
}

function formatDateTime(value?: string | Date) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('vi-VN', {
    hour12: false,
  });
}

function formatCurrency(value: any) {
  const numberValue = Number(value || 0);

  if (!numberValue) return '-';

  return numberValue.toLocaleString('vi-VN') + ' đ';
}

function formatHaoMon(value: any) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const text = String(value).trim();

  if (!text) return '';

  if (text.includes('%')) {
    return text;
  }

  return `${text}%`;
}

function getAssetValue(asset: any, keys: string[], fallback = '') {
  for (const key of keys) {
    if (
      asset?.[key] !== undefined &&
      asset?.[key] !== null &&
      asset?.[key] !== ''
    ) {
      return asset[key];
    }
  }

  return fallback;
}

function getResultText(result: any) {
  if (result?.rawValue) return String(result.rawValue);
  if (typeof result?.getText === 'function') return String(result.getText());
  return '';
}

export default function ScannerPage() {
  const navigate = useNavigate();
  const { maKiemKe } = useParams();

  const [scanning, setScanning] = useState(true);
  const [torchEnabled, setTorchEnabled] = useState(false);

  const [assets, setAssets] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [assetKeyword, setAssetKeyword] = useState('');
  const [assetStatusFilter, setAssetStatusFilter] =
    useState<AssetStatusFilter>('all');

  const [manualCode, setManualCode] = useState('');
  const [currentAsset, setCurrentAsset] = useState<any | null>(null);

  const [form, setForm] = useState({
    haoMonLuyKe: '',
    viTriHienTai: '',
    ghiChu: '',
  });

  const [loadingAssets, setLoadingAssets] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingAsset, setLoadingAsset] = useState(false);
  const [saving, setSaving] = useState(false);

  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [message, setMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const lastScanRef = useRef('');
  const lastScanTimeRef = useRef(0);

  const showToast = (
    msg: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setMessage(msg);
    setToastType(type);
  };

  const addHistory = (item: Omit<ScanHistoryItem, 'time'>) => {
    setScanHistory((prev) => [
      {
        ...item,
        time: formatDateTime(),
      },
      ...prev,
    ]);
  };

  const loadAssets = async () => {
    if (!maKiemKe) return;

    setLoadingAssets(true);

    try {
      const res = await inventoryApi.getAssets(maKiemKe);
      setAssets(unwrapData<any[]>(res, []));
    } catch (error: any) {
      showToast(
        error.message || 'Không thể tải danh sách tài sản kiểm kê',
        'error',
      );
    } finally {
      setLoadingAssets(false);
    }
  };

  const loadDepartments = async () => {
    setLoadingDepartments(true);

    try {
      const res = await inventoryApi.getDepartments();
      setDepartments(unwrapData<Department[]>(res, []));
    } catch (error: any) {
      showToast(
        error.message || 'Không thể tải danh sách phòng ban',
        'error',
      );
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {
    loadAssets();
    loadDepartments();
  }, [maKiemKe]);

  const scannedCount = useMemo(() => {
    return assets.filter((asset) => Number(asset.DaQuet || asset.daQuet) === 1)
      .length;
  }, [assets]);

  const totalCount = assets.length;

  const progressPercent = useMemo(() => {
    if (!totalCount) return 0;
    return Math.round((scannedCount / totalCount) * 100);
  }, [scannedCount, totalCount]);

  const filteredAssets = useMemo(() => {
    const keyword = assetKeyword.toLowerCase().trim();

    return assets.filter((asset) => {
      const maTaiSan = String(
        getAssetValue(asset, ['MaTaiSan', 'maTaiSan']),
      ).toLowerCase();

      const maQr = String(
        getAssetValue(asset, ['MaQR', 'maQR']),
      ).toLowerCase();

      const tenTaiSan = String(
        getAssetValue(asset, ['TenTaiSan', 'tenTaiSan']),
      ).toLowerCase();

      const tenLoai = String(
        getAssetValue(asset, ['TenLoai', 'tenLoai']),
      ).toLowerCase();

      const viTri = String(
        getAssetValue(asset, [
          'TenPhongBan',
          'tenPhongBan',
          'ViTriHeThong',
          'viTriHeThong',
          'ViTriHienTai',
          'viTriHienTai',
        ]),
      ).toLowerCase();

      const daQuet = Number(asset.DaQuet || asset.daQuet) === 1;

      const matchKeyword =
        !keyword ||
        maTaiSan.includes(keyword) ||
        maQr.includes(keyword) ||
        tenTaiSan.includes(keyword) ||
        tenLoai.includes(keyword) ||
        viTri.includes(keyword);

      const matchStatus =
        assetStatusFilter === 'all' ||
        (assetStatusFilter === 'scanned' && daQuet) ||
        (assetStatusFilter === 'missing' && !daQuet);

      return matchKeyword && matchStatus;
    });
  }, [assets, assetKeyword, assetStatusFilter]);

  const handleAssetFound = (asset: any) => {
    const haoMonThucTe =
      formatHaoMon(getAssetValue(asset, ['HaoMonLuyKe', 'haoMonLuyKe']));

    const viTri =
      getAssetValue(asset, ['ViTriHienTai', 'viTriHienTai']) ||
      getAssetValue(asset, ['TenPhongBan', 'tenPhongBan']) ||
      getAssetValue(asset, ['ViTriHeThong', 'viTriHeThong']) ||
      '';

    const ghiChu = getAssetValue(asset, ['GhiChu', 'ghiChu'], '') || '';

    setCurrentAsset(asset);

    setForm({
      haoMonLuyKe: haoMonThucTe,
      viTriHienTai: viTri,
      ghiChu,
    });
  };

  const fetchAssetByQrText = async (qrText: string) => {
    if (!maKiemKe) {
      showToast('Thiếu mã kiểm kê trên đường dẫn', 'error');
      return;
    }

    if (!qrText.trim()) {
      showToast('QR không hợp lệ', 'error');

      addHistory({
        maTaiSan: '-',
        tenTaiSan: 'QR không hợp lệ',
        status: 'error',
        message: 'QR rỗng hoặc không đọc được',
      });

      return;
    }

    setLoadingAsset(true);

    try {
      const res = await inventoryApi.scanQrUrlInInventory(maKiemKe, qrText);
      const asset = unwrapData<any>(res, null);

      if (!asset) {
        throw new Error('Không tìm thấy tài sản từ QR');
      }

      console.log(asset);

      handleAssetFound(asset);

      const maTaiSan = getAssetValue(
        asset,
        ['MaTaiSan', 'maTaiSan'],
        '-',
      );

      const tenTaiSan = getAssetValue(
        asset,
        ['TenTaiSan', 'tenTaiSan'],
        '-',
      );

      setManualCode(maTaiSan);

      addHistory({
        maTaiSan,
        tenTaiSan,
        status: 'pending',
        message: 'Đã quét QR URL, chờ lưu kiểm kê',
      });

      showToast('Đã quét được tài sản. Kiểm tra thông tin rồi lưu.');
    } catch (error: any) {
      setCurrentAsset(null);

      addHistory({
        maTaiSan: '-',
        tenTaiSan: 'Không tìm thấy tài sản',
        status: 'error',
        message: error.message || 'Quét QR thất bại',
      });

      showToast(error.message || 'Không tìm thấy tài sản từ QR', 'error');
    } finally {
      setLoadingAsset(false);
    }
  };

  const { torch, ref: qrVideoRef } = useZxing({
    paused: !scanning,
    onDecodeResult(result) {
      const qrText = getResultText(result);
      const now = Date.now();

      if (
        qrText === lastScanRef.current &&
        now - lastScanTimeRef.current < 2500
      ) {
        return;
      }

      lastScanRef.current = qrText;
      lastScanTimeRef.current = now;

      fetchAssetByQrText(qrText);
    },
  });

  useEffect(() => {
    if (!torch) return;

    if (torchEnabled) {
      torch.on?.();
    } else {
      torch.off?.();
    }
  }, [torchEnabled, torch]);

  useEffect(() => {
    if (!scanning && torchEnabled) {
      setTorchEnabled(false);
    }
  }, [scanning, torchEnabled]);

  const lastResult = useMemo(() => {
    if (!currentAsset) return null;

    return {
      maTaiSan: getAssetValue(currentAsset, ['MaTaiSan', 'maTaiSan'], '-'),
      maQr: getAssetValue(currentAsset, ['MaQR', 'maQR'], '-'),
      tenTaiSan: getAssetValue(currentAsset, ['TenTaiSan', 'tenTaiSan'], '-'),
      loaiTaiSan: getAssetValue(currentAsset, ['TenLoai', 'tenLoai'], '-'),
      nguyenGia: formatCurrency(
        getAssetValue(currentAsset, ['NguyenGia', 'nguyenGia']),
      ),
      giaTriConLai: formatCurrency(
        getAssetValue(currentAsset, ['GiaTriConLai', 'giaTriConLai']),
      ),
      haoMonSoSach: formatHaoMon(
        getAssetValue(currentAsset, ['HaoMonLuyKe', 'haoMonLuyKe']),
      ),
      phongBan: getAssetValue(
        currentAsset,
        ['TenPhongBan', 'tenPhongBan', 'ViTriHeThong', 'viTriHeThong'],
        '-',
      ),
      trangThai: getAssetValue(
        currentAsset,
        ['TrangThai', 'trangThai'],
        '-',
      ),
      daQuet: Number(currentAsset.DaQuet || currentAsset.daQuet) === 1,
    };
  }, [currentAsset]);

  const handleManualSearch = () => {
    if (!manualCode.trim()) {
      showToast('Vui lòng nhập URL QR hoặc mã tài sản', 'error');
      return;
    }

    fetchAssetByQrText(manualCode);
  };

  const handleRestartCamera = () => {
    setScanning(false);

    window.setTimeout(() => {
      setScanning(true);
    }, 300);
  };

  const handleClearCurrentAsset = () => {
    setCurrentAsset(null);
    setManualCode('');

    setForm({
      haoMonLuyKe: '',
      viTriHienTai: '',
      ghiChu: '',
    });
  };

  const updateAssetInTable = (
    maTaiSan: string,
    data: {
      haoMonLuyKe: string;
      viTriHienTai: string;
      ghiChu?: string;
    },
  ) => {
    setAssets((prev) =>
      prev.map((asset) => {
        const currentMaTaiSan = getAssetValue(asset, [
          'MaTaiSan',
          'maTaiSan',
        ]);

        if (String(currentMaTaiSan) !== String(maTaiSan)) {
          return asset;
        }

        return {
          ...asset,
          DaQuet: 1,
          daQuet: 1,
          ThoiGianQuet: new Date().toISOString(),
          thoiGianQuet: new Date().toISOString(),
          haoMonLuyKe: data.haoMonLuyKe,
          HaoMonLuyKe: data.haoMonLuyKe,
          ViTriHienTai: data.viTriHienTai,
          viTriHienTai: data.viTriHienTai,
          GhiChu: data.ghiChu || null,
          ghiChu: data.ghiChu || null,
        };
      }),
    );
  };

  const handleSaveInventoryScan = async () => {
    if (!maKiemKe) {
      showToast('Thiếu mã kiểm kê trên đường dẫn', 'error');
      return;
    }

    if (!currentAsset) {
      showToast('Chưa có tài sản để lưu kiểm kê', 'error');
      return;
    }

    const maTaiSan = getAssetValue(
      currentAsset,
      ['MaTaiSan', 'maTaiSan'],
      manualCode,
    );

    if (!maTaiSan) {
      showToast('Thiếu mã tài sản', 'error');
      return;
    }

    if (!form.viTriHienTai.trim()) {
      showToast('Vui lòng chọn vị trí hiện tại', 'error');
      return;
    }

    setSaving(true);

    try {
      await inventoryApi.updateScannedAsset({
        maKiemKe,
        maTaiSan,
        tinhTrangThucTe: form.haoMonLuyKe,
        viTriHienTai: form.viTriHienTai,
        ghiChu: form.ghiChu,
      });

      updateAssetInTable(maTaiSan, form);

      addHistory({
        maTaiSan,
        tenTaiSan: getAssetValue(
          currentAsset,
          ['TenTaiSan', 'tenTaiSan'],
          '-',
        ),
        status: 'success',
        message: 'Đã lưu kiểm kê thành công',
      });

      showToast('Lưu kết quả kiểm kê thành công!');
      handleClearCurrentAsset();
    } catch (error: any) {
      addHistory({
        maTaiSan,
        tenTaiSan: getAssetValue(
          currentAsset,
          ['TenTaiSan', 'tenTaiSan'],
          '-',
        ),
        status: 'error',
        message: error.message || 'Lưu kiểm kê thất bại',
      });

      showToast(error.message || 'Lưu kiểm kê thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAssetFromTable = (asset: any) => {
    handleAssetFound(asset);

    const maTaiSan = getAssetValue(asset, ['MaTaiSan', 'maTaiSan'], '');
    setManualCode(maTaiSan);
  };

  const hasSelectedDepartment = departments.some(
    (department) => department.TenPhongBan === form.viTriHienTai,
  );

  return (
    <div className="assets-layout">
      <section className="panel scanner-toolbar">
        <div className="scanner-toolbar__info">
          <h2>Quét mã QR tài sản</h2>
          <p>
            Đợt kiểm kê:{' '}
            <strong>{maKiemKe || 'Chưa xác định'}</strong>
          </p>
        </div>

        <div className="scanner-toolbar__actions">
          <button
            className="secondary-button"
            onClick={() => navigate('/inventory')}
            type="button"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>

          <button
            className="primary-button"
            onClick={() => setScanning(!scanning)}
            type="button"
          >
            <Camera size={18} />
            {scanning ? 'Dừng quét' : 'Bắt đầu quét'}
          </button>
        </div>
      </section>

      <div className="asset-summary">
        <div className="kpi-tile green">
          <div className="kpi-icon">
            <ListChecks size={20} />
          </div>
          <span>Tổng tài sản</span>
          <strong>{totalCount}</strong>
        </div>

        <div className="kpi-tile amber">
          <div className="kpi-icon">
            <QrCode size={20} />
          </div>
          <span>Đã kiểm kê</span>
          <strong>{scannedCount}</strong>
        </div>

        <div className="kpi-tile red">
          <div className="kpi-icon">
            <AlertCircle size={20} />
          </div>
          <span>Chưa kiểm kê</span>
          <strong>{Math.max(totalCount - scannedCount, 0)}</strong>
        </div>
      </div>

      <section className="panel scanner-progress-panel">
        <div className="panel-header">
          <h2>Tiến độ kiểm kê</h2>
          <span>{progressPercent}%</span>
        </div>

        <div className="scanner-progress">
          <div
            className="scanner-progress__bar"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </section>

      <div className="two-column">
        <section className="panel">
          <div className="panel-header">
            <h2>Camera quét QR URL</h2>

            <span
              className={`status-pill ${scanning ? 'active' : 'inactive'}`}
            >
              {scanning ? 'Đang quét' : 'Tạm dừng'}
            </span>
          </div>

          <div className="scanner-camera">
            <video
              ref={qrVideoRef}
              id="qr-video"
              autoPlay
              playsInline
              muted
              className="scanner-camera__video"
            />

            <div className="scanner-camera__target" />
            <QrCode className="scanner-camera__icon" size={32} />
          </div>

          <div className="scanner-camera__actions">
            <button
              className="secondary-button"
              onClick={handleRestartCamera}
              type="button"
            >
              <RefreshCw size={16} />
              Khởi động lại camera
            </button>

            <button
              className="secondary-button"
              onClick={() => setTorchEnabled(!torchEnabled)}
              disabled={!scanning}
              type="button"
            >
              {torchEnabled ? (
                <FlashlightOff size={16} />
              ) : (
                <Flashlight size={16} />
              )}
              {torchEnabled ? 'Tắt đèn' : 'Bật đèn'}
            </button>
          </div>

          <div className="scanner-manual">
            <div className="search-box scanner-manual__input">
              <Search size={18} />

              <input
                value={manualCode}
                placeholder="Nhập URL QR hoặc mã tài sản..."
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSearch();
                  }
                }}
              />
            </div>

            <button
              className="primary-button"
              onClick={handleManualSearch}
              disabled={loadingAsset}
              type="button"
            >
              {loadingAsset ? 'Đang tìm...' : 'Tìm'}
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Kết quả quét gần nhất</h2>

            {currentAsset ? (
              <CheckCircle
                className="scanner-result-icon--success"
                size={20}
              />
            ) : (
              <AlertCircle
                className="scanner-result-icon--warning"
                size={20}
              />
            )}
          </div>

          {lastResult ? (
            <>
              <div className="status-grid">
                <div className="status-row">
                  <span>Mã tài sản</span>
                  <strong>{lastResult.maTaiSan}</strong>
                </div>

                <div className="status-row">
                  <span>Mã QR / URL</span>
                  <strong>{lastResult.maQr}</strong>
                </div>

                <div className="status-row">
                  <span>Tên tài sản</span>
                  <strong>{lastResult.tenTaiSan}</strong>
                </div>

                <div className="status-row">
                  <span>Loại tài sản</span>
                  <strong>{lastResult.loaiTaiSan}</strong>
                </div>

                <div className="status-row">
                  <span>Nguyên giá</span>
                  <strong>{lastResult.nguyenGia}</strong>
                </div>

                <div className="status-row">
                  <span>Giá trị còn lại</span>
                  <strong>{lastResult.giaTriConLai}</strong>
                </div>

                <div className="status-row">
                  <span>Hao mòn lũy kế sổ sách</span>
                  <strong>{lastResult.haoMonSoSach || '-'}</strong>
                </div>

                <div className="status-row">
                  <span>Phòng ban hệ thống</span>
                  <strong>{lastResult.phongBan}</strong>
                </div>

                <div className="status-row">
                  <span>Trạng thái hệ thống</span>
                  <span className="status-pill active">
                    {lastResult.trangThai}
                  </span>
                </div>

                <div className="status-row">
                  <span>Trạng thái kiểm kê</span>
                  <span
                    className={`status-pill ${lastResult.daQuet ? 'success' : 'queued'
                      }`}
                  >
                    {lastResult.daQuet ? 'Đã quét trước đó' : 'Chưa lưu'}
                  </span>
                </div>
              </div>

              <div className="form-grid scanner-edit-form">
                <label>
                  Hao mòn lũy kế thực tế
                  <input
                    value={form.haoMonLuyKe}
                    placeholder="Ví dụ: 80%"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        haoMonLuyKe: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Vị trí hiện tại
                  <select
                    value={form.viTriHienTai}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        viTriHienTai: e.target.value,
                      })
                    }
                    disabled={loadingDepartments}
                  >
                    <option value="">
                      {loadingDepartments
                        ? 'Đang tải phòng ban...'
                        : '-- Chọn phòng ban --'}
                    </option>

                    {form.viTriHienTai && !hasSelectedDepartment && (
                      <option value={form.viTriHienTai}>
                        {form.viTriHienTai}
                      </option>
                    )}

                    {departments.map((department) => (
                      <option
                        key={department.MaPhongBan}
                        value={department.TenPhongBan}
                      >
                        {department.TenPhongBan}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="scanner-form-full">
                  Ghi chú kiểm kê
                  <input
                    value={form.ghiChu}
                    placeholder="Ví dụ: tài sản hao mòn nhiều hơn so với sổ sách..."
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ghiChu: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  onClick={handleClearCurrentAsset}
                  type="button"
                >
                  Hủy kết quả
                </button>

                <button
                  className="primary-button"
                  onClick={handleSaveInventoryScan}
                  disabled={saving}
                  type="button"
                >
                  <Save size={18} />
                  {saving ? 'Đang lưu...' : 'Lưu kiểm kê'}
                </button>
              </div>
            </>
          ) : (
            <div className="scanner-empty">
              Chưa có tài sản nào được quét.
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Danh sách tài sản cần kiểm kê</h2>
            <p className="scanner-section-desc">
              Bảng này hiển thị toàn bộ tài sản trong đợt kiểm kê và tự cập
              nhật sau khi lưu kết quả quét.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={loadAssets}
            disabled={loadingAssets}
            type="button"
          >
            <RefreshCw size={16} />
            {loadingAssets ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        <div className="scanner-table-toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              value={assetKeyword}
              placeholder="Tìm mã, QR, tên, loại, vị trí tài sản..."
              onChange={(e) => setAssetKeyword(e.target.value)}
            />
          </div>

          <select
            value={assetStatusFilter}
            onChange={(e) =>
              setAssetStatusFilter(e.target.value as AssetStatusFilter)
            }
          >
            <option value="all">Tất cả tài sản</option>
            <option value="scanned">Đã kiểm kê</option>
            <option value="missing">Chưa kiểm kê</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã tài sản</th>
                <th>Mã QR / URL</th>
                <th>Tên tài sản</th>
                <th>Loại</th>
                <th>Nguyên giá</th>
                <th>Giá trị còn lại</th>
                <th>Hao mòn sổ sách</th>
                <th>Hao mòn thực tế</th>
                <th>Phòng ban hệ thống</th>
                <th>Vị trí hiện tại</th>
                <th>Thời gian quét</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filteredAssets.map((asset) => {
                const maTaiSan = getAssetValue(asset, [
                  'MaTaiSan',
                  'maTaiSan',
                ]);

                const daQuet = Number(asset.DaQuet || asset.daQuet) === 1;

                return (
                  <tr
                    key={maTaiSan}
                    className={daQuet ? 'asset-row-scanned' : ''}
                  >
                    <td>
                      <strong>{maTaiSan}</strong>
                    </td>

                    <td>
                      {getAssetValue(asset, ['MaQR', 'maQR'], '-')}
                    </td>

                    <td>
                      {getAssetValue(asset, ['TenTaiSan', 'tenTaiSan'], '-')}
                    </td>

                    <td>
                      {getAssetValue(asset, ['TenLoai', 'tenLoai'], '-')}
                    </td>

                    <td>
                      {formatCurrency(
                        getAssetValue(asset, ['NguyenGia', 'nguyenGia']),
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        getAssetValue(asset, [
                          'GiaTriConLai',
                          'giaTriConLai',
                        ]),
                      )}
                    </td>

                    <td>
                      {formatHaoMon(
                        getAssetValue(asset, ['HaoMonLuyKe', 'haoMonLuyKe']),
                      ) || '-'}
                    </td>

                    <td>
                      {getAssetValue(
                        asset,
                        ['TinhTrangThucTe', 'tinhTrangThucTe'],
                        '-',
                      )}
                    </td>

                    <td>
                      {getAssetValue(
                        asset,
                        ['TenPhongBan', 'tenPhongBan', 'ViTriHeThong'],
                        '-',
                      )}
                    </td>

                    <td>
                      {getAssetValue(
                        asset,
                        ['ViTriHienTai', 'viTriHienTai'],
                        '-',
                      )}
                    </td>

                    <td>
                      {asset.ThoiGianQuet || asset.thoiGianQuet
                        ? formatDateTime(
                          asset.ThoiGianQuet || asset.thoiGianQuet,
                        )
                        : '-'}
                    </td>

                    <td>
                      <span
                        className={`status-pill ${daQuet ? 'success' : 'queued'
                          }`}
                      >
                        {daQuet ? 'Đã kiểm kê' : 'Chưa kiểm kê'}
                      </span>
                    </td>

                    <td>
                      <button
                        className="secondary-button"
                        onClick={() => handleSelectAssetFromTable(asset)}
                        type="button"
                      >
                        {daQuet ? 'Xem / sửa' : 'Nhập nhanh'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!filteredAssets.length && (
                <tr>
                  <td colSpan={13} className="table-empty">
                    {loadingAssets
                      ? 'Đang tải danh sách tài sản...'
                      : 'Không có tài sản phù hợp'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Lịch sử quét trong phiên</h2>
          <span>{scanHistory.length} lượt quét</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Mã tài sản</th>
                <th>Tên tài sản</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>

            <tbody>
              {scanHistory.map((item, index) => (
                <tr key={`${item.time}-${index}`}>
                  <td>{item.time}</td>

                  <td>
                    <strong>{item.maTaiSan}</strong>
                  </td>

                  <td>{item.tenTaiSan}</td>

                  <td>
                    <span
                      className={`status-pill ${item.status === 'success'
                        ? 'success'
                        : item.status === 'error'
                          ? 'inactive'
                          : 'queued'
                        }`}
                    >
                      {item.status === 'success'
                        ? 'Đã lưu'
                        : item.status === 'error'
                          ? 'Lỗi'
                          : 'Chờ lưu'}
                    </span>
                  </td>

                  <td>{item.message}</td>
                </tr>
              ))}

              {!scanHistory.length && (
                <tr>
                  <td colSpan={5} className="table-empty">
                    Chưa có lịch sử quét trong phiên này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel scanner-alert">
        <AlertCircle size={18} />

        <span>
          QR là URL xem thông tin tài sản. Sau khi quét, nhập hao mòn lũy kế
          thực tế và chọn vị trí hiện tại trước khi lưu kiểm kê.
        </span>
      </section>

      <Toast
        message={message}
        onClose={() => setMessage('')}
        type={toastType}
      />
    </div>
  );
}
