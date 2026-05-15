import { Module, Global } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Global() // Đánh dấu Global để dùng kết nối này ở mọi nơi mà không cần import lại module
@Module({
  providers: [
    {
      provide: 'MYSQL_CONNECTION', // Tên định danh của kết nối
      useFactory: async () => {
        try {
          const connection = await mysql.createConnection({
            host: '34.44.235.59',
            user: 'root',
            password: 'Ct555_2026', // Điền password của bạn
            database: 'quan_ly_tai_san_qr',
            // Thêm 3 dòng này để Google Cloud cho phép kết nối
            ssl: {
              rejectUnauthorized: false,
            },
          });
          console.log('Đã kết nối MySQL thành công!');
          return connection;
        } catch (error) {
          console.error('Lỗi kết nối MySQL:', error);
          throw error;
        }
      },
    },
  ],
  exports: ['MYSQL_CONNECTION'], // Xuất ra để các file khác có thể sử dụng
})
export class DatabaseModule {}