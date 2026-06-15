import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { resolve, join } from 'path';
import { User } from '../users/entities/user.entity';
import { UserBadge } from '../users/entities/user-badge.entity';
import { Location } from '../items/entities/location.entity';
import { ItemReport } from '../items/entities/item-report.entity';
import { ImageAsset } from '../items/entities/image-asset.entity';
import { Claim } from '../claims/entities/claim.entity';
import { Sighting } from '../sightings/entities/sighting.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { DetectiveGuess } from '../games/detective/entities/detective-guess.entity';
import { GhostHunt } from '../games/ghost-hunt/entities/ghost-hunt.entity';
import { TriviaQuestion } from '../games/trivia/entities/trivia-question.entity';
import { TriviaAnswer } from '../games/trivia/entities/trivia-answer.entity';
import { UserRole, TriviaType } from '@lostfound/shared';

config({ path: resolve(__dirname, '../../../../.env') });

const CAMPUS_LOCATIONS = [
  { name: 'Main Library', building: 'Library Complex', faculty: 'Central', description: 'University main library and reading rooms' },
  { name: 'Senate Building', building: 'Senate Building', faculty: 'Central', description: 'Administrative headquarters and VC office' },
  { name: 'Faculty of Science', building: 'Science Block', faculty: 'Science', description: 'Science faculty lecture halls and labs' },
  { name: 'Faculty of Engineering', building: 'Engineering Complex', faculty: 'Engineering', description: 'Engineering faculty workshops and halls' },
  { name: 'Faculty of Arts', building: 'Arts Block', faculty: 'Arts', description: 'Arts faculty lecture halls' },
  { name: 'SUB Building', building: 'Student Union', faculty: 'Central', description: 'Student Union Building, food courts and shops' },
  { name: 'Unilorin Stadium', building: 'Sports Complex', faculty: 'Central', description: 'University stadium and sports facilities' },
  { name: 'Faculty of Law', building: 'Law Block', faculty: 'Law', description: 'Law faculty lecture halls and moot court' },
  { name: 'Faculty of Education', building: 'Education Block', faculty: 'Education', description: 'Education faculty lecture halls' },
  { name: 'CBT Center', building: 'CBT Complex', faculty: 'Central', description: 'Computer-Based Testing center' },
  { name: 'Faculty of Management Sciences', building: 'Management Block', faculty: 'Management Sciences', description: 'Management Sciences lecture halls' },
  { name: 'University Health Center', building: 'Health Center', faculty: 'Central', description: 'Campus medical facility' },
  { name: 'Hostel Area', building: 'Student Hostels', faculty: 'Central', description: 'Student residential area' },
  { name: 'Gate A (Tanke)', building: 'Main Gate', faculty: 'Central', description: 'Main campus entrance at Tanke' },
  { name: 'Faculty of Agriculture', building: 'Agriculture Block', faculty: 'Agriculture', description: 'Agriculture faculty and farm area' },
];

const STATIC_TRIVIA_POOL = [
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
    question_text: "Which building houses the Vice Chancellor's office?",
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
    question_text: "What is the name of the university's teaching hospital?",
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
    options: ['Security Office', "Dean's Office", 'Library', 'Student Affairs'],
    correct_answer: 'Security Office',
  },
  {
    question_text: 'What is the best way to prevent losing items on campus?',
    options: ['Label your belongings', 'Carry less', 'Stay in one place', 'Ask friends to hold items'],
    correct_answer: 'Label your belongings',
  },
  {
    question_text: 'What does SUB stand for?',
    options: ['Student Union Building', 'Student Utility Block', 'Senior University Building', 'Student Unity Base'],
    correct_answer: 'Student Union Building',
  },
  {
    question_text: 'Which faculty has the most departments?',
    options: ['Faculty of Science', 'Faculty of Engineering', 'Faculty of Clinical Sciences', 'Faculty of Arts'],
    correct_answer: 'Faculty of Science',
  },
  {
    question_text: 'What is the name of UniLorin student radio?',
    options: ['UniLorin FM', 'Diamond FM', 'Campus Radio', 'Harmony FM'],
    correct_answer: 'Diamond FM',
  },
];

async function runSeed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, UserBadge, Location, ItemReport, ImageAsset, Claim, Sighting, AuditLog, Notification, DetectiveGuess, GhostHunt, TriviaQuestion, TriviaAnswer],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connected');

  const userRepo = dataSource.getRepository(User);
  const locationRepo = dataSource.getRepository(Location);
  const triviaRepo = dataSource.getRepository(TriviaQuestion);

  // Seed admin user
  const existingAdmin = await userRepo.findOne({
    where: { email: 'admin@lostfound.unilorin.edu.ng' },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin123!', 12);
    const admin = userRepo.create({
      email: 'admin@lostfound.unilorin.edu.ng',
      password_hash: passwordHash,
      name: 'System Admin',
      role: UserRole.ADMIN,
      faculty: 'Central',
      is_verified: true,
    });
    await userRepo.save(admin);
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  // Seed campus locations
  const existingLocations = await locationRepo.count();
  if (existingLocations === 0) {
    const locations = CAMPUS_LOCATIONS.map((loc) => locationRepo.create(loc));
    await locationRepo.save(locations);
    console.log(`${locations.length} campus locations seeded`);
  } else {
    console.log('Locations already seeded');
  }

  // Seed static trivia questions for initial week
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  const weekOf = monday.toISOString().split('T')[0];

  const existingTrivia = await triviaRepo.count({ where: { week_of: weekOf } });
  if (existingTrivia === 0) {
    const shuffled = [...STATIC_TRIVIA_POOL].sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, 10).map((q) =>
      triviaRepo.create({
        ...q,
        week_of: weekOf,
        type: TriviaType.STATIC,
      }),
    );
    await triviaRepo.save(questions);
    console.log(`${questions.length} trivia questions seeded for week ${weekOf}`);
  } else {
    console.log('Trivia questions already seeded for this week');
  }

  await dataSource.destroy();
  console.log('Seed complete');
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
