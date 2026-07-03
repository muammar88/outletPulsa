export class ChatMessageDto {
  id: string | number;
  senderId?: string | number;
  senderName?: string;
  message: string;
  createdAt: Date | string;
}
