-- 003_upgrade_transfer_feature.sql

-- 1. Bổ sung trạng thái cho tài sản
-- Thử thêm cột TrangThai, nếu bảng đã có thì có thể bỏ qua lệnh này.
ALTER TABLE TAI_SAN ADD COLUMN TrangThai VARCHAR(50) NOT NULL DEFAULT 'DANG_SU_DUNG';

-- 2. Thay đổi giới hạn enum nếu TrangThaiDuyet đang là ENUM, nếu là VARCHAR thì không sao.
-- Ở đây giả định nó là ENUM
ALTER TABLE PHIEU_DIEU_CHUYEN MODIFY COLUMN TrangThaiDuyet ENUM('CHO_KY', 'DA_DUYET', 'HOAN_THANH', 'TU_CHOI') NOT NULL DEFAULT 'CHO_KY';

-- 4. Bổ sung các cột về nhận hàng
ALTER TABLE CHI_TIET_PHIEU_DIEU_CHUYEN ADD COLUMN TrangThaiNhan VARCHAR(20) NOT NULL DEFAULT 'CHO_NHAN';
ALTER TABLE CHI_TIET_PHIEU_DIEU_CHUYEN ADD COLUMN GhiChuNhan VARCHAR(500) NULL;
