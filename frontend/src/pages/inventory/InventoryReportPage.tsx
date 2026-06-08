import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    RefreshCw,
    Download,
    Printer,
    ClipboardCheck,
    AlertTriangle,
    MapPinOff,
    Search,
    FileText,
    CheckCircle,
    PackageSearch,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { inventoryApi } from '../../lib/apis/inventoryApi';
import { Toast } from '../../components/Toast';

type ReportTab = 'all' | 'scanned' | 'missing' | 'wrongLocation';

function unwrapData<T>(data: any, fallback: T): T {
    if (!data) return fallback;
    if (data.data !== undefined) return data.data as T;
    if (data.result !== undefined) return data.result as T;
    return data as T;
}

function getValue(item: any, keys: string[], fallback = '-') {
    for (const key of keys) {
        if (
            item?.[key] !== undefined &&
            item?.[key] !== null &&
            item?.[key] !== ''
        ) {
            return item[key];
        }
    }

    return fallback;
}

function formatDateTime(value: any) {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString('vi-VN', {
        hour12: false,
    });
}

function formatDate(value: any) {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString('vi-VN');
}

function formatCurrency(value: any) {
    const numberValue = Number(value || 0);

    if (!numberValue) return '-';

    return `${numberValue.toLocaleString('vi-VN')} đ`;
}

function formatHaoMon(value: any) {
    if (value === undefined || value === null || value === '') {
        return '-';
    }

    const text = String(value).trim();

    if (!text) return '-';

    if (text.includes('%')) {
        return text;
    }

    return `${text}%`;
}

function normalizeText(value: any) {
    return String(value || '')
        .trim()
        .toLowerCase();
}

function isScanned(asset: any) {
    return (
        Number(asset.DaQuet || asset.daQuet) === 1 ||
        Boolean(asset.ThoiGianQuet || asset.thoiGianQuet)
    );
}

function isWrongLocation(asset: any) {
    const systemLocation = normalizeText(
        getValue(
            asset,
            ['TenPhongBan', 'tenPhongBan', 'ViTriHeThong', 'viTriHeThong'],
            '',
        ),
    );

    const actualLocation = normalizeText(
        getValue(asset, ['ViTriHienTai', 'viTriHienTai'], ''),
    );

    if (!actualLocation) return false;

    return systemLocation !== actualLocation;
}

function getAssetCode(asset: any) {
    return getValue(asset, ['MaTaiSan', 'maTaiSan'], '-');
}

function getAssetName(asset: any) {
    return getValue(asset, ['TenTaiSan', 'tenTaiSan'], '-');
}

