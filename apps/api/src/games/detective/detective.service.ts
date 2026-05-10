import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DetectiveGuess } from './entities/detective-guess.entity';
import { ItemReport } from '../../items/entities/item-report.entity';
import { User } from '../../users/entities/user.entity';
import { DetectiveGuessDto } from './dto/detective-guess.dto';
import { ItemCategory } from '@lostfound/shared';

@Injectable()
export class DetectiveService {
  private readonly logger = new Logger(DetectiveService.name);

  constructor(
    @InjectRepository(DetectiveGuess)
    private guessRepo: Repository<DetectiveGuess>,
    @InjectRepository(ItemReport)
    private itemsRepo: Repository<ItemReport>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async getCurrentWeekRanking(): Promise<{ categories: string[]; week_of: string }> {
    const weekOf = this.getCurrentWeekStart();

    const results = await this.itemsRepo
      .createQueryBuilder('item')
      .select('item.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('item.created_at >= :weekStart', {
        weekStart: this.getLastWeekStart(),
      })
      .andWhere('item.created_at < :weekEnd', {
        weekEnd: weekOf,
      })
      .groupBy('item.category')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany<{ category: ItemCategory; count: string }>();

    const categories = results.map((r) => r.category);

    return { categories, week_of: weekOf };
  }

  async submitGuess(dto: DetectiveGuessDto, user: User): Promise<DetectiveGuess> {
    const weekOf = this.getCurrentWeekStart();

    const existing = await this.guessRepo.findOne({
      where: { user_id: user.id, week_of: weekOf },
    });

    if (existing) {
      throw new BadRequestException('Already submitted a guess this week');
    }

    const guess = this.guessRepo.create({
      user_id: user.id,
      week_of: weekOf,
      guessed_ranking: dto.guessed_ranking,
    });

    return this.guessRepo.save(guess);
  }

  async computeScores(): Promise<void> {
    this.logger.log('Computing detective scores...');
    const weekOf = this.getCurrentWeekStart();

    const ranking = await this.getCurrentWeekRanking();
    const actualRanking = ranking.categories;

    const guesses = await this.guessRepo.find({
      where: { week_of: weekOf, score: IsNull() },
    });

    const updatePromises = guesses.map(async (guess) => {
      let score = 0;
      guess.guessed_ranking.forEach((category, index) => {
        const actualIndex = actualRanking.indexOf(category);
        if (actualIndex === index) {
          score += 2; // exact position
        } else if (actualIndex >= 0 && Math.abs(actualIndex - index) === 1) {
          score += 1; // adjacent
        }
      });

      score = Math.min(score, 10);

      await this.guessRepo.update(guess.id, { score });
      await this.usersRepo.increment({ id: guess.user_id }, 'detective_points', score);
    });

    await Promise.all(updatePromises);
    this.logger.log(`Scored ${guesses.length} detective guesses`);
  }

  private getCurrentWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }

  private getLastWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }
}
