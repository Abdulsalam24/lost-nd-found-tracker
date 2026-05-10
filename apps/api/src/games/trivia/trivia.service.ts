import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TriviaQuestion } from './entities/trivia-question.entity';
import { TriviaAnswer } from './entities/trivia-answer.entity';
import { ItemReport } from '../../items/entities/item-report.entity';
import { User } from '../../users/entities/user.entity';
import { TriviaAnswerDto } from './dto/trivia-answer.dto';
import { TriviaType, ItemCategory } from '@lostfound/shared';

const STATIC_QUESTION_POOL = [
  {
    question_text: 'What is the largest faculty at University of Ilorin?',
    options: ['Faculty of Science', 'Faculty of Engineering', 'Faculty of Arts', 'Faculty of Law'],
    correct_answer: 'Faculty of Science',
  },
  {
    question_text: 'Where is the main library located on campus?',
    options: ['Central Campus', 'South Campus', 'North Campus', 'Mini Campus'],
    correct_answer: 'Central Campus',
  },
  {
    question_text: 'What year was the University of Ilorin founded?',
    options: ['1975', '1978', '1980', '1970'],
    correct_answer: '1975',
  },
  {
    question_text: 'What is the capacity of the University of Ilorin Stadium?',
    options: ['5,000', '10,000', '15,000', '20,000'],
    correct_answer: '10,000',
  },
  {
    question_text: 'Which building houses the Vice Chancellor\'s office?',
    options: ['Senate Building', 'Main Library', 'Faculty of Science', 'SUB Building'],
    correct_answer: 'Senate Building',
  },
  {
    question_text: 'What is the motto of the University of Ilorin?',
    options: ['Probitas Doctrina', 'Knowledge for Service', 'Learning and Culture', 'Excellence and Integrity'],
    correct_answer: 'Probitas Doctrina',
  },
  {
    question_text: 'Where do most students eat on campus?',
    options: ['SUB Building', 'Senate Building', 'Library Cafeteria', 'Stadium Canteen'],
    correct_answer: 'SUB Building',
  },
  {
    question_text: 'What color is the UniLorin school bus?',
    options: ['Blue and White', 'Green and White', 'Yellow', 'Red and White'],
    correct_answer: 'Green and White',
  },
  {
    question_text: 'How many faculties does UniLorin have?',
    options: ['12', '15', '16', '18'],
    correct_answer: '16',
  },
  {
    question_text: 'Where is the campus health center located?',
    options: ['Central Campus', 'Mini Campus', 'South Campus', 'Tanke'],
    correct_answer: 'Central Campus',
  },
  {
    question_text: 'What is the name of the university\'s teaching hospital?',
    options: ['UITH', 'LUTH', 'UCH', 'ABUTH'],
    correct_answer: 'UITH',
  },
  {
    question_text: 'Which gate is commonly used by students?',
    options: ['Gate A (Tanke)', 'Gate B (Pipeline)', 'Gate C', 'Gate D'],
    correct_answer: 'Gate A (Tanke)',
  },
  {
    question_text: 'What is the most common item lost on campus?',
    options: ['ID Cards', 'Phones', 'Books', 'Keys'],
    correct_answer: 'ID Cards',
  },
  {
    question_text: 'Where should you report lost items officially?',
    options: ['Security Office', 'Dean\'s Office', 'Library', 'Student Affairs'],
    correct_answer: 'Security Office',
  },
  {
    question_text: 'What is the best way to prevent losing items on campus?',
    options: ['Label your belongings', 'Carry less', 'Stay in one place', 'Ask friends to hold items'],
    correct_answer: 'Label your belongings',
  },
];

@Injectable()
export class TriviaService {
  private readonly logger = new Logger(TriviaService.name);

