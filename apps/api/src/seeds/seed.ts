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
import { UserRole, TriviaType, ItemType, ItemCategory } from '@lostfound/shared';

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

const SEED_USERS = [
  { name: 'Aisha Bello', faculty: 'Faculty of Science' },
  { name: 'Tunde Olaiya', faculty: 'Faculty of Engineering' },
  { name: 'Fatima Abdullahi', faculty: 'Faculty of Arts' },
  { name: 'Chinedu Okafor', faculty: 'Faculty of Law' },
  { name: 'Mariam Yusuf', faculty: 'Faculty of Education' },
  { name: 'Ibrahim Suleiman', faculty: 'Faculty of Management Sciences' },
  { name: 'Blessing Eze', faculty: 'Faculty of Social Sciences' },
  { name: 'Yusuf Garba', faculty: 'Faculty of Agriculture' },
  { name: 'Khadijah Musa', faculty: 'Faculty of Life Sciences' },
  { name: 'Emeka Nwosu', faculty: 'Faculty of Physical Sciences' },
  { name: 'Halima Danjuma', faculty: 'Faculty of Pharmaceutical Sciences' },
  { name: 'David Okonkwo', faculty: 'Faculty of Veterinary Medicine' },
  { name: 'Zainab Ahmed', faculty: 'College of Health Sciences' },
  { name: 'Samuel Adeyemi', faculty: 'Faculty of Engineering' },
  { name: 'Rukayat Lawal', faculty: 'Faculty of Science' },
  { name: 'Peter Obi', faculty: 'Faculty of Arts' },
  { name: 'Amina Bakare', faculty: 'Faculty of Education' },
  { name: 'John Adekunle', faculty: 'Faculty of Law' },
  { name: 'Hafsat Idris', faculty: 'Faculty of Management Sciences' },
  { name: 'Victor Ogundele', faculty: 'Faculty of Social Sciences' },
];

