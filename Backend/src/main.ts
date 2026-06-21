import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuthModule } from './api/auth/auth.module';
import { BerandaModule } from './api/beranda/beranda.module';
import { RiwayatModule } from './api/riwayat/riwayat.module';
import { StubModule } from './api/stub/stub.module';
import { InfoModule } from './api/info/info.module';
import { AkunModule } from './api/akun/akun.module';
import { ProdukModule } from './api/produk/produk.module';
import { TransaksiModule } from './api/transaksi/transaksi.module';
import { TransaksiPascabayarModule } from './api/transaksi_pascabayar/transaksi-pascabayar.module';
import { WebhookModule } from './api/webhook/webhook.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Daftar domain web yang diizinkan mengakses API ini
  const allowedOrigins = [
    'http://localhost:5173', // Web Frontend lokal (Vite)
    'http://localhost:3000', // Swagger lokal
    // Tambahkan domain production web Anda di sini nantinya:
    'https://outletpulsa.com', 
    // 'https://admin.outletpulsa.com'
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Jika 'origin' adalah undefined, berarti request datang dari aplikasi Mobile (Flutter), Postman, atau server-to-server.
      // Jika origin ada, pastikan ia terdaftar di allowedOrigins (Web Browser).
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Akses diblokir oleh kebijakan CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Mengizinkan pengiriman cookie/token kredensial
  });

  app.use(helmet());

  app.use(cookieParser());
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
      return new BadRequestException({ error: true, message: messages, data: {} });
    }
  }));
  
  app.useGlobalInterceptors(new TransformInterceptor());

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('OutletPulsa API')
    .setDescription('Dokumentasi API untuk aplikasi OutletPulsa')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config, {
    include: [
      AuthModule,
      BerandaModule,
      RiwayatModule,
      StubModule,
      InfoModule,
      AkunModule,
      ProdukModule,
      TransaksiModule,
      TransaksiPascabayarModule,
      WebhookModule,
    ],
  });
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
