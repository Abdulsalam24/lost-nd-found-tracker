import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateConversationDto, SendMessageDto } from './dto/create-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @CurrentUser() user: User,
    @Body() dto: CreateConversationDto,
  ) {
    const conv = await this.chatService.findOrCreateConversation(
      dto.item_report_id,
      user.id,
      dto.recipient_id,
    );

    if (dto.message) {
      await this.chatService.sendMessage(conv.id, user.id, dto.message);
    }

    return conv;
  }

  @Get('conversations')
  async getConversations(@CurrentUser() user: User) {
    const conversations = await this.chatService.getUserConversations(user.id);
    return conversations.map((conv) => {
      const lastMessage = conv.messages?.length
        ? conv.messages[conv.messages.length - 1]
        : null;
      const unread = conv.messages?.filter(
        (m) => m.sender_id !== user.id && !m.is_read,
      ).length ?? 0;

      return {
        id: conv.id,
        item_report: {
          id: conv.item_report?.id,
          title: conv.item_report?.title,
        },
        other_user: conv.initiator_id === user.id
          ? { id: conv.recipient?.id, name: conv.recipient?.name }
          : { id: conv.initiator?.id, name: conv.initiator?.name },
        last_message: lastMessage
          ? { content: lastMessage.content, created_at: lastMessage.created_at, sender_id: lastMessage.sender_id }
          : null,
        unread_count: unread,
        updated_at: conv.updated_at,
      };
    });
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @CurrentUser() user: User,
    @Param('id') conversationId: string,
  ) {
    const messages = await this.chatService.getMessages(conversationId, user.id);
    return messages.map((m) => ({
      id: m.id,
      content: m.content,
      sender: { id: m.sender?.id, name: m.sender?.name },
      is_read: m.is_read,
      created_at: m.created_at,
    }));
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @CurrentUser() user: User,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    const message = await this.chatService.sendMessage(
      conversationId,
      user.id,
      dto.content,
    );
    return {
      id: message.id,
      content: message.content,
      sender: { id: message.sender?.id, name: message.sender?.name },
      is_read: message.is_read,
      created_at: message.created_at,
    };
  }

  @Get('unread')
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.chatService.getUnreadCount(user.id);
    return { count };
  }
}
