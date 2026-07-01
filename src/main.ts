import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Security: Helmet (Security Headers) ─────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    })
  );

  // ─── CORS ────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ─── API Prefix ──────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ─── Global Validation ──────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ─── Global Rate Limiting (Throttler) ────────────────────────────────────
  // ThrottlerGuard được đăng ký global qua APP_GUARD trong AppModule
  // (không thể `new ThrottlerGuard()` trực tiếp vì cần Nest inject dependency)

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `✅ Server running on http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(`🔐 Security: Helmet + Throttler enabled`);
}
void bootstrap();
