import { BarChart3, Filter, PackageSearch, QrCode, RefreshCw, Search } from 'lucide-react';
import { EmptyState, KpiTile, StatusPill } from '../components/ui';
import { formatCurrency, formatCurrencyShort } from '../lib/format';
import type { Asset, AssetCategory, Department } from '../lib/types';

export default function AssetsPage({
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
  onRefresh,
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
  onRefresh: () => void;
}) {
  const totalValue = assets.reduce((sum, asset) => sum + asset.giaTriConLai, 0);

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
        </select>
        <button className="primary-button" onClick={onRefresh} type="button">
          <Filter size={18} />
          Ap dung
        </button>
      </section>

      <div className="asset-summary">
        <KpiTile
          icon={PackageSearch}
          label="Tai san dang xem"
          tone="green"
          value={assets.length}
        />
        <KpiTile
          icon={QrCode}
          label="Co ma QR"
          tone="amber"
          value={assets.filter((asset) => Boolean(asset.maQR)).length}
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
          <button className="icon-button" onClick={onRefresh} title="Tai lai">
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ma / QR</th>
                <th>Ten tai san</th>
                <th>Loai</th>
                <th>Phong ban</th>
                <th>Gia tri con lai</th>
                <th>Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.maTaiSan}>
                  <td>
                    <strong>{asset.maTaiSan}</strong>
                    <span>{asset.maQR ?? asset.soHieuTSCD ?? 'Chua gan QR'}</span>
                  </td>
                  <td>
                    <strong>{asset.tenTaiSan}</strong>
                    <span>
                      {[asset.model, asset.serial].filter(Boolean).join(' - ')}
                    </span>
                  </td>
                  <td>{asset.tenLoai ?? asset.maLoai}</td>
                  <td>{asset.tenPhongBan ?? asset.maPhongBanHienTai}</td>
                  <td>{formatCurrency(asset.giaTriConLai)}</td>
                  <td>
                    <StatusPill value={asset.trangThai} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!assets.length && <EmptyState text="Khong tim thay tai san phu hop" />}
      </section>
    </div>
  );
}
