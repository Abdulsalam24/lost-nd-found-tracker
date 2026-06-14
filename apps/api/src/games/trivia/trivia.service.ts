import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { TriviaQuestion } from './entities/trivia-question.entity';
import { TriviaAnswer } from './entities/trivia-answer.entity';
import { User } from '../../users/entities/user.entity';
import { TriviaAnswerDto } from './dto/trivia-answer.dto';
import { TriviaType } from '@lostfound/shared';

const QUESTION_POOL = [
  // === CAMPUS LIFE ===
  {
    question_text: 'How many foundation faculties did UniLorin start with in 1976?',
    options: ['3', '5', '7', '10'],
    correct_answer: '3',
  },
  {
    question_text: 'What were the three foundation faculties of UniLorin?',
    options: ['Arts, Science and Education', 'Law, Medicine and Science', 'Engineering, Arts and Law', 'Education, Medicine and Arts'],
    correct_answer: 'Arts, Science and Education',
  },
  {
    question_text: 'What year was the University of Ilorin founded?',
    options: ['1975', '1978', '1980', '1970'],
    correct_answer: '1975',
  },
  {
    question_text: 'What does the UniLorin motto "Probitas Doctrina" mean in English?',
    options: ['Character and Learning', 'Knowledge for Service', 'Learning and Culture', 'Excellence and Integrity'],
    correct_answer: 'Character and Learning',
  },
  {
    question_text: 'How many faculties does UniLorin have?',
    options: ['12', '15', '16', '18'],
    correct_answer: '16',
  },
  {
    question_text: 'Which building houses the Vice Chancellor\'s office?',
    options: ['Senate Building', 'Main Library', 'Faculty of Science', 'SUB Building'],
    correct_answer: 'Senate Building',
  },
  {
    question_text: 'What is the name of the university\'s teaching hospital?',
    options: ['UITH', 'LUTH', 'UCH', 'ABUTH'],
    correct_answer: 'UITH',
  },
  {
    question_text: 'What color is the UniLorin school bus?',
    options: ['Blue and White', 'Green and White', 'Yellow', 'Red and White'],
    correct_answer: 'Green and White',
  },
  {
    question_text: 'What is the name of the Students\' Union Building at UniLorin?',
    options: ['Kaduna Nzeogwu Building', 'Awolowo Hall', 'Nnamdi Azikiwe Block', 'Tafawa Balewa Building'],
    correct_answer: 'Kaduna Nzeogwu Building',
  },

  // === TANKE & SURROUNDINGS ===
  {
    question_text: 'What is Tanke primarily known for around UniLorin?',
    options: ['Student residential area', 'Industrial zone', 'Government quarters', 'Market district'],
    correct_answer: 'Student residential area',
  },
  {
    question_text: 'Which road connects Tanke to the university main gate?',
    options: ['Tanke Road', 'Pipeline Road', 'ASA Dam Road', 'Stadium Road'],
    correct_answer: 'Tanke Road',
  },
  {
    question_text: 'What is the popular student junction in Tanke called?',
    options: ['Tanke Junction', 'T-Junction', 'Oke Odo Junction', 'Round About'],
    correct_answer: 'Tanke Junction',
  },
  {
    question_text: 'Which type of accommodation is most common around Tanke?',
    options: ['Self-contained rooms', 'Hostels only', 'Hotels', 'Government housing'],
    correct_answer: 'Self-contained rooms',
  },
  {
    question_text: 'What means of transportation is most used between Tanke and campus?',
    options: ['Okada (motorcycle)', 'Taxi', 'School bus', 'Walking only'],
    correct_answer: 'Okada (motorcycle)',
  },

  // === OKE ODO ===
  {
    question_text: 'What is Oke Odo known for among UniLorin students?',
    options: ['Affordable off-campus housing', 'Shopping mall', 'University annex', 'Sports complex'],
    correct_answer: 'Affordable off-campus housing',
  },
  {
    question_text: 'How far is Oke Odo from the UniLorin main campus approximately?',
    options: ['2-3 km', '10 km', '500 meters', '15 km'],
    correct_answer: '2-3 km',
  },
  {
    question_text: 'What is the main challenge students face living in Oke Odo?',
    options: ['Distance to campus', 'No electricity', 'No water supply', 'Wild animals'],
    correct_answer: 'Distance to campus',
  },

  // === FOOD & EATING SPOTS ===
  {
    question_text: 'Where do most students eat on campus?',
    options: ['SUB Building', 'Senate Building', 'Library Cafeteria', 'Stadium Canteen'],
    correct_answer: 'SUB Building',
  },
  {
    question_text: 'When did academic activities first begin at UniLorin?',
    options: ['October 1976', 'September 1975', 'January 1977', 'March 1978'],
    correct_answer: 'October 1976',
  },
  {
    question_text: 'Which food is the cheapest and most popular among students at UniLorin?',
    options: ['Amala and Ewedu', 'Fried Rice', 'Pizza', 'Shawarma'],
    correct_answer: 'Amala and Ewedu',
  },
  {
    question_text: 'What is the most popular drink sold around campus?',
    options: ['Zobo', 'Coca-Cola', 'Chapman', 'Smoothie'],
    correct_answer: 'Zobo',
  },
  {
    question_text: 'Where can you find the most food vendors outside campus?',
    options: ['Tanke area', 'Airport Road', 'GRA', 'Challenge'],
    correct_answer: 'Tanke area',
  },
  {
    question_text: 'What type of food stall is called "Mama Put" on campus?',
    options: ['Local food canteen', 'Fast food restaurant', 'Bakery', 'Fruit stand'],
    correct_answer: 'Local food canteen',
  },
  {
    question_text: 'Which meal time has the longest queues at campus food spots?',
    options: ['Lunch (12-2 PM)', 'Breakfast (7-9 AM)', 'Dinner (6-8 PM)', 'Late night (10 PM+)'],
    correct_answer: 'Lunch (12-2 PM)',
  },

  // === ZOO & RECREATION ===
  {
    question_text: 'Does the University of Ilorin have a zoological garden?',
    options: ['Yes', 'No', 'It was closed down', 'Only a botanical garden'],
    correct_answer: 'Yes',
  },
  {
    question_text: 'The UniLorin Zoo is managed by which department?',
    options: ['Department of Zoology', 'Department of Biology', 'Works & Maintenance', 'Student Affairs'],
    correct_answer: 'Department of Zoology',
  },
  {
    question_text: 'What is the primary purpose of the UniLorin Zoo?',
    options: ['Academic research and teaching', 'Tourism', 'Revenue generation', 'Animal rescue'],
    correct_answer: 'Academic research and teaching',
  },
  {
    question_text: 'Where is the botanical garden located on campus?',
    options: ['Near Faculty of Science', 'Behind the library', 'Mini Campus', 'Near the stadium'],
    correct_answer: 'Near Faculty of Science',
  },

  // === ASA DAM ===
  {
    question_text: 'What is the Asa Dam used for?',
    options: ['Water supply to Ilorin', 'Hydroelectric power', 'Irrigation only', 'Swimming pool'],
    correct_answer: 'Water supply to Ilorin',
  },
  {
    question_text: 'Which river feeds the Asa Dam?',
    options: ['River Asa', 'River Niger', 'River Benue', 'River Oyun'],
    correct_answer: 'River Asa',
  },
  {
    question_text: 'What do students commonly do at Asa Dam area?',
    options: ['Picnics and hangouts', 'Swimming', 'Fishing competitions', 'Boat racing'],
    correct_answer: 'Picnics and hangouts',
  },
  {
    question_text: 'How far is Asa Dam from UniLorin campus?',
    options: ['About 5 km', 'About 20 km', 'About 50 km', 'It\'s on campus'],
    correct_answer: 'About 5 km',
  },

  // === TRANSPORTATION ===
  {
    question_text: 'What is the most common public transport in Ilorin?',
    options: ['Commercial motorcycles (Okada)', 'BRT buses', 'Train', 'Uber only'],
    correct_answer: 'Commercial motorcycles (Okada)',
  },
  {
    question_text: 'Which gate is commonly used by students entering campus?',
    options: ['Gate A (Tanke)', 'Gate B (Pipeline)', 'Gate C', 'Gate D'],
    correct_answer: 'Gate A (Tanke)',
  },
  {
    question_text: 'When did UniLorin gain full autonomy from University of Ibadan?',
    options: ['1977', '1975', '1980', '1985'],
    correct_answer: '1977',
  },
  {
    question_text: 'What is the plant extract traditionally used to make Ilorin wara (cheese)?',
    options: ['Calotropis procera (Sodom apple)', 'Lemon juice', 'Vinegar', 'Aloe vera'],
    correct_answer: 'Calotropis procera (Sodom apple)',
  },
  {
    question_text: 'What color are the campus shuttle buses?',
    options: ['Green and White', 'Yellow', 'Blue', 'Red'],
    correct_answer: 'Green and White',
  },
  {
    question_text: 'Where is the main motor park closest to UniLorin?',
    options: ['Tanke Garage', 'Challenge', 'Offa Garage', 'Maraba'],
    correct_answer: 'Tanke Garage',
  },

  // === LECTURES & ACADEMICS ===
  {
    question_text: 'What is the typical lecture duration at UniLorin?',
    options: ['1-2 hours', '30 minutes', '3 hours', '4 hours'],
    correct_answer: '1-2 hours',
  },
  {
    question_text: 'Where are most science lectures held?',
    options: ['Science complex (Kennedy Hall area)', 'Senate Building', 'SUB', 'Mini Campus'],
    correct_answer: 'Science complex (Kennedy Hall area)',
  },
  {
    question_text: 'How many foundation students were first admitted to UniLorin?',
    options: ['200', '100', '500', '1000'],
    correct_answer: '200',
  },
  {
    question_text: 'What system does UniLorin use for course registration?',
    options: ['Online portal', 'Manual paper forms', 'Email registration', 'Walk-in registration'],
    correct_answer: 'Online portal',
  },
  {
    question_text: 'How many semesters are in a UniLorin academic session?',
    options: ['2 (Harmattan & Rain)', '3 (trimester)', '1', '4 (quarterly)'],
    correct_answer: '2 (Harmattan & Rain)',
  },
  {
    question_text: 'What is the minimum CGPA to graduate with First Class at UniLorin?',
    options: ['4.50', '4.00', '3.50', '5.00'],
    correct_answer: '4.50',
  },
  {
    question_text: 'What does TMA stand for in UniLorin\'s assessment system?',
    options: ['Tutor-Marked Assessment', 'Total Module Average', 'Test & Mid-term Assessment', 'Teaching Method Analysis'],
    correct_answer: 'Tutor-Marked Assessment',
  },

  // === SCHOOL POLITICS & STUDENT LIFE ===
  {
    question_text: 'What is the student governing body at UniLorin called?',
    options: ['Students\' Union', 'Student Council', 'Student Parliament', 'Student Assembly'],
    correct_answer: 'Students\' Union',
  },
  {
    question_text: 'Where are student union elections typically held?',
    options: ['Various polling units on campus', 'Senate Building', 'Stadium', 'Online'],
    correct_answer: 'Various polling units on campus',
  },
  {
    question_text: 'What title does the student union leader hold at UniLorin?',
    options: ['President', 'Governor', 'Chairman', 'Speaker'],
    correct_answer: 'President',
  },
  {
    question_text: 'Which student event is the biggest social gathering at UniLorin annually?',
    options: ['SUG Week / Cultural Day', 'Matriculation', 'Convocation', 'Sports Day'],
    correct_answer: 'SUG Week / Cultural Day',
  },
  {
    question_text: 'What is "NANS" in Nigerian student politics?',
    options: ['National Association of Nigerian Students', 'National Academic Network System', 'Nigerian Association of New Students', 'National Admissions Notification System'],
    correct_answer: 'National Association of Nigerian Students',
  },

  // === LOST & FOUND TIPS ===
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
  {
    question_text: 'Where are items most commonly lost on campus?',
    options: ['Lecture halls', 'Hostel rooms', 'Library', 'Car parks'],
    correct_answer: 'Lecture halls',
  },
  {
    question_text: 'What should you do first when you find a lost item on campus?',
    options: ['Report to security or Lost & Found', 'Keep it', 'Post on social media', 'Leave it where you found it'],
    correct_answer: 'Report to security or Lost & Found',
  },
  {
    question_text: 'Which time of year sees the most lost items on campus?',
    options: ['Exam period', 'Holidays', 'First week of resumption', 'Weekends'],
    correct_answer: 'Exam period',
  },

  // === SPORTS & RECREATION ===
  {
    question_text: 'What is the approximate land area of the University of Ilorin campus?',
    options: ['Over 5,000 hectares', '500 hectares', '100 hectares', '50 hectares'],
    correct_answer: 'Over 5,000 hectares',
  },
  {
    question_text: 'Which university was UniLorin originally affiliated to?',
    options: ['University of Ibadan', 'University of Lagos', 'Ahmadu Bello University', 'Obafemi Awolowo University'],
    correct_answer: 'University of Ibadan',
  },
  {
    question_text: 'What was UniLorin originally called when it was founded?',
    options: ['University College, Ilorin', 'Ilorin Polytechnic', 'Federal University Ilorin', 'Kwara State University'],
    correct_answer: 'University College, Ilorin',
  },
  {
    question_text: 'What inter-university sports competition does UniLorin participate in?',
    options: ['NUGA Games', 'Olympics', 'Commonwealth Games', 'WAFU Cup'],
    correct_answer: 'NUGA Games',
  },

  // === HOSTEL LIFE ===
  {
    question_text: 'What is the name of a popular male hostel at UniLorin?',
    options: ['Block A/B hostels', 'Mariere Hall', 'Moremi Hall', 'Amina Hall'],
    correct_answer: 'Block A/B hostels',
  },
  {
    question_text: 'What does UITH stand for?',
    options: ['University of Ilorin Teaching Hospital', 'University of Ibadan Teaching Hospital', 'United Ilorin Training Hospital', 'University Ilorin Technical Hospital'],
    correct_answer: 'University of Ilorin Teaching Hospital',
  },
  {
    question_text: 'What is the biggest complaint about on-campus hostels?',
    options: ['Overcrowding', 'Too expensive', 'Too far from classes', 'No internet'],
    correct_answer: 'Overcrowding',
  },
  {
    question_text: 'What does NUGA stand for in Nigerian university sports?',
    options: ['Nigerian University Games Association', 'National University Games Association', 'Nigerian Undergraduate Games Authority', 'National University Games Award'],
    correct_answer: 'Nigerian University Games Association',
  },

  // === ILORIN CITY ===
  {
    question_text: 'What state is Ilorin the capital of?',
    options: ['Kwara State', 'Lagos State', 'Oyo State', 'Kogi State'],
    correct_answer: 'Kwara State',
  },
  {
    question_text: 'What is Kwara State (where UniLorin is located) popularly called?',
    options: ['State of Harmony', 'Centre of Excellence', 'Gateway State', 'Coal City State'],
    correct_answer: 'State of Harmony',
  },
  {
    question_text: 'Which market is the largest in Ilorin?',
    options: ['Oja Oba (King\'s Market)', 'Tanke Market', 'Challenge Market', 'Unity Market'],
    correct_answer: 'Oja Oba (King\'s Market)',
  },
  {
    question_text: 'What traditional food is Ilorin most famous for?',
    options: ['Wara (local cheese)', 'Suya', 'Jollof Rice', 'Pounded Yam'],
    correct_answer: 'Wara (local cheese)',
  },
];

