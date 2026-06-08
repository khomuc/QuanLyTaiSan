import {
  ClipboardCheck,
  Plus,
  Search,
  Trash2,
  Eye,
  QrCode,
  Calendar,
  RefreshCcw,
  X,
  FileText,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi } from '../../lib/apis/inventoryApi';
import type { Inventory } from '../../lib/types';
import { Toast } from '../../components/Toast';
import { useAuth } from '../../contexts/AuthContext';

const INVENTORY_PERMISSION = {
  MANAGE: 'INVENTORY_MANAGE',
  VIEW: 'INVENTORY_VIEW',
  CREATE: 'INVENTORY_CREATE',
  DELETE: 'INVENTORY_DELETE',
  SCAN: 'INVENTORY_SCAN',
};

function unwrapData<T>(data: any, fallback: T): T {
  if (!data) return fallback;
  if (Array.isArray(data)) return data as T;
  if (data.data !== undefined) return data.data as T;
  if (data.result !== undefined) return data.result as T;
  return data as T;
}

function formatDate(value?: string) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('vi-VN');
}

function getPercent(item: any) {
  const tong = Number(item?.TongTaiSan || item?.tongTaiSan || 0);
  const daKiemKe = Number(item?.DaKiemKe || item?.daKiemKe || 0);

  if (!tong) return 0;

  return Math.round((daKiemKe / tong) * 100);
}

