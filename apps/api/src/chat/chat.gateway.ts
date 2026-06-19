import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3001',
      process.env.APP_URL ?? '',
    ].filter(Boolean),
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ??
        (client.handshake.headers?.authorization?.replace('Bearer ', '') as string);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.sub as string;
      client.data.userId = userId;

      // Track user's sockets
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join user's personal room
      client.join(`user:${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string | undefined;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const userId = client.data.userId as string;
    if (!userId) return;

    try {
      const message = await this.chatService.sendMessage(
        data.conversationId,
        userId,
        data.content,
      );

      const payload = {
        id: message.id,
        content: message.content,
        sender: { id: message.sender?.id, name: message.sender?.name },
        is_read: message.is_read,
        created_at: message.created_at,
      };

      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('new_message', payload);

      // Notify recipient if not in the conversation room
      const conv = await this.chatService.getConversation(
        data.conversationId,
        userId,
      );
      const recipientId =
        conv.initiator_id === userId ? conv.recipient_id : conv.initiator_id;

      this.server.to(`user:${recipientId}`).emit('message_notification', {
        conversationId: data.conversationId,
        message: payload,
      });
    } catch {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId as string;
    if (!userId) return;

    await this.chatService.getMessages(data.conversationId, userId);
  }
}
