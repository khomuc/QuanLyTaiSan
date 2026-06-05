import { useEffect, useState } from 'react';
import { BarChart3, Filter, PackageSearch, QrCode, RefreshCw, Search } from 'lucide-react';
import { EmptyState, KpiTile, StatusPill } from '../components/ui';
import { formatCurrency, formatCurrencyShort } from '../lib/format';
import { api } from '../lib/api';
import * as demo from '../lib/mockData';
import { useData } from '../contexts/DataContext';
import type { Asset, AssetCategory, Department } from '../lib/types';

export default function AssetsPage() {
  const { assets, assetCategories, departments, setAssets, setAssetCategories, setDepartments } = useData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const [assetList, categoryList, departmentList] = await Promise.all([
        api.assets({
          search,
          maLoai: category,
          maPhongBan: department,
          trangThai: status,
        }),
        api.assetCategories(),
        api.departments(),
      ]);
      setAssets(assetList.data);
      setAssetCategories(categoryList);
      setDepartments(departmentList);
    } catch {
      setAssets(demo.assets);
      setAssetCategories(demo.assetCategories);
      setDepartments(demo.departments);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = async () => {
    await loadAssets();
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.giaTriConLai, 0);

  return (
    <div className="assets-layout">
      {loading && <div className="loading-bar" />}
      <section className="asset-toolbar panel">
        <div className="search-box">
          <Search size={18} />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tim ma tai san, QR, ten, serial"
            value={search}
          />
        </div>
        <select
          aria-label="Loc loai tai san"
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          <option value="">Tat ca loai</option>
          {assetCategories.map((item) => (
            <option key={item.maLoai} value={item.maLoai}>
              {item.tenLoai}
            </option>
          ))}
        </select>
        <select
          aria-label="Loc phong ban"
          onChange={(event) => setDepartment(event.target.value)}
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
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="">Tat ca trang thai</option>
          <option value="HOAT_DONG">Hoat dong</option>
          <option value="BAO_TRI">Bao tri</option>
          <option value="HONG">Hong</option>
        </select>
        <button className="primary-button" onClick={handleApplyFilter} type="button">
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
          <button className="icon-button" onClick={handleApplyFilter} title="Tai lai">
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
