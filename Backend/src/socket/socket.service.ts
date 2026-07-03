import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { TransactionUpdatedDto } from './dto/transaction-updated.dto';
import { BalanceUpdatedDto } from './dto/balance-updated.dto';
import { AnnouncementDto } from './dto/announcement.dto';
import { TicketUpdatedDto } from './dto/ticket-updated.dto';
import { ChatMessageDto } from './dto/chat-message.dto';

@Injectable()
export class SocketService {
  constructor(private readonly socketGateway: SocketGateway) {}

  /**
   * Emit an event to a specific member's room
   * @param memberId The ID of the member
   * @param event The event name
   * @param payload The data to send
   */
  private emitToMember(memberId: string | number, event: string, payload: any) {
    this.socketGateway.server.to(`member_${memberId}`).emit(event, payload);
  }

  /**
   * Emit an event to all connected clients (Global broadcast)
   * @param event The event name
   * @param payload The data to send
   */
  private emitToAll(event: string, payload: any) {
    this.socketGateway.server.emit(event, payload);
  }

  // --- Specific Event Emitters ---

  emitTransactionUpdated(memberId: string | number, payload: TransactionUpdatedDto) {
    this.emitToMember(memberId, 'transaction_updated', payload);
  }

  emitBalanceUpdated(memberId: string | number, payload: BalanceUpdatedDto) {
    this.emitToMember(memberId, 'balance_updated', payload);
  }

  emitTicketUpdated(memberId: string | number, payload: TicketUpdatedDto) {
    this.emitToMember(memberId, 'ticket_updated', payload);
  }

  emitChatMessage(memberId: string | number, payload: ChatMessageDto) {
    this.emitToMember(memberId, 'chat_message', payload);
  }

  emitAnnouncement(payload: AnnouncementDto, memberId?: string | number) {
    if (memberId) {
      this.emitToMember(memberId, 'announcement', payload);
    } else {
      this.emitToAll('announcement', payload);
    }
  }
}
