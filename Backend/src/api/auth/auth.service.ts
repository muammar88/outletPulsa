import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { GetOtpRegisterDto, RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { PengumumanService } from '../../pengumuman/pengumuman.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly pengumumanService: PengumumanService
  ) {}

  /**
   * Fungsi untuk memvalidasi kredensial login member dari aplikasi mobile
   */
  async login(loginDto: LoginDto) {
    const { whatsapp_number, password, device_code } = loginDto;

    // 1. Cari member berdasarkan whatsappnumber
    const member = await this.prisma.member.findFirst({
      where: { whatsappnumber: whatsapp_number },
    });

    // 2. Jika member tidak ada
    if (!member) {
      return {
        message: 'Nomor WhatsApp atau kata sandi salah.',
        data: null,
      };
    }

    // 3. Validasi password menggunakan bcrypt
    const isPasswordValid = await bcrypt.compare(password, member.password);
    if (!isPasswordValid) {
      return {
        message: 'Nomor WhatsApp atau kata sandi salah.',
        data: null,
      };
    }

    // 4. Validasi device_code
    const device = await this.prisma.deviceConnected.findUnique({
      where: { device_code },
    });

    if (!device) {
      return {
        message: 'Perangkat belum terdaftar. Silakan buka ulang aplikasi.',
        data: null,
      };
    }

    // 5. Update data device connected
    await this.prisma.deviceConnected.update({
      where: { id: device.id },
      data: {
        member_id: member.id,
        last_login: new Date(),
      },
    });

    // 6. Jika sukses, buat payload untuk JWT
    const payload = { sub: member.id, kode: member.kode, wa: member.whatsappnumber, device_code };
    const token = await this.jwtService.signAsync(payload);

    // Kirim notifikasi login
    this.pengumumanService.sendPengumuman({
        title: 'Login Berhasil',
        body: `Akun Anda berhasil login dari perangkat ${device.device_name || 'Tidak dikenal'}`,
        pengumumanType: 'System',
        targetType: 'User',
        targetId: member.id.toString(),
    }).catch(e => console.error('Failed to send login pengumuman', e));

    // 5. Kembalikan response sukses menggunakan property data
    return {
      message: 'Login Berhasil',
      data: {
        token: token,
        kode: member.kode,
      },
    };
  }

  /**
   * Fungsi untuk memvalidasi token JWT dari aplikasi mobile
   */
  async checkLogin(token: string) {
    if (!token) {
      return { message: 'Token tidak ditemukan', data: null };
    }
    try {
      this.jwtService.verify(token);
      return { message: 'Token valid', data: { valid: true } };
    } catch (e) {
      return { message: 'Token tidak valid atau expired', data: null };
    }
  }

  /**
   * Mengirim OTP untuk registrasi member baru
   */
  async getOtpRegister(dto: GetOtpRegisterDto) {
    return await this.prisma.$transaction(async (prisma) => {
      // 1. Cek apakah nomor WA sudah terdaftar
      const existingMember = await prisma.member.findUnique({
        where: { whatsappnumber: dto.whatsapp },
      });

      if (existingMember) {
        throw new BadRequestException('Nomor WhatsApp sudah digunakan dan tidak dapat didaftarkan kembali.');
      }

      // 2. Cek apakah device_code sudah pernah dipakai untuk request dalam 24 jam terakhir
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentDeviceOtp = await prisma.otpRegister.findFirst({
        where: { 
          device_code: dto.device_code,
          created_at: {
            gte: twentyFourHoursAgo
          }
        },
      });

      if (recentDeviceOtp) {
        throw new BadRequestException('Perangkat ini sudah melakukan permintaan OTP registrasi dalam 24 jam terakhir.\nSilakan coba kembali besok.');
      }

      // 3. Generate OTP and Verification Code
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate random 6-digit OTP
      const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
      const verification_code = `REG-${randomChars}`;

      // 4. Simpan ke database
      await prisma.otpRegister.create({
        data: {
          device_code: dto.device_code,
          whatsapp: dto.whatsapp,
          otp: otp,
          verification_code: verification_code,
          status: 'active',
        },
      });

      const botWhatsappNumber = process.env.BOT_WHATSAPP_NUMBER || '6281234567890';

      return { 
        message: 'Silahkan kirim pesan verifikasi ke WhatsApp Bot', 
        data: { 
          success: true,
          verification_code: verification_code,
          bot_whatsapp: botWhatsappNumber 
        } 
      };
    });
  }

  /**
   * Memproses registrasi member baru
   */
  async register(dto: RegisterDto) {
    return await this.prisma.$transaction(async (prisma) => {
      // 1. Cek ulang duplikasi nomor WA
      const existingMember = await prisma.member.findUnique({
        where: { whatsappnumber: dto.whatsapp },
      });

      if (existingMember) {
        throw new BadRequestException('Nomor WhatsApp sudah digunakan dan tidak dapat didaftarkan kembali.');
      }

      // 2. Cari data OTP yang valid
      const validOtp = await prisma.otpRegister.findFirst({
        where: {
          device_code: dto.device_code,
          whatsapp: dto.whatsapp,
          otp: dto.otp,
          status: 'active',
        },
      });

      if (!validOtp) {
        throw new BadRequestException('OTP tidak valid atau sudah digunakan.');
      }

      // 3. Validasi Kode Referal (Jika ada)
      let referralAgent: any = null;
      if (dto.kode_referal && dto.kode_referal.trim() !== '') {
        referralAgent = await prisma.member.findFirst({
          where: { kode: dto.kode_referal.trim() },
        });

        if (!referralAgent) {
          throw new BadRequestException('Kode Referal tidak ditemukan atau tidak valid.');
        }
      }

      // 4. Lanjutkan proses registrasi
      // Membuat kode acak untuk member, misal: OP1234
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const kodeMember = `OP${randomSuffix}`;
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // 5. Menyimpan data member baru
      const newMember = await prisma.member.create({
        data: {
          kode: kodeMember,
          fullname: dto.nama_pengguna,
          whatsappnumber: dto.whatsapp,
          password: hashedPassword,
          kode_agen: referralAgent ? referralAgent.kode : null,
          status: 'verfied',
        },
      });

      // 4. Ubah status OTP menjadi nonactive
      await prisma.otpRegister.update({
        where: { id: validOtp.id },
        data: { status: 'nonactive' },
      });

      // 5. Update DeviceConnected dengan ID member yang baru
      const device = await prisma.deviceConnected.findUnique({
        where: { device_code: dto.device_code },
      });
      
      if (device) {
        await prisma.deviceConnected.update({
          where: { id: device.id },
          data: { member_id: newMember.id },
        });
      }

      // Kirim notifikasi selamat datang
      this.pengumumanService.sendPengumuman({
          title: 'Selamat Datang di OutletPulsa!',
          body: `Halo ${newMember.fullname}, akun Anda berhasil didaftarkan. Nikmati kemudahan transaksi bersama kami.`,
          pengumumanType: 'System',
          targetType: 'User',
          targetId: newMember.id.toString(),
      }).catch(e => console.error('Failed to send welcome pengumuman', e));

      return { message: 'Registrasi berhasil', data: { success: true } };
    });
  }

  /**
   * Memproses Webhook dari WhatsApp untuk verifikasi OTP
   */
  async processWhatsappWebhook(sender: string, message: string) {
    if (!sender || !message) {
      return { success: false, message: 'Invalid payload' };
    }

    // Ekstrak REG-XXXXX dari pesan
    const match = message.match(/REG-[A-Z0-9]+/i);
    if (!match) {
       return { success: false, message: 'Not a verification message' };
    }
    const verificationCode = match[0].toUpperCase();
    
    // Normalisasi nomor pengirim
    let normalizedSender = sender.replace(/\D/g, '');
    if (normalizedSender.startsWith('0')) {
        normalizedSender = '62' + normalizedSender.substring(1);
    } else if (normalizedSender.startsWith('8')) {
        normalizedSender = '62' + normalizedSender;
    }

    // Cari di DB
    const otpRecord = await this.prisma.otpRegister.findFirst({
        where: {
            verification_code: verificationCode,
            status: 'active'
        }
    });

    if (!otpRecord) {
        return { success: false, message: 'Verification code not found or inactive' };
    }

    // Opsional: Validasi nomor pengirim dengan nomor yang direquest (bisa disesuaikan dengan kebutuhan)
    let dbWhatsapp = otpRecord.whatsapp.replace(/\D/g, '');
    if (dbWhatsapp.startsWith('0')) {
        dbWhatsapp = '62' + dbWhatsapp.substring(1);
    } else if (dbWhatsapp.startsWith('8')) {
        dbWhatsapp = '62' + dbWhatsapp;
    }

    // Jika valid, panggil API Provider WhatsApp untuk membalas pesan berisi OTP
    const otpMessage = `Kode OTP OutletPulsa Anda adalah: *${otpRecord.otp}*. JANGAN berikan kode ini kepada siapapun.`;
    
    // TODO: Integrasikan dengan fungsi API pengirim pesan WhatsApp yang Anda gunakan
    // Contoh: await this.whatsappService.sendMessage(normalizedSender, otpMessage);
    console.log(`[SIMULASI] Mengirim WhatsApp ke ${normalizedSender}: ${otpMessage}`);

    // Update log/status bila perlu (opsional), di sini dibiarkan 'active' agar bisa divalidasi saat /register
    
    return { success: true, message: 'Webhook processed successfully' };
  }
}
