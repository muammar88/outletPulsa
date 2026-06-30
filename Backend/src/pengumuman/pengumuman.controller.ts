import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { PengumumanService } from './pengumuman.service';
import { JwtApiGuard } from '../api/guards/jwt-api.guard';

@Controller('api/pengumumans')
export class PengumumanController {
    constructor(private readonly pengumumanService: PengumumanService) {}

    @UseGuards(JwtApiGuard)
    @Post('fcm-token')
    async updateFcmToken(@Req() req, @Body() body: { fcm_token: string }) {
        const deviceCode = req.headers['x-device-code'];
        if (!deviceCode) {
            return { status: false, message: 'Device code missing' };
        }

        await this.pengumumanService.updateFcmToken(deviceCode, body.fcm_token);
        
        return {
            status: true,
            message: 'FCM Token updated successfully'
        };
    }

    @UseGuards(JwtApiGuard)
    @Get('mobile')
    async getMobileHistory(@Req() req) {
        const memberId = req.user?.id;
        const deviceCode = req.headers['x-device-code'];

        const history = await this.pengumumanService.getMobileHistory(memberId, deviceCode);

        return {
            status: true,
            data: history
        };
    }

    @UseGuards(JwtApiGuard)
    @Post('read')
    async markAsRead(@Req() req, @Body() body: { recipient_id: number }) {
        const memberId = req.user?.id;
        const deviceCode = req.headers['x-device-code'];
        await this.pengumumanService.markAsRead(body.recipient_id, memberId, deviceCode);
        
        return {
            status: true,
            message: 'Pengumuman marked as read'
        };
    }
}
