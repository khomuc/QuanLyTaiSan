import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    Box,
    Building2,
    Calendar,
    CircleDollarSign,
    ClipboardList,
    Hash,
    Info,
    Loader2,
    QrCode,
    RefreshCw,
    ShieldCheck,
    Tag,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { assetsApi } from '../lib/apis/assetsApi';
import { Toast } from '../components/Toast';

function unwrapData<T>(data: any, fallback: T): T {
    if (!data) return fallback;
    if (data.data !== undefined) return data.data as T;
    if (data.result !== undefined) return data.result as T;
    return data as T;
}

function getValue(data: any, keys: string[], fallback = '-') {
    for (const key of keys) {
        if (
            data?.[key] !== undefined &&
            data?.[key] !== null &&
            data?.[key] !== ''
        ) {
            return data[key];
        }
    }

    return fallback;
}

function formatCurrency(value: any) {
    const numberValue = Number(value || 0);

    if (!numberValue) return '-';

    return `${numberValue.toLocaleString('vi-VN')} đ`;
}

function formatPercent(value: any) {
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

function formatDate(value: any) {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString('vi-VN');
}

export default function AssetDetailPage() {
    const navigate = useNavigate();
    const { maTaiSan } = useParams();

    const [asset, setAsset] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const showToast = (
        msg: string,
        type: 'success' | 'error' = 'success',
    ) => {
        setMessage(msg);
        setToastType(type);
    };

    const loadAsset = async () => {
        if (!maTaiSan) {
            showToast('Thiếu mã tài sản trên đường dẫn', 'error');
            return;
        }

        setLoading(true);

        try {
            const res = await assetsApi.findOne(maTaiSan);
            setAsset(unwrapData<any>(res, null));
        } catch (error: any) {
            setAsset(null);
            showToast(error.message || 'Không thể tải thông tin tài sản', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAsset();
    }, [maTaiSan]);

    const detail = useMemo(() => {
        if (!asset) return null;

        return {
            maTaiSan: getValue(asset, ['MaTaiSan', 'maTaiSan']),
            maQr: getValue(asset, ['MaQR', 'maQR']),
            tenTaiSan: getValue(asset, ['TenTaiSan', 'tenTaiSan']),
            loaiTaiSan: getValue(asset, ['TenLoai', 'tenLoai', 'LoaiTaiSan']),
            soHieuTSCD: getValue(asset, ['SoHieuTSCD', 'soHieuTSCD']),
            nguyenGia: formatCurrency(
                getValue(asset, ['NguyenGia', 'nguyenGia'], '0'),
            ),
            haoMonLuyKe: formatPercent(
                getValue(asset, ['HaoMonLuyKe', 'haoMonLuyKe'], ''),
            ),
            giaTriConLai: formatCurrency(
                getValue(asset, ['GiaTriConLai', 'giaTriConLai'], '0'),
            ),
            trangThai: getValue(asset, ['TrangThai', 'trangThai']),
            phongBan: getValue(asset, [
                'TenPhongBan',
                'tenPhongBan',
                'PhongBan',
                'phongBan',
            ]),
            maPhongBan: getValue(asset, [
                'MaPhongBanHienTai',
                'maPhongBanHienTai',
                'MaPhongBan',
                'maPhongBan',
            ]),
            ngayMua: formatDate(getValue(asset, ['NgayMua', 'ngayMua'], '')),
            ngayDuaVaoSuDung: formatDate(
                getValue(asset, ['NgayDuaVaoSuDung', 'ngayDuaVaoSuDung'], ''),
            ),
            moTa: getValue(asset, ['MoTa', 'moTa', 'GhiChu', 'ghiChu']),
        };
    }, [asset]);

    return (
        <div className="assets-layout">
            <section className="panel asset-detail-header">
                <div className="asset-detail-header__left">
                    <button
                        className="secondary-button"
                        onClick={() => navigate(-1)}
                        type="button"
                    >
                        <ArrowLeft size={18} />
                        Quay lại
                    </button>

                    <div>
                        <p className="eyebrow">Thông tin tài sản</p>
                        <h1>{detail?.tenTaiSan || 'Chi tiết tài sản'}</h1>
                    </div>
                </div>

                <button
                    className="secondary-button"
                    onClick={loadAsset}
                    disabled={loading}
                    type="button"
                >
                    {loading ? <Loader2 size={18} /> : <RefreshCw size={18} />}
                    {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </section>

            {loading && !asset && (
                <section className="panel asset-detail-empty">
                    <Loader2 size={28} className="asset-detail-spin" />
                    <p>Đang tải thông tin tài sản...</p>
                </section>
            )}

            {!loading && !asset && (
                <section className="panel asset-detail-empty">
                    <AlertContent />
                </section>
            )}

            {detail && (
                <>
                    <div className="asset-summary">
                        <div className="kpi-tile green">
                            <div className="kpi-icon">
                                <Box size={20} />
                            </div>
                            <span>Mã tài sản</span>
                            <strong className="asset-detail-kpi-text">
                                {detail.maTaiSan}
                            </strong>
                        </div>

                        <div className="kpi-tile amber">
                            <div className="kpi-icon">
                                <Building2 size={20} />
                            </div>
                            <span>Phòng ban hiện tại</span>
                            <strong className="asset-detail-kpi-text">
                                {detail.phongBan}
                            </strong>
                        </div>

                        <div className="kpi-tile red">
                            <div className="kpi-icon">
                                <ShieldCheck size={20} />
                            </div>
                            <span>Trạng thái</span>
                            <strong className="asset-detail-kpi-text">
                                {detail.trangThai}
                            </strong>
                        </div>
                    </div>

                    <div className="two-column">
                        <section className="panel">
                            <div className="panel-header">
                                <h2>Thông tin chung</h2>
                                <span className="status-pill active">
                                    {detail.trangThai}
                                </span>
                            </div>

                            <div className="status-grid">
                                <InfoRow
                                    icon={<Hash size={18} />}
                                    label="Mã tài sản"
                                    value={detail.maTaiSan}
                                />

                                <InfoRow
                                    icon={<QrCode size={18} />}
                                    label="Mã QR / URL"
                                    value={detail.maQr}
                                />

                                <InfoRow
                                    icon={<ClipboardList size={18} />}
                                    label="Tên tài sản"
                                    value={detail.tenTaiSan}
                                />

                                <InfoRow
                                    icon={<Tag size={18} />}
                                    label="Loại tài sản"
                                    value={detail.loaiTaiSan}
                                />

                                <InfoRow
                                    icon={<Hash size={18} />}
                                    label="Số hiệu TSCĐ"
                                    value={detail.soHieuTSCD}
                                />

                                <InfoRow
                                    icon={<Building2 size={18} />}
                                    label="Phòng ban hiện tại"
                                    value={detail.phongBan}
                                />

                                <InfoRow
                                    icon={<Hash size={18} />}
                                    label="Mã phòng ban"
                                    value={detail.maPhongBan}
                                />
                            </div>
                        </section>

                        <section className="panel">
                            <div className="panel-header">
                                <h2>Giá trị & hao mòn</h2>
                            </div>

                            <div className="status-grid">
                                <InfoRow
                                    icon={<CircleDollarSign size={18} />}
                                    label="Nguyên giá"
                                    value={detail.nguyenGia}
                                />

                                <InfoRow
                                    icon={<CircleDollarSign size={18} />}
                                    label="Giá trị còn lại"
                                    value={detail.giaTriConLai}
                                />

                                <InfoRow
                                    icon={<Info size={18} />}
                                    label="Hao mòn lũy kế"
                                    value={detail.haoMonLuyKe}
                                />

                                <InfoRow
                                    icon={<Calendar size={18} />}
                                    label="Ngày mua"
                                    value={detail.ngayMua}
                                />

                                <InfoRow
                                    icon={<Calendar size={18} />}
                                    label="Ngày đưa vào sử dụng"
                                    value={detail.ngayDuaVaoSuDung}
                                />
                            </div>
                        </section>
                    </div>

                    <section className="panel">
                        <div className="panel-header">
                            <h2>Mô tả / ghi chú</h2>
                        </div>

                        <div className="asset-detail-note">
                            {detail.moTa && detail.moTa !== '-' ? detail.moTa : 'Chưa có mô tả'}
                        </div>
                    </section>
                </>
            )}

            <Toast
                message={message}
                onClose={() => setMessage('')}
                type={toastType}
            />
        </div>
    );
}

function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: any;
}) {
    return (
        <div className="status-row asset-detail-row">
            <div className="asset-detail-row__label">
                {icon}
                <span>{label}</span>
            </div>

            <strong>{value || '-'}</strong>
        </div>
    );
}

function AlertContent() {
    return (
        <>
            <Info size={32} />
            <h2>Không tìm thấy tài sản</h2>
            <p>
                Tài sản không tồn tại hoặc tài khoản hiện tại không có quyền xem thông
                tin tài sản.
            </p>
        </>
    );
}