  constructor(
    @InjectRepository(TriviaQuestion)
    private questionRepo: Repository<TriviaQuestion>,
    @InjectRepository(TriviaAnswer)
    private answerRepo: Repository<TriviaAnswer>,
    @InjectRepository(ItemReport)
    private itemsRepo: Repository<ItemReport>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async getCurrentQuestions(): Promise<Omit<TriviaQuestion, 'correct_answer'>[]> {
    const weekOf = this.getCurrentWeekStart();
    const questions = await this.questionRepo.find({
      where: { week_of: weekOf },
      order: { created_at: 'ASC' },
    });
    return questions.map(({ correct_answer: _, ...rest }) => rest);
  }

  async submitAnswer(dto: TriviaAnswerDto, user: User): Promise<TriviaAnswer> {
    const question = await this.questionRepo.findOne({
      where: { id: dto.question_id },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const existing = await this.answerRepo.findOne({
      where: { user_id: user.id, question_id: dto.question_id },
    });
    if (existing) {
      throw new BadRequestException('Already answered this question');
    }

    const isCorrect = dto.answer === question.correct_answer;

    let pointsEarned = 0;
    if (isCorrect) {
      pointsEarned = 10;

      // Speed bonus: max 5pts, decaying over the week
      const weekStart = new Date(question.week_of);
      const now = new Date();
      const daysSinceStart = Math.floor(
        (now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24),
      );
      const speedBonus = Math.max(0, 5 - daysSinceStart);
      pointsEarned += speedBonus;
    }

    const answer = this.answerRepo.create({
      user_id: user.id,
      question_id: dto.question_id,
      answer: dto.answer,
      is_correct: isCorrect,
      points_earned: pointsEarned,
    });

    const saved = await this.answerRepo.save(answer);

    if (pointsEarned > 0) {
      await this.usersRepo.increment({ id: user.id }, 'trivia_points', pointsEarned);
    }

    return saved;
  }

  async getLeaderboard(): Promise<{ user_id: string; name: string; total_points: number }[]> {
    const results = await this.answerRepo
      .createQueryBuilder('answer')
      .select('answer.user_id', 'user_id')
      .addSelect('user.name', 'name')
      .addSelect('SUM(answer.points_earned)', 'total_points')
      .leftJoin('answer.user', 'user')
      .groupBy('answer.user_id')
      .addGroupBy('user.name')
      .orderBy('total_points', 'DESC')
      .limit(50)
      .getRawMany<{ user_id: string; name: string; total_points: string }>();

    return results.map((r) => ({
      user_id: r.user_id,
      name: r.name,
      total_points: parseInt(r.total_points, 10),
    }));
  }

  async generateWeeklyQuestions(): Promise<void> {
    this.logger.log('Generating weekly trivia questions...');
    const weekOf = this.getCurrentWeekStart();

    const existing = await this.questionRepo.count({ where: { week_of: weekOf } });
    if (existing > 0) {
      this.logger.log('Questions already exist for this week');
      return;
    }

    // 5 dynamic questions from last week's data
    const dynamicQuestions = await this.generateDynamicQuestions(weekOf);

    // 5 static random questions
    const shuffled = [...STATIC_QUESTION_POOL].sort(() => Math.random() - 0.5);
    const staticQuestions = shuffled.slice(0, 5).map((q) => ({
      ...q,
      week_of: weekOf,
      type: TriviaType.STATIC,
      options: q.options,
    }));

    const allQuestions = [...dynamicQuestions, ...staticQuestions];

    const entities = allQuestions.map((q) => this.questionRepo.create(q));
    await this.questionRepo.save(entities);

    this.logger.log(`Generated ${entities.length} trivia questions for week ${weekOf}`);
  }

  private async generateDynamicQuestions(
    weekOf: string,
  ): Promise<Partial<TriviaQuestion>[]> {
    const lastWeekStart = this.getLastWeekStart();
    const questions: Partial<TriviaQuestion>[] = [];

    // Q1: Top lost category last week
    const topCategory = await this.itemsRepo
      .createQueryBuilder('item')
      .select('item.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('item.created_at >= :start', { start: lastWeekStart })
      .andWhere('item.created_at < :end', { end: weekOf })
      .groupBy('item.category')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne<{ category: ItemCategory; count: string }>();

    if (topCategory) {
      const categories = Object.values(ItemCategory);
      questions.push({
        week_of: weekOf,
        question_text: 'What was the most reported item category last week?',
        options: categories.slice(0, 4),
        correct_answer: topCategory.category,
        type: TriviaType.DYNAMIC,
      });
    }

    // Q2: Total items last week
    const totalItems = await this.itemsRepo
      .createQueryBuilder('item')
      .where('item.created_at >= :start', { start: lastWeekStart })
      .andWhere('item.created_at < :end', { end: weekOf })
      .getCount();

    const fakeOptions = [totalItems, totalItems + 3, totalItems - 2, totalItems + 7]
      .sort(() => Math.random() - 0.5);

    questions.push({
      week_of: weekOf,
      question_text: 'How many items were reported last week?',
      options: fakeOptions.map(String),
      correct_answer: String(totalItems),
      type: TriviaType.DYNAMIC,
    });

    // Q3: Lost vs found ratio
    const lostCount = await this.itemsRepo
      .createQueryBuilder('item')
      .where('item.type = :type', { type: 'LOST' })
      .andWhere('item.created_at >= :start', { start: lastWeekStart })
      .andWhere('item.created_at < :end', { end: weekOf })
      .getCount();

    questions.push({
      week_of: weekOf,
      question_text: 'Were there more lost or found items reported last week?',
      options: ['More lost items', 'More found items', 'Equal', 'No reports'],
      correct_answer: lostCount > totalItems - lostCount ? 'More lost items' : lostCount < totalItems - lostCount ? 'More found items' : 'Equal',
      type: TriviaType.DYNAMIC,
    });

    // Q4: Most active location
    const topLocation = await this.itemsRepo
      .createQueryBuilder('item')
      .select('location.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('item.location', 'location')
      .where('item.created_at >= :start', { start: lastWeekStart })
      .andWhere('item.created_at < :end', { end: weekOf })
      .groupBy('location.name')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne<{ name: string; count: string }>();

    if (topLocation) {
      questions.push({
        week_of: weekOf,
        question_text: 'Which location had the most item reports last week?',
        options: [topLocation.name, 'Main Library', 'Senate Building', 'SUB Building'].filter(
          (v, i, arr) => arr.indexOf(v) === i,
        ).slice(0, 4),
        correct_answer: topLocation.name,
        type: TriviaType.DYNAMIC,
      });
    }

    // Q5: Recovery count
    const recoveredCount = await this.itemsRepo
      .createQueryBuilder('item')
      .where('item.status = :status', { status: 'RECOVERED' })
      .andWhere('item.updated_at >= :start', { start: lastWeekStart })
      .andWhere('item.updated_at < :end', { end: weekOf })
      .getCount();

    const recoveryOptions = [recoveredCount, recoveredCount + 2, recoveredCount + 5, Math.max(0, recoveredCount - 1)]
      .sort(() => Math.random() - 0.5);

    questions.push({
      week_of: weekOf,
      question_text: 'How many items were recovered last week?',
      options: recoveryOptions.map(String),
      correct_answer: String(recoveredCount),
      type: TriviaType.DYNAMIC,
    });

    return questions.slice(0, 5);
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
