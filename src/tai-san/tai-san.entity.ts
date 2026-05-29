import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tai_san')
export class TaiSan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  ten_tai_san: string;

  @Column({ type: 'text', nullable: true })
  mo_ta: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  gia_tri: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  so_seri: string;

  @Column({ type: 'varchar', length: 50 })
  trang_thai: string;

  @CreateDateColumn()
  ngay_tao: Date;

  @UpdateDateColumn()
  ngay_cap_nhat: Date;
}
