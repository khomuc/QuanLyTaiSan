import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'quan-ly-tai-san-api',
      timestamp: new Date().toISOString(),
    };
  }
}
