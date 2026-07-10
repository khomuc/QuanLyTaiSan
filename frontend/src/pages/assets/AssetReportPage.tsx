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

export function AssetReportPage({
  report,
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
  report: AssetReport;
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
  return (
    <div className="assets-layout">
      <section className="asset-toolbar panel">
        <div className="search-box">
          <Search size={18} />
          <input
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Loc bao cao theo ma, QR, ten, serial"
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
          <option value="HONG">Thanh ly</option>
        </select>
        <button className="primary-button" onClick={onRefresh} type="button">
          <Filter size={18} />
          Ap dung
        </button>
      </section>

      <div className="report-summary">
        <ReportMetric label="Tong tai san" value={report.summary.totalAssets} />
        <ReportMetric label="Dang su dung" value={report.summary.activeAssets} />
        <ReportMetric label="Thanh ly" value={report.summary.liquidatedAssets} />
        <ReportMetric
          label="Tong nguyen gia"
          value={formatCurrencyShort(report.summary.totalOriginalValue)}
        />
        <ReportMetric
          label="Tong hao mon"
          value={formatCurrencyShort(report.summary.totalDepreciationValue)}
        />
        <ReportMetric
          label="Gia tri con lai"
          value={formatCurrencyShort(report.summary.totalRemainingValue)}
        />
      </div>

      <div className="report-grid">
        <ReportGroupPanel
          groups={report.byCategory}
          title="Thong ke theo loai tai san"
        />
        <ReportGroupPanel
          groups={report.byDepartment}
          title="Thong ke theo phong ban"
        />
        <ReportGroupPanel groups={report.byStatus} title="Thong ke theo trang thai" />
      </div>
    </div>
  );
}

export function ReportMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <section className="report-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

export function ReportGroupPanel({
  title,
  groups,
}: {
  title: string;
  groups: AssetReportGroup[];
}) {
  const maxTotal = Math.max(...groups.map((group) => group.total), 1);

  return (
    <section className="panel report-panel">
      <div className="panel-header">
        <h2>{title}</h2>
      </div>
      <div className="report-bars">
        {groups.map((group) => (
          <div className="report-bar-row" key={`${title}-${group.id}`}>
            <div className="report-bar-head">
              <strong>{group.name}</strong>
              <span>{group.total} tai san</span>
            </div>
            <div className="report-bar-track">
              <div
                className="report-bar-fill"
                style={{ width: `${Math.max(8, (group.total / maxTotal) * 100)}%` }}
              />
            </div>
            <div className="report-bar-values">
              <span>Nguyen gia: {formatCurrency(group.originalValue)}</span>
              <span>Con lai: {formatCurrency(group.remainingValue)}</span>
            </div>
          </div>
        ))}
      </div>
      {!groups.length && <EmptyState text="Khong co du lieu bao cao" />}
    </section>
  );
}

