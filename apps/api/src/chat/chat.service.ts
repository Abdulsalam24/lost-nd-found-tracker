import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async findOrCreateConversation(
    itemReportId: string | null | undefined,
    initiatorId: string,
    recipientId: string,
  ): Promise<Conversation> {
    const whereConditions = itemReportId
      ? [
          { item_report_id: itemReportId, initiator_id: initiatorId, recipient_id: recipientId },
          { item_report_id: itemReportId, initiator_id: recipientId, recipient_id: initiatorId },
        ]
      : [
          { item_report_id: null as any, initiator_id: initiatorId, recipient_id: recipientId },
          { item_report_id: null as any, initiator_id: recipientId, recipient_id: initiatorId },
        ];

    const existing = await this.conversationRepo.findOne({
      where: whereConditions,
      relations: ['initiator', 'recipient', 'item_report'],
    });

    if (existing) return existing;

    const conversation = this.conversationRepo.create({
      item_report_id: itemReportId ?? null,
      initiator_id: initiatorId,
      recipient_id: recipientId,
    });

    const saved = await this.conversationRepo.save(conversation);
    return this.conversationRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['initiator', 'recipient', 'item_report'],
    });
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepo.find({
      where: [{ initiator_id: userId }, { recipient_id: userId }],
      relations: ['initiator', 'recipient', 'item_report', 'messages'],
      order: { updated_at: 'DESC' },
    });
  }

  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conv = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['initiator', 'recipient', 'item_report'],
    });

    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.initiator_id !== userId && conv.recipient_id !== userId) {
      throw new ForbiddenException('Not a participant');
    }

    return conv;
  }

  async getMessages(
    conversationId: string,
    userId: string,
  ): Promise<Message[]> {
    await this.getConversation(conversationId, userId);

    const messages = await this.messageRepo.find({
      where: { conversation_id: conversationId },
      relations: ['sender'],
      order: { created_at: 'ASC' },
    });

    // Mark unread messages as read
    const unreadIds = messages
      .filter((m) => m.sender_id !== userId && !m.is_read)
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      await this.messageRepo.update(unreadIds, { is_read: true });
    }

    return messages;
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    await this.getConversation(conversationId, senderId);

    const message = this.messageRepo.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    });

    const saved = await this.messageRepo.save(message);

    // Touch the conversation's updated_at
    await this.conversationRepo.update(conversationId, {});

    return this.messageRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['sender'],
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageRepo
      .createQueryBuilder('msg')
      .innerJoin('msg.conversation', 'conv')
      .where('msg.is_read = false')
      .andWhere('msg.sender_id != :userId', { userId })
      .andWhere('(conv.initiator_id = :userId OR conv.recipient_id = :userId)', { userId })
      .getCount();
  }
}
