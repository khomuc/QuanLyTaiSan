-- Migration: Per-employee permission override table
-- Run this ONCE against your database before deploying the backend changes.

CREATE TABLE IF NOT EXISTS NHAN_VIEN_QUYEN (
  MaNhanVien VARCHAR(50)  NOT NULL,
  MaQuyen    VARCHAR(100) NOT NULL,
  CreatedAt  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (MaNhanVien, MaQuyen),
  CONSTRAINT fk_nvq_nhanvien FOREIGN KEY (MaNhanVien) REFERENCES NHAN_VIEN(MaNhanVien)  ON DELETE CASCADE,
  CONSTRAINT fk_nvq_quyen    FOREIGN KEY (MaQuyen)    REFERENCES QUYEN(MaQuyen)          ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
