import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto } from './create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepo: Repository<Feedback>,
  ) {}

  async create(dto: CreateFeedbackDto, userId?: string): Promise<Feedback> {
    const feedback = this.feedbackRepo.create({
      ...dto,
      user_id: userId ?? null,
    });
    return this.feedbackRepo.save(feedback);
  }

  async findAll(): Promise<Feedback[]> {
    return this.feedbackRepo.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async markReviewed(id: string): Promise<void> {
    await this.feedbackRepo.update(id, { reviewed: true });
  }
}
