// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database.module'; // Import module kết nối

@Module({
  imports: [DatabaseModule], // Thêm vào đây
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
