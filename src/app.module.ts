// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database.module'; // Import module kết nối
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [DatabaseModule, TransferModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
