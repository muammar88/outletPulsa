import { Injectable, Logger } from '@nestjs/common';

export interface SendWhatsappResult {
  success: boolean;
  status: 'sent' | 'rejected' | 'timeout' | 'config_missing' | 'error';
  message: string;
  data?: any;
}

@Injectable()
export class WapisenderService {
  private readonly logger = new Logger(WapisenderService.name);

  private get apiUrl(): string {
    return process.env.WAPISENDER_URL || 'https://wapisender.id/api/message/send';
  }

  private get apiKey(): string {
    return process.env.WAPISENDER_API_KEY || '';
  }

  private get deviceKey(): string {
    return process.env.WAPISENDER_DEVICE_KEY || '';
  }

  public normalizePhone(phone: string): string {
    if (!phone) return '';
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '62' + digits.substring(1);
    } else if (digits.startsWith('8')) {
      digits = '62' + digits;
    }
    return digits;
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('WAPISENDER_TIMEOUT')), timeoutMs);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer!);
    }
  }

  async sendMessage(phone: string, message: string): Promise<SendWhatsappResult> {
    const apiKey = this.apiKey;
    const deviceKey = this.deviceKey;

    if (!apiKey || !deviceKey) {
      this.logger.warn(`[WapiSender] API Key atau Device Key belum dikonfigurasi`);
      return {
        success: false,
        status: 'config_missing',
        message: 'Kredensial WapiSender tidak lengkap',
      };
    }

    const normalizedTo = this.normalizePhone(phone);
    if (!normalizedTo || normalizedTo.length < 10) {
      return {
        success: false,
        status: 'error',
        message: 'Nomor telepon tujuan tidak valid',
      };
    }

    const payload = {
      api_key: apiKey,
      device_key: deviceKey,
      to: normalizedTo,
      message: message,
      is_priority: true,
    };

    try {
      const response = await this.withTimeout(
        fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
        15000,
      );

      const responseText = await response.text();
      let responseJson: any = null;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        this.logger.error(`[WapiSender] Response non-JSON dari provider: ${responseText}`);
        return {
          success: false,
          status: 'error',
          message: 'Response non-JSON dari provider',
        };
      }

      if (!response.ok) {
        this.logger.error(`[WapiSender] HTTP ${response.status} failed: ${responseText}`);
        return {
          success: false,
          status: 'error',
          message: responseJson?.message || `HTTP ${response.status}`,
          data: responseJson,
        };
      }

      if (responseJson.status === false || responseJson.status === 'false') {
        this.logger.warn(`[WapiSender] Provider rejected message: ${responseJson.message}`);
        return {
          success: false,
          status: 'rejected',
          message: responseJson.message || 'Pesan ditolak oleh WapiSender',
          data: responseJson,
        };
      }

      this.logger.log(`[WapiSender] Pesan berhasil dikirim ke ${normalizedTo}`);
      return {
        success: true,
        status: 'sent',
        message: responseJson.message || 'Pesan berhasil dikirim',
        data: responseJson,
      };

    } catch (err: any) {
      if (err.message === 'WAPISENDER_TIMEOUT') {
        this.logger.error(`[WapiSender] Timeout saat mengirim pesan ke ${normalizedTo}`);
        return {
          success: false,
          status: 'timeout',
          message: 'Timeout saat menghubungi WapiSender',
        };
      }
      this.logger.error(`[WapiSender] Error mengirim pesan:`, err);
      return {
        success: false,
        status: 'error',
        message: err.message,
      };
    }
  }
}
