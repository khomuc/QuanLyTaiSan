import {
  BarChart3,
  Bell,
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
import { FormEvent } from 'react';
import type { Asset, AssetCategory, AssetForm, AssetHistoryItem, Department, EmployeeForm, Role } from '../../lib/types';
import { EmptyState } from '../ui';
import { formatCurrency, formatDate, toDepreciationPercent } from '../../lib/format';

export function AssetDetailModal({
  asset,
  history,
  onClose,
  onEdit,
}: {
  asset: Asset;
  history: AssetHistoryItem[];
  onClose: () => void;
  onEdit: () => void;
}) {
  const qrValue = asset.maQR ?? asset.maTaiSan;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=18&data=${encodeURIComponent(qrValue)}`;

  return (
    <div className="modal-backdrop">
      <section className="modal asset-detail-modal">
        <div className="panel-header">
          <div>
            <h2>Chi tiet tai san</h2>
            <p className="muted-text">{asset.maTaiSan}</p>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            title="Dong"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            <DetailRow label="Ten tai san" value={asset.tenTaiSan} />
            <DetailRow label="Loai" value={asset.tenLoai ?? asset.maLoai} />
            <DetailRow
              label="Phong ban"
              value={asset.tenPhongBan ?? asset.maPhongBanHienTai}
            />
            <DetailRow label="Ma QR" value={asset.maQR ?? 'Chua gan QR'} />
            <DetailRow label="Serial" value={asset.serial ?? 'Chua cap nhat'} />
            <DetailRow label="Model" value={asset.model ?? 'Chua cap nhat'} />
            <DetailRow label="So hieu TSCD" value={asset.soHieuTSCD ?? 'Chua cap nhat'} />
            <DetailRow label="Ngay nhap" value={formatDate(asset.ngayNhap)} />
            <DetailRow label="Nguyen gia" value={formatCurrency(asset.nguyenGia)} />
            <DetailRow label="Hao mon" value={`${toDepreciationPercent(asset)}%`} />
            <DetailRow
              label="Gia tri con lai"
              value={formatCurrency(asset.giaTriConLai)}
            />
            <DetailRow label="Trang thai" value={asset.trangThai} />
            <DetailRow label="Ghi chu" value={asset.ghiChu ?? 'Khong co'} />
          </div>

          <aside className="qr-panel">
            <img alt={`QR ${asset.maTaiSan}`} src={qrUrl} />
            <strong>{qrValue}</strong>
            <span>In hoac mo ma nay tren thiet bi khac de quet.</span>
          </aside>
        </div>

        <section className="history-panel">
          <div className="panel-header compact">
            <h3>Lich su thay doi</h3>
          </div>
          <div className="compact-list">
            {history.map((item) => (
              <div className="compact-item" key={item.maLog}>
                <strong>{item.hanhDong}</strong>
                <span>
                  {formatDate(item.thoiGian)} - {item.hoTen ?? item.maNhanVien ?? 'He thong'}
                </span>
              </div>
            ))}
          </div>
          {!history.length && <EmptyState text="Chua co lich su thay doi" />}
        </section>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            Dong
          </button>
          <button className="primary-button" onClick={onEdit} type="button">
            <Edit3 size={18} />
            Sua tai san
          </button>
        </div>
      </section>
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

