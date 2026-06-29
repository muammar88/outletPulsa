import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtApiGuard } from '../api/guards/jwt-api.guard';

@Controller('api/notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @UseGuards(JwtApiGuard)
    @Post('fcm-token')
    async updateFcmToken(@Req() req, @Body() body: { fcm_token: string }) {
        const deviceCode = req.headers['x-device-code'];
        if (!deviceCode) {
            return { status: false, message: 'Device code missing' };
        }

        await this.notificationService.updateFcmToken(deviceCode, body.fcm_token);
        
        return {
            status: true,
            message: 'FCM Token updated successfully'
        };
    }

    @UseGuards(JwtApiGuard)
    @Get('mobile')
    async getMobileHistory(@Req() req) {
        const memberId = req.user?.id; // Assuming user is populated by JwtApiGuard

        const history = await this.notificationService.getMobileHistory(memberId);

        return {
            status: true,
            data: history
        };
    }

    @UseGuards(JwtApiGuard)
    @Post('read')
    async markAsRead(@Body() body: { recipient_id: number }) {
        await this.notificationService.markAsRead(body.recipient_id);
        
        return {
            status: true,
            message: 'Notification marked as read'
        };
    }
}
