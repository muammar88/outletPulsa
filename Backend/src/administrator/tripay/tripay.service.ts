import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class TripayService {
  private readonly logger = new Logger(TripayService.name);
  private apiKey: string;
  private privateKey: string;
  private merchantCode: string;
  private baseUrl: string;

  constructor(private prisma: PrismaService) {
    this.apiKey = process.env.TRIPAY_API_KEY || '';
    this.privateKey = process.env.TRIPAY_PRIVATE_KEY || '';
    this.merchantCode = process.env.TRIPAY_MERCHANT_CODE || '';
    const mode = process.env.TRIPAY_MODE || 'sandbox';
    this.baseUrl = mode === 'production' 
      ? 'https://tripay.co.id/api' 
      : 'https://tripay.co.id/api-sandbox';
  }

  async getPaymentChannels() {
    try {
      const response = await fetch(`${this.baseUrl}/merchant/payment-channel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data.data;
    } catch (error: any) {
      this.logger.error('Failed to get Tripay payment channels: ' + error.message);
      throw new BadRequestException('Gagal mengambil channel pembayaran: ' + error.message);
    }
  }

  async calculateFee(amount: number, code: string) {
    try {
      const response = await fetch(`${this.baseUrl}/merchant/fee-calculator?payload[]=${code}&amount=${amount}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data.data;
    } catch (error: any) {
      this.logger.error('Failed to calculate Tripay fee: ' + error.message);
      throw new BadRequestException('Gagal menghitung biaya: ' + error.message);
    }
  }

  async createTransaction(requestDepositId: number, method: string, amount: number, customerName: string, customerEmail: string, customerPhone: string) {
    const merchantRef = `DEP-${requestDepositId}-${Date.now()}`;
    const signature = crypto.createHmac('sha256', this.privateKey)
      .update(this.merchantCode + merchantRef + amount)
      .digest('hex');

    const payload = {
      method,
      merchant_ref: merchantRef,
      amount,
      customer_name: customerName || 'Member',
      customer_email: customerEmail || 'member@outletpulsa.com',
      customer_phone: customerPhone || '081234567890',
      order_items: [
        {
          sku: 'DEPOSIT',
          name: `Top Up Saldo ${amount}`,
          price: amount,
          quantity: 1
        }
      ],
      return_url: 'https://outletpulsa.com/redirect',
      expired_time: (Math.floor(Date.now() / 1000) + (24 * 60 * 60)), // 24 hours
      signature
    };

    try {
      const response = await fetch(`${this.baseUrl}/transaction/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      // Update the RequestDeposit with Tripay data
      await this.prisma.requestDeposit.update({
        where: { id: requestDepositId },
        data: {
          tripayReference: data.data.reference,
          tripayMerchantRef: merchantRef,
          tripayMethod: method,
          tripayFee: data.data.total_fee,
          checkoutUrl: data.data.checkout_url
        }
      });

      return data.data;
    } catch (error: any) {
      this.logger.error('Failed to create Tripay transaction: ' + error.message);
      throw new BadRequestException('Gagal membuat transaksi: ' + error.message);
    }
  }

  async handleCallback(body: any, signature: string) {
    // Verify signature
    const jsonBody = JSON.stringify(body);
    const expectedSignature = crypto.createHmac('sha256', this.privateKey)
      .update(jsonBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      this.logger.warn('Invalid Tripay signature received');
      return { success: false, message: 'Invalid signature' };
    }

    if (body.status === 'PAID') {
      const deposit = await this.prisma.requestDeposit.findUnique({
        where: { tripayReference: body.reference },
        include: { riwayatTransaksi: { include: { member: true } } }
      });

      if (deposit && deposit.status !== 'sukses') {
        await this.prisma.$transaction(async (prisma) => {
          // 1. Update RequestDeposit status
          await prisma.requestDeposit.update({
            where: { id: deposit.id },
            data: { status: 'sukses', waktuKirim: new Date() }
          });

          // 2. Add RiwayatSaldo
          if (deposit.riwayatTransaksi && deposit.riwayatTransaksi.member) {
            const member = deposit.riwayatTransaksi.member;
            const nominal = deposit.nominal || 0;
            const saldoSebelumnya = member.saldo || 0;
            const saldoSetelahnya = saldoSebelumnya + nominal;

            await prisma.member.update({
              where: { id: member.id },
              data: { saldo: saldoSetelahnya }
            });

            await prisma.riwayatSaldo.create({
              data: {
                kode: deposit.kode || `DEP-${Date.now()}`,
                member_id: member.id,
                nominal: nominal,
                saldo_sebelumnya: saldoSebelumnya,
                saldo_setelahnya: saldoSetelahnya,
                status: 'deposit',
                ket: `Deposit via Tripay (${deposit.tripayMethod}) Sukses`
              }
            });
          }
        });
        
        this.logger.log(`Deposit ${body.reference} successfully paid and saldo updated`);
      }
    } else if (body.status === 'EXPIRED' || body.status === 'FAILED') {
      const deposit = await this.prisma.requestDeposit.findUnique({
        where: { tripayReference: body.reference }
      });

      if (deposit && deposit.status === 'proses') {
        await this.prisma.requestDeposit.update({
          where: { id: deposit.id },
          data: { status: body.status === 'EXPIRED' ? 'expired' : 'gagal' }
        });
      }
    }

    return { success: true };
  }
}
