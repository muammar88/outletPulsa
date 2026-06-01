import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, Res, Req, UseGuards, Get } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const kode = body.username || body.kode;
    const password = body.password;

    if (!kode || !password) {
      throw new UnauthorizedException('Username dan password wajib diisi');
    }

    const result = await this.authService.login(kode, password);

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { success: true, user: result.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refresh_token = req.cookies?.['refresh_token'];
    
    if (!refresh_token) {
      throw new UnauthorizedException('Refresh token is required');
    }
    
    const result = await this.authService.refreshToken(refresh_token);
    
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000,
    });

    return { success: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request & { user: any }, @Res({ passthrough: true }) res: Response) {
    // Hapus refresh token dari database
    await this.authService.logout(req.user.id);

    // Hapus kedua cookie dari browser
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax', path: '/' });
    res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'lax', path: '/' });

    return { success: true };
  }
}