const QUESTIONS_PER_SESSION = 10;

@Injectable()
export class TriviaService implements OnModuleInit {
  private readonly logger = new Logger(TriviaService.name);

  constructor(
    @InjectRepository(TriviaQuestion)
    private questionRepo: Repository<TriviaQuestion>,
    @InjectRepository(TriviaAnswer)
    private answerRepo: Repository<TriviaAnswer>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedQuestions();
  }

  private async seedQuestions(): Promise<void> {
    const existing = await this.questionRepo.count();
    if (existing >= QUESTION_POOL.length) return;

    const existingTexts = (await this.questionRepo.find({ select: ['question_text'] }))
      .map((q) => q.question_text);

    const newQuestions = QUESTION_POOL
      .filter((q) => !existingTexts.includes(q.question_text))
      .map((q) => this.questionRepo.create({
        ...q,
        week_of: '2024-01-01',
        type: TriviaType.STATIC,
      }));

    if (newQuestions.length > 0) {
      await this.questionRepo.save(newQuestions);
      this.logger.log(`Seeded ${newQuestions.length} trivia questions (total pool: ${existing + newQuestions.length})`);
    }
  }

  async getRandomQuestions(userId?: string): Promise<Omit<TriviaQuestion, 'correct_answer'>[]> {
    let excludeIds: string[] = [];

    // Exclude questions the user already answered
    if (userId) {
      const answered = await this.answerRepo.find({
        where: { user_id: userId },
        select: ['question_id'],
      });
      excludeIds = answered.map((a) => a.question_id);
    }

    const qb = this.questionRepo.createQueryBuilder('q');

    if (excludeIds.length > 0) {
      qb.where('q.id NOT IN (:...excludeIds)', { excludeIds });
    }

    const questions = await qb
      .orderBy('RANDOM()')
      .limit(QUESTIONS_PER_SESSION)
      .getMany();

    return questions.map(({ correct_answer: _, ...rest }) => rest);
  }

  async getCurrentQuestions(): Promise<Omit<TriviaQuestion, 'correct_answer'>[]> {
    return this.getRandomQuestions();
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
    // No-op — questions are now served randomly from the pool
    this.logger.log('Trivia uses random pool now, no weekly generation needed');
  }
}