const SEED_ITEMS = [
  { title: 'Samsung Galaxy A54', description: 'Black Samsung phone with cracked screen protector, last seen at the library charging area around 2pm.', category: ItemCategory.ELECTRONICS, type: ItemType.LOST, userIndex: 0, locationName: 'Main Library' },
  { title: 'Student ID Card - Aisha Bello', description: 'UniLorin student ID card with blue lanyard attached. Name visible on the front.', category: ItemCategory.ID_CARDS, type: ItemType.LOST, userIndex: 0, locationName: 'Senate Building' },
  { title: 'Blue Jansport Backpack', description: 'Navy blue Jansport backpack containing engineering textbooks and a calculator. Has a small tear on the side pocket.', category: ItemCategory.BAGS, type: ItemType.LOST, userIndex: 1, locationName: 'Faculty of Engineering' },
  { title: 'Scientific Calculator (Casio fx-991)', description: 'Found a Casio scientific calculator on a desk in the CBT center after the morning exam session.', category: ItemCategory.ELECTRONICS, type: ItemType.FOUND, userIndex: 2, locationName: 'CBT Center' },
  { title: 'Course Registration Form', description: 'Printed course registration form for 300 level Law found near the photocopier.', category: ItemCategory.COURSE_FORM, type: ItemType.FOUND, userIndex: 3, locationName: 'Faculty of Law' },
  { title: 'iPhone 13 Pro Max', description: 'Gold iPhone 13 Pro Max in a clear case. Was using it at SUB and left it on the table.', category: ItemCategory.ELECTRONICS, type: ItemType.LOST, userIndex: 4, locationName: 'SUB Building' },
  { title: 'Prescription Glasses', description: 'Black frame prescription glasses in a brown leather case. Lost somewhere between the hostel and faculty.', category: ItemCategory.OTHER, type: ItemType.LOST, userIndex: 5, locationName: 'Hostel Area' },
  { title: 'Bunch of Keys (4 keys)', description: 'Found a bunch of 4 keys on a silver keyring with a small torch near the stadium entrance.', category: ItemCategory.KEYS, type: ItemType.FOUND, userIndex: 6, locationName: 'Unilorin Stadium' },
  { title: 'HP Laptop Charger', description: 'Black HP laptop charger with blue tip. Left it plugged in at the library and forgot to pick it up.', category: ItemCategory.ELECTRONICS, type: ItemType.LOST, userIndex: 7, locationName: 'Main Library' },
  { title: 'White Lab Coat', description: 'White lab coat with name tag "K. Musa" on the breast pocket. Size medium.', category: ItemCategory.CLOTHING, type: ItemType.LOST, userIndex: 8, locationName: 'Faculty of Science' },
  { title: 'Foundation of Law Textbook', description: 'Found a copy of "Foundations of Nigerian Law" textbook on a bench outside the moot court.', category: ItemCategory.BOOKS, type: ItemType.FOUND, userIndex: 9, locationName: 'Faculty of Law' },
  { title: 'ATM Card (Access Bank)', description: 'Lost my Access Bank ATM card somewhere around the cafeteria area during lunch break.', category: ItemCategory.OTHER, type: ItemType.LOST, userIndex: 10, locationName: 'SUB Building' },
  { title: 'Stethoscope', description: 'Found a red Littmann stethoscope in the Health Center waiting area this morning.', category: ItemCategory.OTHER, type: ItemType.FOUND, userIndex: 11, locationName: 'University Health Center' },
  { title: 'Exam Docket', description: 'Lost my exam docket for second semester 2025/2026. Might have fallen out of my folder.', category: ItemCategory.COURSE_FORM, type: ItemType.LOST, userIndex: 12, locationName: 'Senate Building' },
  { title: 'Wireless Earbuds (AirPods)', description: 'White AirPods in charging case. Left them in the 200-level lecture hall after morning class.', category: ItemCategory.ELECTRONICS, type: ItemType.LOST, userIndex: 13, locationName: 'Faculty of Engineering' },
  { title: 'Brown Leather Wallet', description: 'Found a brown leather wallet with some cash and a student ID near Gate A bus stop.', category: ItemCategory.OTHER, type: ItemType.FOUND, userIndex: 14, locationName: 'Gate A (Tanke)' },
  { title: 'Umbrella (Black, Foldable)', description: 'Lost my black foldable umbrella at the Education faculty. It has a wooden handle.', category: ItemCategory.OTHER, type: ItemType.LOST, userIndex: 15, locationName: 'Faculty of Education' },
  { title: 'Notebook with Handwritten Notes', description: 'A4 hardcover notebook with semester notes for MGS 301. Very important for exams.', category: ItemCategory.STATIONERY, type: ItemType.LOST, userIndex: 16, locationName: 'Faculty of Management Sciences' },
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

  // Seed test users
  const itemRepo = dataSource.getRepository(ItemReport);
  const existingUsers = await userRepo.count({ where: { role: UserRole.USER } });

  if (existingUsers < 20) {
    // Clear existing test users and their items to re-seed
    if (existingUsers > 0) {
      const notifRepo = dataSource.getRepository(Notification);
      const claimRepo = dataSource.getRepository(Claim);
      const sightingRepo = dataSource.getRepository(Sighting);
      await notifRepo.createQueryBuilder().delete().execute();
      await sightingRepo.createQueryBuilder().delete().execute();
      await claimRepo.createQueryBuilder().delete().execute();
      await itemRepo.createQueryBuilder().delete().execute();
      await userRepo.delete({ role: UserRole.USER });
      console.log("Cleared existing test users and items");
    }
    const savedUsers: User[] = [];
    for (let i = 0; i < SEED_USERS.length; i++) {
      const u = SEED_USERS[i];
      const email = `abdulsalammohammed586686+${i + 1}@gmail.com`;
      const passwordHash = await bcrypt.hash('123456789', 12);
      const user = userRepo.create({
        email,
        password_hash: passwordHash,
        name: u.name,
        role: UserRole.USER,
        faculty: u.faculty,
        is_verified: true,
      });
      savedUsers.push(await userRepo.save(user));
    }
    console.log(`${savedUsers.length} test users seeded`);

    // Seed items
    const allLocations = await locationRepo.find();
    const locationMap = new Map(allLocations.map((l) => [l.name, l.id]));

    for (const item of SEED_ITEMS) {
      const reporter = savedUsers[item.userIndex];
      const locationId = locationMap.get(item.locationName);
      if (!reporter || !locationId) continue;

      const daysAgo = Math.floor(Math.random() * 14) + 1;
      const dateOfEvent = new Date();
      dateOfEvent.setDate(dateOfEvent.getDate() - daysAgo);

      const report = itemRepo.create({
        title: item.title,
        description: item.description,
        category: item.category,
        type: item.type,
        reporter_id: reporter.id,
        location_id: locationId,
        date_of_event: dateOfEvent.toISOString().split("T")[0],
      });
      await itemRepo.save(report);
    }
    console.log(`${SEED_ITEMS.length} items seeded`);
  } else {
    console.log('Test users already seeded');
  }

  await dataSource.destroy();
  console.log('Seed complete');
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
