import {
  BarChart3,
  Bell,
  Camera,
  Check,
  ClipboardCheck,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  KeyRound,
  PackageSearch,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import * as demo from '../../lib/mockData';
import type {
  ApprovalItem,
  Asset,
  AssetCategory,
  AssetForm,
  AssetHistoryItem,
  AssetReport,
  AssetReportGroup,
  AuditLog,
  AuthUser,
  DashboardOverview,
  Department,
  Employee,
  EmployeeForm,
  NotificationItem,
  Permission,
  Role,
  SystemSettings,
  ViewKey,
} from '../../lib/types';
import { EmptyState, StatusPill, Toggle } from '../../components/ui';
import { formatCurrency, formatCurrencyShort, formatDate, toDepreciationPercent } from '../../lib/format';
import { KpiTile } from '../DashboardPage';
import { QRScannerModal } from '../../components/QRScannerModal';

export function AssetsPage({
  assets,
  categories,
  departments,
  search,
  status,
  category,
  department,
  onSearch,
  onStatus,
  onCategory,
  onDepartment,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onFinalize,
  onDownloadTemplate,
  onExport,
  onImport,
  onRefresh,
  onScanAsset,
}: {
  assets: Asset[];
  categories: AssetCategory[];
  departments: Department[];
  search: string;
  status: string;
  category: string;
  department: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onCategory: (value: string) => void;
  onDepartment: (value: string) => void;
  onCreate: () => void;
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (maTaiSan: string) => void;
  onFinalize: (maTaiSan: string) => void;
  onDownloadTemplate: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onRefresh: () => void;
  onScanAsset: (decodedText: string) => Promise<boolean>;
}) {
  const [showScanner, setShowScanner] = useState(false);
  const activeAssets = assets.filter((asset) => asset.trangThai !== 'THANH_LY');
  const liquidatedAssets = assets.filter(
    (asset) => asset.trangThai === 'THANH_LY',
  );
  const visibleActiveAssets = activeAssets;
  const totalValue = activeAssets.reduce(
    (sum, asset) => sum + asset.giaTriConLai,
    0,
  );

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = '';
    }
  }

  function playScanBeep(isError = false) {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = isError ? 'square' : 'sine';
      oscillator.frequency.value = isError ? 300 : 800;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      oscillator.start();
      window.setTimeout(() => {
        oscillator.stop();
        void audioContext.close();
      }, isError ? 300 : 120);
    } catch {
      // Browser audio permission can block this; scanning still works.
    }
  }

  async function handleScanSuccess(decodedText: string) {
    const found = await onScanAsset(decodedText);
    playScanBeep(!found);
  }

  return (
    <div className="assets-layout">
      <section className="asset-toolbar panel">
        <div className="search-box">
          <Search size={18} />
          <input
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Tim ma tai san, QR, ten, serial"
            value={search}
          />
        </div>
        <select
          aria-label="Loc loai tai san"
          onChange={(event) => onCategory(event.target.value)}
          value={category}
        >
          <option value="">Tat ca loai</option>
          {categories.map((item) => (
            <option key={item.maLoai} value={item.maLoai}>
              {item.tenLoai}
            </option>
          ))}
        </select>
        <select
          aria-label="Loc phong ban"
          onChange={(event) => onDepartment(event.target.value)}
          value={department}
        >
          <option value="">Tat ca phong ban</option>
          {departments.map((item) => (
            <option key={item.maPhongBan} value={item.maPhongBan}>
              {item.tenPhongBan}
            </option>
          ))}
        </select>
        <select
          aria-label="Loc trang thai"
          onChange={(event) => onStatus(event.target.value)}
          value={status}
        >
          <option value="">Tat ca trang thai</option>
          <option value="HOAT_DONG">Hoat dong</option>
          <option value="BAO_TRI">Bao tri</option>
          <option value="HONG">Hong</option>
          <option value="DANG_LUAN_CHUYEN">Dang luan chuyen</option>
          <option value="DANG_SU_DUNG">Dang su dung</option>
          <option value="THANH_LY">Thanh ly</option>
        </select>
        <button className="primary-button" onClick={onRefresh} type="button">
          <Filter size={18} />
          Ap dung
        </button>
        <button className="primary-button" onClick={onCreate} type="button">
          <Plus size={18} />
          Them tai san
        </button>
        <button
          className="secondary-button"
          onClick={() => setShowScanner(true)}
          type="button"
        >
          <Camera size={18} />
          Quet QR
        </button>
        <button
          className="secondary-button"
          onClick={onDownloadTemplate}
          type="button"
        >
          Tai mau Excel
        </button>
        <label className="secondary-button file-button">
          Import Excel
          <input accept=".xlsx" onChange={handleImport} type="file" />
        </label>
        <button className="secondary-button" onClick={onExport} type="button">
          Export Excel
        </button>
      </section>

      <div className="asset-summary">
        <KpiTile
          icon={PackageSearch}
          label="Tai san dang xem"
          tone="green"
          value={activeAssets.length}
        />
        <KpiTile
          icon={QrCode}
          label="Co ma QR"
          tone="amber"
          value={activeAssets.filter((asset) => Boolean(asset.maQR)).length}
        />
        <section className="kpi-tile red">
          <div className="kpi-icon">
            <BarChart3 size={22} />
          </div>
          <span>Gia tri con lai</span>
          <strong>{formatCurrencyShort(totalValue)}</strong>
        </section>
      </div>

      <section className="panel full">
        <div className="panel-header">
          <h2>Danh muc tai san</h2>
          <div className="button-row">
            <button className="icon-button" onClick={onRefresh} title="Tai lai">
              <RefreshCw size={18} />
            </button>
            <button className="primary-button" onClick={onCreate} type="button">
              <Plus size={18} />
              Them
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ma / QR</th>
                <th>Ten tai san</th>
                <th>Loai</th>
                <th>Phong ban</th>
                <th>Nguyen gia</th>
                <th>Hao mon</th>
                <th>Gia tri con lai</th>
                <th>Trang thai</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {visibleActiveAssets.map((asset) => (
                <tr key={asset.maTaiSan}>
                  <td>
                    <strong>{asset.maTaiSan}</strong>
                    <span>{asset.maQR ?? asset.soHieuTSCD ?? 'Chua gan QR'}</span>
                  </td>
                  <td>
                    <strong>{asset.tenTaiSan}</strong>
                    <span>{[asset.model, asset.serial].filter(Boolean).join(' - ')}</span>
                  </td>
                  <td>{asset.tenLoai ?? asset.maLoai}</td>
                  <td>{asset.tenPhongBan ?? asset.maPhongBanHienTai}</td>
                  <td>{formatCurrency(asset.nguyenGia)}</td>
                  <td>{toDepreciationPercent(asset)}%</td>
                  <td>{formatCurrency(asset.giaTriConLai)}</td>
                  <td>
                    <StatusPill value={asset.trangThai} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        onClick={() => onView(asset)}
                        title="Xem chi tiet"
                        type="button"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => onEdit(asset)}
                        title="Sua tai san"
                        type="button"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        onClick={() => onDelete(asset.maTaiSan)}
                      title="Dua vao muc thanh ly"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visibleActiveAssets.length && (
          <EmptyState text="Khong tim thay tai san phu hop" />
        )}
      </section>

      <section className="panel full">
        <div className="panel-header">
          <h2>Tai san thanh ly</h2>
          <span className="mode-pill demo">{liquidatedAssets.length}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ma / QR</th>
                <th>Ten tai san</th>
                <th>Loai</th>
                <th>Phong ban</th>
                <th>Nguyen gia</th>
                <th>Hao mon</th>
                <th>Gia tri con lai</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {liquidatedAssets.map((asset) => (
                <tr key={asset.maTaiSan}>
                  <td>
                    <strong>{asset.maTaiSan}</strong>
                    <span>{asset.maQR ?? asset.soHieuTSCD ?? 'Chua gan QR'}</span>
                  </td>
                  <td>
                    <strong>{asset.tenTaiSan}</strong>
                    <span>{[asset.model, asset.serial].filter(Boolean).join(' - ')}</span>
                  </td>
                  <td>{asset.tenLoai ?? asset.maLoai}</td>
                  <td>{asset.tenPhongBan ?? asset.maPhongBanHienTai}</td>
                  <td>{formatCurrency(asset.nguyenGia)}</td>
                  <td>{toDepreciationPercent(asset)}%</td>
                  <td>{formatCurrency(asset.giaTriConLai)}</td>
                  <td>
                    <button
                      className="secondary-button danger-text"
                      onClick={() => onFinalize(asset.maTaiSan)}
                      type="button"
                    >
                      Da ban / Hoan tat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!liquidatedAssets.length && (
          <EmptyState text="Chua co tai san nao trong muc thanh ly" />
        )}
      </section>

      {showScanner && (
        <QRScannerModal
          onClose={() => setShowScanner(false)}
          onScanSuccess={(decodedText) => void handleScanSuccess(decodedText)}
        />
      )}
    </div>
  );
}

