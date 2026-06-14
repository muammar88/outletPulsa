import { Controller, Post, Param, Body, Headers, Req, Logger } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import type { Request } from 'express';

/**
 * Controller untuk menerima webhook dari provider luar.
 *
 * PENTING: Controller ini TIDAK menggunakan JwtAuthGuard karena
 * webhook dipanggil oleh server pihak ketiga (IAK, Tripay, Digiflazz),
 * bukan oleh user yang login. Validasi dilakukan secara internal
 * menggunakan secret key / signature di dalam service.
 *
 * Endpoint yang tersedia:
 * - POST /webhook/iak/:kode_verifikasi  → Callback dari IAK
 * - POST /webhook/tripay                → Callback dari Tripay
 * - POST /webhook/digiflazz             → Callback dari Digiflazz
 */
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Endpoint: POST /webhook/iak/:kode_verifikasi
   *
   * IAK mengirim kode verifikasi sebagai URL parameter.
   * Body berisi data transaksi dalam format JSON.
   *
   * Contoh URL yang dipanggil IAK:
   * POST https://api.outletpulsa.com/webhook/iak/583hb13Z183799...
   *
   * Contoh body:
   * {
   *   "data": {
   *     "ref_id": "TRX-20240101-001",
   *     "status": 1,
   *     "sn": "1234567890",
   *     "price": 10000
   *   }
   * }
   */
  @Post('iak/:kode_verifikasi')
  async callbackIak(
    @Param('kode_verifikasi') kodeVerifikasi: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
    this.logger.log(`[IAK] Webhook received from IP: ${ipAddress}`);
    return this.webhookService.handleIakCallback(kodeVerifikasi, body, ipAddress);
  }

  /**
   * Endpoint: POST /webhook/tripay
   *
   * Tripay mengirim secret di header 'x-callback-secret'.
   * Body berisi ARRAY dari data transaksi.
   *
   * Contoh header:
   * x-callback-secret: 583hb13Z183799...
   *
   * Contoh body:
   * [
   *   {
   *     "trxid": 12345,
   *     "code": "TSEL10",
   *     "status": 1,
   *     "token": "1234567890"
   *   }
   * ]
   */
  @Post('tripay')
  async callbackTripay(
    @Headers('x-callback-secret') callbackSecret: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
    this.logger.log(`[TRIPAY] Webhook received from IP: ${ipAddress}`);
    return this.webhookService.handleTripayCallback(callbackSecret || '', body, ipAddress);
  }

  /**
   * Endpoint: POST /webhook/digiflazz
   *
   * Digiflazz mengirim HMAC signature di header 'X-Hub-Signature'.
   * Format: sha1=<hex_hash>
   * Hash dihitung dari raw body menggunakan HMAC-SHA1 dengan secret key.
   *
   * Contoh header:
   * X-Hub-Signature: sha1=abc123def456...
   *
   * Contoh body:
   * {
   *   "data": {
   *     "ref_id": "TRX-20240101-001",
   *     "rc": "00",
   *     "sn": "1234567890",
   *     "status": "Sukses",
   *     "price": 10000,
   *     "message": "Transaksi berhasil"
   *   }
   * }
   */
  @Post('digiflazz')
  async callbackDigiflazz(
    @Headers('x-hub-signature') signature: string,
    @Body() body: any,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
    this.logger.log(`[DIGIFLAZZ] Webhook received from IP: ${ipAddress}`);

    // Untuk validasi HMAC, kita butuh raw body (string mentah, bukan parsed JSON)
    // NestJS secara default sudah parse JSON. Kita perlu rawBody.
    // Jika rawBody tidak tersedia, fallback ke JSON.stringify(body)
    const rawBody = req.rawBody
      ? req.rawBody.toString('utf-8')
      : JSON.stringify(body);

    return this.webhookService.handleDigiflazzCallback(
      signature || '',
      rawBody,
      body,
      ipAddress,
    );
  }
}
