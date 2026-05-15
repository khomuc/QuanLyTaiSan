import { Injectable, Inject } from '@nestjs/common';
import { Connection } from 'mysql2/promise'; // Import kiểu dữ liệu để code gợi ý tốt hơn

@Injectable()
export class AppService {
  constructor(
    // Gọi kết nối MySQL mà chúng ta đã khởi tạo ở DatabaseModule
    @Inject('MYSQL_CONNECTION') 
    private readonly dbConnection: Connection,
  ) {}

  // Ví dụ lấy danh sách tài sản bằng Raw SQL
  async getDanhSachTaiSan() {
    // Viết câu lệnh SQL trực tiếp
    const [rows, fields] = await this.dbConnection.query('SELECT * FROM tai_san');
    
    return rows; // Trả về kết quả
  }

  // Ví dụ thêm tài sản mới
  async themTaiSan(maQr: string, tenTaiSan: string) {
    const query = 'INSERT INTO tai_san (maQr, tenTaiSan) VALUES (?, ?)';
    const [result] = await this.dbConnection.execute(query, [maQr, tenTaiSan]);
    
    return result;
  }
}