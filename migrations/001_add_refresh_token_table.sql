-- Migration: Refresh Token support
-- Run once against your quan_ly_tai_san database

CREATE TABLE IF NOT EXISTS REFRESH_TOKEN (
  Id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  MaNhanVien  VARCHAR(50)     NOT NULL,
  TokenHash   VARCHAR(64)     NOT NULL COMMENT 'SHA-256 hex of the signed JWT',
  ExpiresAt   DATETIME        NOT NULL,
  CreatedAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  RevokedAt   DATETIME        NULL     DEFAULT NULL,

  PRIMARY KEY (Id),
  UNIQUE  KEY uq_token_hash    (TokenHash),
  INDEX       idx_maNhanVien   (MaNhanVien),
  INDEX       idx_expires_at   (ExpiresAt),

  CONSTRAINT fk_rt_nhan_vien
    FOREIGN KEY (MaNhanVien)
    REFERENCES NHAN_VIEN (MaNhanVien)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
