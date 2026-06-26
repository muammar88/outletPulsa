import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class JwtApiGuard extends AuthGuard('jwt-api') {
  private readonly logger = new Logger(JwtApiGuard.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Jalankan validasi JWT bawaan
    const isValid = (await super.canActivate(context)) as boolean;

    if (isValid) {
      this.updateLastLogin(context);
    }

    return isValid;
  }

  private updateLastLogin(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      
      // Ambil device_code dari header
      const deviceCode = request.headers['x-device-code'];

      if (deviceCode) {
        // Lakukan update secara non-blocking (fire and forget)
        this.prisma.deviceConnected.update({
          where: { device_code: deviceCode as string },
          data: { last_login: new Date() },
        }).catch((error) => {
          this.logger.error(`Gagal update last_login untuk device ${deviceCode}: ${error.message}`);
        });
      }
    } catch (error) {
      this.logger.error(`Error pada updateLastLogin: ${error.message}`);
    }
  }
}