export default function InventoryPage() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const canManageInventory = hasPermission(INVENTORY_PERMISSION.MANAGE);

  const canViewInventory =
    canManageInventory || hasPermission(INVENTORY_PERMISSION.VIEW);

  const canCreateInventory =
    canManageInventory || hasPermission(INVENTORY_PERMISSION.CREATE);

  const canDeleteInventory =
    canManageInventory || hasPermission(INVENTORY_PERMISSION.DELETE);

  const canScanInventory =
    canManageInventory || hasPermission(INVENTORY_PERMISSION.SCAN);

  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedInventory, setSelectedInventory] = useState<any | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [progress, setProgress] = useState<any | null>(null);
  const [missingAssets, setMissingAssets] = useState<any[]>([]);
  const [scannedAssets, setScannedAssets] = useState<any[]>([]);

  const [form, setForm] = useState({
    ngayKiemKe: '',
    namKiemKe: new Date().getFullYear(),
    ghiChu: '',
  });

  const [message, setMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = useCallback(
    (msg: string, type: 'success' | 'error' = 'success') => {
      setMessage(msg);
      setToastType(type);
    },
    [],
  );

  const loadData = useCallback(async () => {
    if (!canViewInventory) {
      showToast('Bạn không có quyền xem danh sách kiểm kê', 'error');
      return;
    }

    setLoading(true);

    try {
      const data = await inventoryApi.getAll();
      setInventories(unwrapData<Inventory[]>(data, []));
    } catch (error: any) {
      showToast(error.message || 'Không thể tải danh sách kiểm kê', 'error');
    } finally {
      setLoading(false);
    }
  }, [canViewInventory, showToast]);

  const loadDetail = useCallback(
    async (maKiemKe: string) => {
      if (!canViewInventory) {
        showToast('Bạn không có quyền xem chi tiết kiểm kê', 'error');
        return;
      }

      setLoading(true);

      try {
        const [
          inventoryRes,
          assetsRes,
          progressRes,
          missingRes,
          scannedRes,
        ] = await Promise.allSettled([
          inventoryApi.getOne(maKiemKe),
          inventoryApi.getAssets(maKiemKe),
          inventoryApi.getProgress(maKiemKe),
          inventoryApi.getMissingAssets(maKiemKe),
          inventoryApi.getScannedAssets(maKiemKe),
        ]);

        setSelectedInventory(
          inventoryRes.status === 'fulfilled'
            ? unwrapData<any>(inventoryRes.value, null)
            : null,
        );

        setAssets(
          assetsRes.status === 'fulfilled'
            ? unwrapData<any[]>(assetsRes.value, [])
            : [],
        );

        setProgress(
          progressRes.status === 'fulfilled'
            ? unwrapData<any>(progressRes.value, null)
            : null,
        );

        setMissingAssets(
          missingRes.status === 'fulfilled'
            ? unwrapData<any[]>(missingRes.value, [])
            : [],
        );

        setScannedAssets(
          scannedRes.status === 'fulfilled'
            ? unwrapData<any[]>(scannedRes.value, [])
            : [],
        );

        setShowDetail(true);
      } catch (error: any) {
        showToast(error.message || 'Không thể tải chi tiết kiểm kê', 'error');
      } finally {
        setLoading(false);
      }
    },
    [canViewInventory, showToast],
  );

  useEffect(() => {
    if (canViewInventory) {
      loadData();
    }
  }, [canViewInventory, loadData]);

  const filteredInventories = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return inventories.filter((item: any) => {
      const sameYear =
        Number(item.NamKiemKe || item.namKiemKe) === Number(year);

      const matchKeyword =
        !keyword ||
        String(item.MaKiemKe || item.maKiemKe || '')
          .toLowerCase()
          .includes(keyword) ||
        String(item.GhiChu || item.ghiChu || '')
          .toLowerCase()
          .includes(keyword) ||
        String(item.NguoiLap || item.nguoiLap || '')
          .toLowerCase()
          .includes(keyword);

      return sameYear && matchKeyword;
    });
  }, [inventories, search, year]);

  const totalAssets = useMemo(() => {
    return filteredInventories.reduce((total: number, item: any) => {
      return total + Number(item.TongTaiSan || item.tongTaiSan || 0);
    }, 0);
  }, [filteredInventories]);

  const totalScanned = useMemo(() => {
    return filteredInventories.reduce((total: number, item: any) => {
      return total + Number(item.DaKiemKe || item.daKiemKe || 0);
    }, 0);
  }, [filteredInventories]);

  async function handleCreateInventory() {
    if (!canCreateInventory) {
      showToast('Bạn không có quyền tạo đợt kiểm kê', 'error');
      return;
    }

    if (!user) {
      showToast('Không tìm thấy thông tin người dùng', 'error');
      return;
    }

    if (!form.ngayKiemKe) {
      showToast('Vui lòng chọn ngày kiểm kê', 'error');
      return;
    }

    if (!form.namKiemKe) {
      showToast('Vui lòng nhập năm kiểm kê', 'error');
      return;
    }

    setSubmitting(true);

    try {
      await inventoryApi.create({
        ngayKiemKe: form.ngayKiemKe,
        namKiemKe: Number(form.namKiemKe),
        nguoiLap: user.maNhanVien,
        ghiChu: form.ghiChu,
      });

      setShowCreate(false);

      setForm({
        ngayKiemKe: '',
        namKiemKe: new Date().getFullYear(),
        ghiChu: '',
      });

      await loadData();

      showToast('Tạo đợt kiểm kê thành công!');
    } catch (error: any) {
      showToast(error.message || 'Tạo đợt kiểm kê thất bại', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteInventory(maKiemKe: string) {
    if (!canDeleteInventory) {
      showToast('Bạn không có quyền xóa đợt kiểm kê', 'error');
      return;
    }

    const ok = window.confirm(
      `Bạn có chắc muốn xóa đợt kiểm kê ${maKiemKe} không?`,
    );

    if (!ok) return;

    try {
      await inventoryApi.remove(maKiemKe);
      await loadData();
      showToast('Xóa đợt kiểm kê thành công!');
    } catch (error: any) {
      showToast(error.message || 'Xóa đợt kiểm kê thất bại', 'error');
    }
  }

  function goToScanner(maKiemKe: string) {
    if (!canScanInventory) {
      showToast('Bạn không có quyền quét kiểm kê', 'error');
      return;
    }

    navigate(`/inventory/${maKiemKe}/scanner`);
  }

  const detailPercent = progress
    ? getPercent(progress)
    : getPercent(selectedInventory);

  if (!user) {
    return null;
  }

  if (!canViewInventory) {
    return (
      <div className="assets-layout">
        <section className="panel">
          <div className="panel-header">
            <h2>Không có quyền truy cập</h2>
          </div>

          <p>Bạn không có quyền xem chức năng kiểm kê tài sản.</p>
        </section>

        <Toast
          message={message}
          onClose={() => setMessage('')}
          type={toastType as any}
        />
      </div>
    );
  }

  return (
    <div className="assets-layout">
      <div className="asset-summary">
        <div className="kpi-tile green">
          <div className="kpi-icon">
            <ClipboardCheck />
          </div>

          <span>Tổng đợt kiểm kê</span>
          <strong>{filteredInventories.length}</strong>
        </div>

        <div className="kpi-tile amber">
          <div className="kpi-icon">
            <Calendar />
          </div>

          <span>Năm kiểm kê</span>
          <strong>{year}</strong>
        </div>

        <div className="kpi-tile red">
          <div className="kpi-icon">
            <QrCode />
          </div>

          <span>Tổng tài sản</span>
          <strong>{totalAssets}</strong>
        </div>

        <div className="kpi-tile green">
          <div className="kpi-icon">
            <ClipboardCheck />
          </div>

          <span>Đã kiểm kê</span>
          <strong>{totalScanned}</strong>
        </div>
      </div>

      <section className="panel asset-toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            value={search}
            placeholder="Tìm kiếm mã, ghi chú, người lập..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          <option value={2026}>2026</option>
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
          <option value={2023}>2023</option>
        </select>

        <button
          className="secondary-button"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCcw size={18} />
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>

        {canCreateInventory && (
          <button
            className="primary-button"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={18} />
            Tạo đợt kiểm kê
          </button>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Danh sách đợt kiểm kê</h2>
          <span>{filteredInventories.length} bản ghi</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Ngày kiểm kê</th>
                <th>Năm</th>
                <th>Người lập</th>
                <th>Tổng TS</th>
                <th>Đã kiểm kê</th>
                <th>Tiến độ</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filteredInventories.map((item: any) => {
                const maKiemKe = String(
                  item.MaKiemKe || item.maKiemKe || '',
                );

                const tong = Number(
                  item.TongTaiSan || item.tongTaiSan || 0,
                );

                const daKiemKe = Number(
                  item.DaKiemKe || item.daKiemKe || 0,
                );

                const percent = getPercent(item);

                return (
                  <tr key={maKiemKe}>
                    <td>
                      <strong>{maKiemKe}</strong>
                    </td>

                    <td>{formatDate(item.NgayKiemKe || item.ngayKiemKe)}</td>

                    <td>{item.NamKiemKe || item.namKiemKe}</td>

                    <td>{item.NguoiLap || item.nguoiLap || '-'}</td>

                    <td>{tong}</td>

                    <td>{daKiemKe}</td>

                    <td>{percent}%</td>

                    <td>
                      <span
                        className={`status-pill ${percent === 100 ? 'success' : 'queued'
                          }`}
                      >
                        {percent === 100 ? 'Hoàn thành' : 'Đang kiểm kê'}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          title="Chi tiết"
                          onClick={() => loadDetail(maKiemKe)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="icon-button"
                          title="Xem báo cáo"
                          onClick={() => navigate(`/inventory/${maKiemKe}/report`)}
                          type="button"
                        >
                          <FileText size={16} />
                        </button>

                        {canScanInventory && (
                          <button
                            className="icon-button"
                            title="Quét kiểm kê"
                            onClick={() => goToScanner(maKiemKe)}
                          >
                            <QrCode size={16} />
                          </button>
                        )}

                        {canDeleteInventory && (
                          <button
                            className="icon-button danger"
                            title="Xóa"
                            onClick={() => handleDeleteInventory(maKiemKe)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!filteredInventories.length && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 30 }}>
                    {loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showCreate && canCreateInventory && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="panel-header">
              <h2>Tạo đợt kiểm kê</h2>

              <button
                className="icon-button"
                onClick={() => setShowCreate(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid">
              <label>
                Ngày kiểm kê
                <input
                  type="date"
                  value={form.ngayKiemKe}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ngayKiemKe: e.target.value,
                      namKiemKe: e.target.value
                        ? new Date(e.target.value).getFullYear()
                        : form.namKiemKe,
                    })
                  }
                />
              </label>

              <label>
                Năm kiểm kê
                <input
                  type="number"
                  value={form.namKiemKe}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      namKiemKe: Number(e.target.value),
                    })
                  }
                />
              </label>

              <label style={{ gridColumn: '1 / -1' }}>
                Người lập
                <input value={user.maNhanVien} readOnly />
              </label>

              <label style={{ gridColumn: '1 / -1' }}>
                Ghi chú
                <input
                  value={form.ghiChu}
                  placeholder="Ví dụ: Kiểm kê tài sản cuối năm..."
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
                onClick={() => setShowCreate(false)}
                disabled={submitting}
              >
                Hủy
              </button>

              <button
                className="primary-button"
                onClick={handleCreateInventory}
                disabled={submitting}
              >
                {submitting ? 'Đang tạo...' : 'Tạo đợt kiểm kê'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedInventory && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 1100 }}>
            <div className="panel-header">
              <div>
                <h2>
                  Chi tiết kiểm kê{' '}
                  {selectedInventory.MaKiemKe || selectedInventory.maKiemKe}
                </h2>

                <span>Tiến độ hiện tại: {detailPercent}%</span>
              </div>

              <button
                className="icon-button"
                onClick={() => setShowDetail(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="asset-summary" style={{ marginBottom: 16 }}>
              <div className="kpi-tile green">
                <span>Tổng tài sản</span>
                <strong>{assets.length}</strong>
              </div>

              <div className="kpi-tile green">
                <span>Đã kiểm kê</span>
                <strong>{scannedAssets.length}</strong>
              </div>

              <div className="kpi-tile red">
                <span>Tài sản thiếu</span>
                <strong>{missingAssets.length}</strong>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã tài sản</th>
                    <th>Tên tài sản</th>
                    <th>Vị trí</th>
                    <th>Tình trạng</th>
                  </tr>
                </thead>

                <tbody>
                  {assets.map((asset: any, index: number) => (
                    <tr key={asset.MaTaiSan || asset.maTaiSan || index}>
                      <td>
                        <strong>{asset.MaTaiSan || asset.maTaiSan}</strong>
                      </td>

                      <td>{asset.TenTaiSan || asset.tenTaiSan || '-'}</td>

                      <td>{asset.ViTri || asset.viTri || '-'}</td>

                      <td>{asset.TinhTrang || asset.tinhTrang || '-'}</td>
                    </tr>
                  ))}

                  {!assets.length && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{ textAlign: 'center', padding: 30 }}
                      >
                        Không có tài sản trong đợt kiểm kê này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {canScanInventory && (
              <div className="modal-actions">
                <button
                  className="primary-button"
                  onClick={() =>
                    goToScanner(
                      selectedInventory.MaKiemKe ||
                      selectedInventory.maKiemKe,
                    )
                  }
                >
                  <QrCode size={18} />
                  Đi đến trang quét
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Toast
        message={message}
        onClose={() => setMessage('')}
        type={toastType as any}
      />
    </div>
  );
}