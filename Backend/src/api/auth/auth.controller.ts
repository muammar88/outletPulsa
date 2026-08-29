import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GetOtpRegisterDto, RegisterDto } from './dto/register.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('check-login')
  @HttpCode(HttpStatus.OK)
  async checkLogin(@Body() body: any) {
    return this.authService.checkLogin(body?.token);
  }

  @Post('otp-register')
  @HttpCode(HttpStatus.OK)
  async getOtpRegister(@Body() dto: GetOtpRegisterDto) {
    return this.authService.getOtpRegister(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('webhook-whatsapp')
  @HttpCode(HttpStatus.OK)
  async webhookWhatsapp(@Body() body: any) {
    // Note: Parameter mapping will depend on the WhatsApp Gateway Provider used
    const sender = body?.sender || body?.phone || body?.from;
    const message = body?.message || body?.text || body?.body;
    return this.authService.processWhatsappWebhook(sender, message);
  }
}
