import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', // Customize this based on your security requirements
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SocketGateway');

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('Socket.IO Gateway Initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Get token from auth payload or authorization header
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Token not provided');
      }

      // Verify JWT
      const decoded = this.jwtService.verify(token);
      const memberId = decoded.sub; // From jwt-api.strategy.ts

      if (!memberId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Join room specifically for this member
      const roomName = `member_${memberId}`;
      client.join(roomName);

      // Save memberId to socket instance data
      client.data.memberId = memberId;

      this.logger.log(`Client connected: ${client.id} (Member: ${memberId})`);
    } catch (error) {
      this.logger.warn(`Connection rejected: ${client.id} - ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const memberId = client.data?.memberId;
    this.logger.log(`Client disconnected: ${client.id} (Member: ${memberId})`);
  }
}
