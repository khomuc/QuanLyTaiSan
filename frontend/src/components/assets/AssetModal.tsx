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

export function AssetModal({
  form,
  categories,
  departments,
  isEditing,
  onChange,
  onClose,
  onSubmit,
}: {
  form: AssetForm;
  categories: AssetCategory[];
  departments: Department[];
  isEditing: boolean;
  onChange: (form: AssetForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const suggestedQrCode = form.maTaiSan.trim()
    ? `QR-${form.maTaiSan.trim()}`
    : '';
  const nguyenGia = Number(form.nguyenGia || 0);
  const haoMonPercent = Math.min(100, Math.max(0, Number(form.haoMonLuyKe || 0)));
  const giaTriConLai = Math.max(
    0,
    nguyenGia - Math.round((nguyenGia * haoMonPercent) / 100),
  );

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={onSubmit}>
        <div className="panel-header">
          <h2>{isEditing ? 'Sua tai san' : 'Them tai san'}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            title="Dong"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="form-grid">
          <label>
            Ma tai san
            <input
              disabled={isEditing}
              onChange={(event) =>
                onChange({ ...form, maTaiSan: event.target.value })
              }
              required
              value={form.maTaiSan}
            />
          </label>
          <label>
            Ten tai san
            <input
              onChange={(event) =>
                onChange({ ...form, tenTaiSan: event.target.value })
              }
              required
              value={form.tenTaiSan}
            />
          </label>
          <label>
            Ma QR
            <input
              placeholder={suggestedQrCode || 'Tu dong tao theo ma tai san'}
              onChange={(event) => onChange({ ...form, maQR: event.target.value })}
              value={form.maQR}
            />
            <span className="field-hint">
              Bo trong de he thong tu tao: {suggestedQrCode || 'QR-MaTaiSan'}
            </span>
          </label>
          <label>
            So hieu TSCD
            <input
              onChange={(event) =>
                onChange({ ...form, soHieuTSCD: event.target.value })
              }
              value={form.soHieuTSCD}
            />
          </label>
          <label>
            Loai tai san
            <select
              onChange={(event) =>
                onChange({ ...form, maLoai: event.target.value })
              }
              required
              value={form.maLoai}
            >
              <option value="">Chon loai</option>
              {categories.map((item) => (
                <option key={item.maLoai} value={item.maLoai}>
                  {item.tenLoai}
                </option>
              ))}
            </select>
          </label>
          <label>
            Phong ban
            <select
              onChange={(event) =>
                onChange({ ...form, maPhongBanHienTai: event.target.value })
              }
              required
              value={form.maPhongBanHienTai}
            >
              <option value="">Chon phong ban</option>
              {departments.map((item) => (
                <option key={item.maPhongBan} value={item.maPhongBan}>
                  {item.tenPhongBan}
                </option>
              ))}
            </select>
          </label>
          <label>
            Serial
            <input
              onChange={(event) =>
                onChange({ ...form, serial: event.target.value })
              }
              value={form.serial}
            />
          </label>
          <label>
            Model
            <input
              onChange={(event) => onChange({ ...form, model: event.target.value })}
              value={form.model}
            />
          </label>
          <label>
            Nguyen gia
            <input
              min="0"
              onChange={(event) =>
                onChange({ ...form, nguyenGia: event.target.value })
              }
              required
              type="number"
              value={form.nguyenGia}
            />
          </label>
          <label>
            Hao mon luy ke (%)
            <input
              max="100"
              min="0"
              onChange={(event) =>
                onChange({ ...form, haoMonLuyKe: event.target.value })
              }
              step="0.01"
              type="number"
              value={form.haoMonLuyKe}
            />
          </label>
          <label>
            Gia tri con lai
            <input
              min="0"
              readOnly
              type="number"
              value={giaTriConLai}
            />
          </label>
          <label>
            Ngay nhap
            <input
              onChange={(event) =>
                onChange({ ...form, ngayNhap: event.target.value })
              }
              required
              type="date"
              value={form.ngayNhap}
            />
          </label>
          <label>
            Trang thai
            <select
              onChange={(event) =>
                onChange({
                  ...form,
                  trangThai: event.target.value as Asset['trangThai'],
                })
              }
              value={form.trangThai}
            >
              <option value="HOAT_DONG">Hoat dong</option>
              <option value="BAO_TRI">Bao tri</option>
              <option value="HONG">Hong</option>
              <option value="DANG_LUAN_CHUYEN">Dang luan chuyen</option>
              <option value="DANG_SU_DUNG">Dang su dung</option>
              <option value="THANH_LY">Thanh ly</option>
            </select>
          </label>
          <label className="span-2">
            Ghi chu
            <textarea
              onChange={(event) =>
                onChange({ ...form, ghiChu: event.target.value })
              }
              rows={3}
              value={form.ghiChu}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            Huy
          </button>
          <button className="primary-button" type="submit">
            <Save size={18} />
            Luu tai san
          </button>
        </div>
      </form>
    </div>
  );
}

