import { RefreshCw, Search } from 'lucide-react';
import { formatDate } from '../lib/format';
import type { AuditLog } from '../lib/types';
import { StatusPill } from '../components/ui';

export default function AuditPage({
  logs,
  search,
  onSearch,
  onRefresh,
}: {
  logs: AuditLog[];
  search: string;
  onSearch: (value: string) => void;
  onRefresh: () => void;
}) {
  return (
    <section className="panel full">
      <div className="panel-header">
        <div className="search-box">
          <Search size={18} />
          <input
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Tim hanh dong, doi tuong, chi tiet"
            value={search}
          />
        </div>
        <button className="icon-button" onClick={onRefresh} title="Tai lai">
          <RefreshCw size={18} />
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Thoi gian</th>
              <th>Nguoi dung</th>
              <th>Hanh dong</th>
              <th>Doi tuong</th>
              <th>Trang thai</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.maLog}>
                <td>{formatDate(log.thoiGian)}</td>
                <td>{log.hoTen ?? log.maNhanVien ?? 'He thong'}</td>
                <td>{log.hanhDong}</td>
                <td>{log.doiTuongId ?? log.doiTuong}</td>
                <td>
                  <StatusPill value={log.trangThai ?? 'INFO'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