export default function InventoryReportPage() {
    const navigate = useNavigate();
    const { maKiemKe } = useParams();

    const [report, setReport] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [completing, setCompleting] = useState(false);

    const [activeTab, setActiveTab] = useState<ReportTab>('all');
    const [keyword, setKeyword] = useState('');

    const [message, setMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const showToast = (
        msg: string,
        type: 'success' | 'error' = 'success',
    ) => {
        setMessage(msg);
        setToastType(type);
    };

    const loadReport = async () => {
        if (!maKiemKe) {
            showToast('Thiếu mã kiểm kê', 'error');
            return;
        }

        setLoading(true);

        try {
            const res = await inventoryApi.getReport(maKiemKe);
            setReport(unwrapData<any>(res, null));
        } catch (error: any) {
            setReport(null);
            showToast(error.message || 'Không thể tải báo cáo kiểm kê', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, [maKiemKe]);

    const inventory = report?.inventory || {};
    const summary = report?.summary || {};

    const allAssets = useMemo(() => {
        return report?.assets?.all || [];
    }, [report]);

    const scannedAssets = useMemo(() => {
        return report?.assets?.scanned || allAssets.filter(isScanned);
    }, [report, allAssets]);

    const missingAssets = useMemo(() => {
        return report?.assets?.missing || allAssets.filter((item: any) => !isScanned(item));
    }, [report, allAssets]);

    const wrongLocationAssets = useMemo(() => {
        return report?.assets?.wrongLocation || allAssets.filter(isWrongLocation);
    }, [report, allAssets]);

    const currentAssets = useMemo(() => {
        if (activeTab === 'scanned') return scannedAssets;
        if (activeTab === 'missing') return missingAssets;
        if (activeTab === 'wrongLocation') return wrongLocationAssets;
        return allAssets;
    }, [
        activeTab,
        allAssets,
        scannedAssets,
        missingAssets,
        wrongLocationAssets,
    ]);

    const filteredAssets = useMemo(() => {
        const search = keyword.toLowerCase().trim();

        if (!search) return currentAssets;

        return currentAssets.filter((asset: any) => {
            const values = [
                getAssetCode(asset),
                getAssetName(asset),
                getValue(asset, ['TenLoai', 'tenLoai'], ''),
                getValue(asset, ['TenPhongBan', 'tenPhongBan', 'ViTriHeThong'], ''),
                getValue(asset, ['ViTriHienTai', 'viTriHienTai'], ''),
                getValue(asset, ['TinhTrangThucTe', 'tinhTrangThucTe'], ''),
                getValue(asset, ['GhiChu', 'ghiChu'], ''),
            ];

            return values.some((value) =>
                String(value).toLowerCase().includes(search),
            );
        });
    }, [currentAssets, keyword]);

    const totalAssets = Number(
        summary.tongTaiSan ?? summary.totalAssets ?? allAssets.length ?? 0,
    );

    const checkedAssets = Number(
        summary.daKiemKe ?? summary.checkedAssets ?? scannedAssets.length ?? 0,
    );

    const missingCount = Number(
        summary.chuaKiemKe ?? missingAssets.length ?? 0,
    );

    const wrongLocationCount = Number(
        summary.saiViTri ?? wrongLocationAssets.length ?? 0,
    );

    const progressPercent =
        totalAssets === 0 ? 0 : Math.round((checkedAssets / totalAssets) * 100);

    const canComplete = totalAssets > 0 && checkedAssets >= totalAssets;

    const handleCompleteInventory = async () => {
        if (!maKiemKe) {
            showToast('Thiếu mã kiểm kê', 'error');
            return;
        }

        if (!canComplete) {
            showToast('Chưa thể hoàn thành vì còn tài sản chưa kiểm kê', 'error');
            return;
        }

        const ok = window.confirm(
            'Bạn có chắc muốn hoàn thành đợt kiểm kê này không?',
        );

        if (!ok) return;

        setCompleting(true);

        try {
            await inventoryApi.completeInventory(maKiemKe);
            showToast('Hoàn thành kiểm kê thành công!');
            await loadReport();
        } catch (error: any) {
            showToast(error.message || 'Hoàn thành kiểm kê thất bại', 'error');
        } finally {
            setCompleting(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCsv = () => {
        const headers = [
            'MaTaiSan',
            'TenTaiSan',
            'TenLoai',
            'NguyenGia',
            'HaoMonLuyKe',
            'TinhTrangThucTe',
            'ViTriHeThong',
            'ViTriHienTai',
            'ThoiGianQuet',
            'TrangThaiKiemKe',
            'GhiChu',
        ];

        const rows = allAssets.map((asset: any) => {
            const daQuet = isScanned(asset);

            const data = {
                MaTaiSan: getAssetCode(asset),
                TenTaiSan: getAssetName(asset),
                TenLoai: getValue(asset, ['TenLoai', 'tenLoai'], ''),
                NguyenGia: getValue(asset, ['NguyenGia', 'nguyenGia'], ''),
                HaoMonLuyKe: getValue(asset, ['HaoMonLuyKe', 'haoMonLuyKe'], ''),
                TinhTrangThucTe: getValue(
                    asset,
                    ['TinhTrangThucTe', 'tinhTrangThucTe'],
                    '',
                ),
                ViTriHeThong: getValue(
                    asset,
                    ['TenPhongBan', 'tenPhongBan', 'ViTriHeThong', 'viTriHeThong'],
                    '',
                ),
                ViTriHienTai: getValue(
                    asset,
                    ['ViTriHienTai', 'viTriHienTai'],
                    '',
                ),
                ThoiGianQuet: getValue(
                    asset,
                    ['ThoiGianQuet', 'thoiGianQuet'],
                    '',
                ),
                TrangThaiKiemKe: daQuet ? 'Đã kiểm kê' : 'Chưa kiểm kê',
                GhiChu: getValue(asset, ['GhiChu', 'ghiChu'], ''),
            };

            return headers
                .map((key) => {
                    const value = data[key as keyof typeof data] ?? '';
                    return `"${String(value).replace(/"/g, '""')}"`;
                })
                .join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');

        const blob = new Blob(['\ufeff' + csv], {
            type: 'text/csv;charset=utf-8;',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `bao-cao-kiem-ke-${maKiemKe}.csv`;
        link.click();

        URL.revokeObjectURL(url);

        showToast('Xuất báo cáo CSV thành công!');
    };

    return (
        <div className="assets-layout report-page">
            <section className="panel report-header">
                <div className="report-header__left">
                    <button
                        className="secondary-button"
                        onClick={() => navigate(-1)}
                        type="button"
                    >
                        <ArrowLeft size={18} />
                        Quay lại
                    </button>

                    <div>
                        <p className="eyebrow">Báo cáo kiểm kê</p>
                        <h1>Đợt kiểm kê {maKiemKe}</h1>
                    </div>
                </div>

                <div className="report-header__actions">
                    <button
                        className="secondary-button"
                        onClick={loadReport}
                        disabled={loading}
                        type="button"
                    >
                        <RefreshCw size={18} />
                        {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>

                    <button
                        className="secondary-button"
                        onClick={handlePrint}
                        type="button"
                    >
                        <Printer size={18} />
                        In báo cáo
                    </button>

                    <button
                        className="primary-button"
                        onClick={handleExportCsv}
                        disabled={!allAssets.length}
                        type="button"
                    >
                        <Download size={18} />
                        Xuất CSV
                    </button>
                </div>
            </section>

            <section className="panel report-info">
                <div className="report-info__item">
                    <span>Mã kiểm kê</span>
                    <strong>
                        {getValue(inventory, ['MaKiemKe', 'maKiemKe'], maKiemKe || '-')}
                    </strong>
                </div>

                <div className="report-info__item">
                    <span>Ngày kiểm kê</span>
                    <strong>
                        {formatDate(getValue(inventory, ['NgayKiemKe', 'ngayKiemKe'], ''))}
                    </strong>
                </div>

                <div className="report-info__item">
                    <span>Năm kiểm kê</span>
                    <strong>
                        {getValue(inventory, ['NamKiemKe', 'namKiemKe'], '-')}
                    </strong>
                </div>

                <div className="report-info__item">
                    <span>Trạng thái phiếu</span>
                    <strong>
                        {getValue(inventory, ['TrangThai', 'trangThai'], 'DRAFT')}
                    </strong>
                </div>

                <div className="report-info__item">
                    <span>Thời điểm xuất báo cáo</span>
                    <strong>{formatDateTime(report?.generatedAt || new Date())}</strong>
                </div>
            </section>

            <div className="asset-summary">
                <div className="kpi-tile green">
                    <div className="kpi-icon">
                        <PackageSearch size={20} />
                    </div>
                    <span>Tổng tài sản</span>
                    <strong>{totalAssets}</strong>
                </div>

                <div className="kpi-tile green">
                    <div className="kpi-icon">
                        <ClipboardCheck size={20} />
                    </div>
                    <span>Đã kiểm kê</span>
                    <strong>{checkedAssets}</strong>
                </div>

                <div className="kpi-tile amber">
                    <div className="kpi-icon">
                        <AlertTriangle size={20} />
                    </div>
                    <span>Chưa kiểm kê</span>
                    <strong>{missingCount}</strong>
                </div>

                <div className="kpi-tile red">
                    <div className="kpi-icon">
                        <MapPinOff size={20} />
                    </div>
                    <span>Sai vị trí</span>
                    <strong>{wrongLocationCount}</strong>
                </div>
            </div>

            <section className="panel report-progress-panel">
                <div className="panel-header">
                    <div>
                        <h2>Tiến độ kiểm kê</h2>
                        <p className="report-muted">
                            Dùng để kiểm tra nhanh đợt kiểm kê đã đủ điều kiện hoàn thành chưa.
                        </p>
                    </div>

                    <span className="status-pill active">{progressPercent}%</span>
                </div>

                <div className="report-progress">
                    <div
                        className="report-progress__bar"
                        style={{
                            width: `${progressPercent}%`,
                        }}
                    />
                </div>

                <div className="report-complete-row">
                    <span>
                        {canComplete
                            ? 'Đã kiểm kê đủ tài sản. Có thể hoàn thành phiếu.'
                            : `Còn ${Math.max(totalAssets - checkedAssets, 0)} tài sản chưa kiểm kê.`}
                    </span>

                    <button
                        className="primary-button"
                        onClick={handleCompleteInventory}
                        disabled={!canComplete || completing}
                        type="button"
                    >
                        <CheckCircle size={18} />
                        {completing ? 'Đang hoàn thành...' : 'Hoàn thành kiểm kê'}
                    </button>
                </div>
            </section>

            <section className="panel report-table-panel">
                <div className="panel-header">
                    <div>
                        <h2>Chi tiết tài sản kiểm kê</h2>
                        <p className="report-muted">
                            Kiểm tra trạng thái quét, hao mòn thực tế, vị trí hiện tại và các sai lệch.
                        </p>
                    </div>

                    <span>{filteredAssets.length} dòng</span>
                </div>

                <div className="report-tabs">
                    <button
                        className={`report-tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                        type="button"
                    >
                        Tất cả
                        <strong>{allAssets.length}</strong>
                    </button>

                    <button
                        className={`report-tab ${activeTab === 'scanned' ? 'active' : ''}`}
                        onClick={() => setActiveTab('scanned')}
                        type="button"
                    >
                        Đã kiểm kê
                        <strong>{scannedAssets.length}</strong>
                    </button>

                    <button
                        className={`report-tab ${activeTab === 'missing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('missing')}
                        type="button"
                    >
                        Chưa kiểm kê
                        <strong>{missingAssets.length}</strong>
                    </button>

                    <button
                        className={`report-tab ${activeTab === 'wrongLocation' ? 'active' : ''
                            }`}
                        onClick={() => setActiveTab('wrongLocation')}
                        type="button"
                    >
                        Sai vị trí
                        <strong>{wrongLocationAssets.length}</strong>
                    </button>
                </div>

                <div className="report-filter-row">
                    <div className="search-box">
                        <Search size={18} />

                        <input
                            value={keyword}
                            placeholder="Tìm mã, tên, loại, vị trí, ghi chú..."
                            onChange={(event) => setKeyword(event.target.value)}
                        />
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Mã tài sản</th>
                                <th>Tên tài sản</th>
                                <th>Loại</th>
                                <th>Nguyên giá</th>
                                <th>Hao mòn sổ sách</th>
                                <th>Hao mòn thực tế</th>
                                <th>Vị trí hệ thống</th>
                                <th>Vị trí hiện tại</th>
                                <th>Thời gian quét</th>
                                <th>Trạng thái</th>
                                <th>Cảnh báo</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAssets.map((asset: any) => {
                                const daQuet = isScanned(asset);
                                const wrongLocation = isWrongLocation(asset);

                                const systemLocation = getValue(
                                    asset,
                                    ['TenPhongBan', 'tenPhongBan', 'ViTriHeThong', 'viTriHeThong'],
                                    '-',
                                );

                                const actualLocation = getValue(
                                    asset,
                                    ['ViTriHienTai', 'viTriHienTai'],
                                    '-',
                                );

                                return (
                                    <tr
                                        key={getAssetCode(asset)}
                                        className={!daQuet ? 'report-row-warning' : ''}
                                    >
                                        <td>
                                            <strong>{getAssetCode(asset)}</strong>
                                        </td>

                                        <td>{getAssetName(asset)}</td>

                                        <td>
                                            {getValue(asset, ['TenLoai', 'tenLoai'], '-')}
                                        </td>

                                        <td>
                                            {formatCurrency(
                                                getValue(asset, ['NguyenGia', 'nguyenGia'], '0'),
                                            )}
                                        </td>

                                        <td>
                                            {formatHaoMon(
                                                getValue(asset, ['HaoMonLuyKe', 'haoMonLuyKe'], ''),
                                            )}
                                        </td>

                                        <td>
                                            {getValue(
                                                asset,
                                                ['TinhTrangThucTe', 'tinhTrangThucTe'],
                                                '-',
                                            )}
                                        </td>

                                        <td>{systemLocation}</td>

                                        <td
                                            className={
                                                wrongLocation ? 'report-cell-danger' : undefined
                                            }
                                        >
                                            {actualLocation}
                                        </td>

                                        <td>
                                            {formatDateTime(
                                                getValue(asset, ['ThoiGianQuet', 'thoiGianQuet'], ''),
                                            )}
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
                                            <ReportWarning
                                                scanned={daQuet}
                                                wrongLocation={wrongLocation}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}

                            {!filteredAssets.length && (
                                <tr>
                                    <td colSpan={11} className="table-empty">
                                        {loading
                                            ? 'Đang tải báo cáo...'
                                            : 'Không có dữ liệu phù hợp'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="panel report-note">
                <FileText size={18} />

                <span>
                    Trang báo cáo này dùng để đối chiếu nhanh: tài sản chưa kiểm kê, sai vị trí,
                    hao mòn thực tế và thời gian quét. Có thể in trực tiếp hoặc xuất CSV để nộp
                    kèm biên bản.
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

function ReportWarning({
    scanned,
    wrongLocation,
}: {
    scanned: boolean;
    wrongLocation: boolean;
}) {
    if (!scanned) {
        return <span className="status-pill queued">Chưa quét</span>;
    }

    if (wrongLocation) {
        return <span className="status-pill inactive">Sai vị trí</span>;
    }

    return <span className="status-pill success">Ổn</span>;
}
