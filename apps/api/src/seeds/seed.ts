import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { resolve } from 'path';
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
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';
import { Feedback } from '../feedback/feedback.entity';
import {
  UserRole,
  TriviaType,
  ItemType,
  ItemCategory,
  ItemStatus,
  ClaimStatus,
  BadgeType,
} from '@lostfound/shared';

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
  { question_text: 'What is the largest faculty at University of Ilorin?', options: ['Faculty of Science', 'Faculty of Engineering', 'Faculty of Arts', 'Faculty of Law'], correct_answer: 'Faculty of Science' },
  { question_text: 'Where is the main library located on campus?', options: ['Central Campus', 'South Campus', 'North Campus', 'Mini Campus'], correct_answer: 'Central Campus' },
  { question_text: 'What year was the University of Ilorin founded?', options: ['1975', '1978', '1980', '1970'], correct_answer: '1975' },
  { question_text: 'What is the capacity of the University of Ilorin Stadium?', options: ['5,000', '10,000', '15,000', '20,000'], correct_answer: '10,000' },
  { question_text: "Which building houses the Vice Chancellor's office?", options: ['Senate Building', 'Main Library', 'Faculty of Science', 'SUB Building'], correct_answer: 'Senate Building' },
  { question_text: 'What is the motto of the University of Ilorin?', options: ['Probitas Doctrina', 'Knowledge for Service', 'Learning and Culture', 'Excellence and Integrity'], correct_answer: 'Probitas Doctrina' },
  { question_text: 'Where do most students eat on campus?', options: ['SUB Building', 'Senate Building', 'Library Cafeteria', 'Stadium Canteen'], correct_answer: 'SUB Building' },
  { question_text: 'What color is the UniLorin school bus?', options: ['Blue and White', 'Green and White', 'Yellow', 'Red and White'], correct_answer: 'Green and White' },
  { question_text: 'How many faculties does UniLorin have?', options: ['12', '15', '16', '18'], correct_answer: '16' },
  { question_text: 'Where is the campus health center located?', options: ['Central Campus', 'Mini Campus', 'South Campus', 'Tanke'], correct_answer: 'Central Campus' },
  { question_text: "What is the name of the university's teaching hospital?", options: ['UITH', 'LUTH', 'UCH', 'ABUTH'], correct_answer: 'UITH' },
  { question_text: 'Which gate is commonly used by students?', options: ['Gate A (Tanke)', 'Gate B (Pipeline)', 'Gate C', 'Gate D'], correct_answer: 'Gate A (Tanke)' },
  { question_text: 'What is the most common item lost on campus?', options: ['ID Cards', 'Phones', 'Books', 'Keys'], correct_answer: 'ID Cards' },
  { question_text: 'Where should you report lost items officially?', options: ['Security Office', "Dean's Office", 'Library', 'Student Affairs'], correct_answer: 'Security Office' },
  { question_text: 'What is the best way to prevent losing items on campus?', options: ['Label your belongings', 'Carry less', 'Stay in one place', 'Ask friends to hold items'], correct_answer: 'Label your belongings' },
  { question_text: 'What does SUB stand for?', options: ['Student Union Building', 'Student Utility Block', 'Senior University Building', 'Student Unity Base'], correct_answer: 'Student Union Building' },
  { question_text: 'Which faculty has the most departments?', options: ['Faculty of Science', 'Faculty of Engineering', 'Faculty of Clinical Sciences', 'Faculty of Arts'], correct_answer: 'Faculty of Science' },
  { question_text: 'What is the name of UniLorin student radio?', options: ['UniLorin FM', 'Diamond FM', 'Campus Radio', 'Harmony FM'], correct_answer: 'Diamond FM' },
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
  { title: 'Samsung Galaxy A54', description: 'Black Samsung phone with cracked screen protector, last seen at the library charging area around 2pm.', category: ItemCategory.ELECTRONICS, type: ItemType.LOST, userIndex: 0, locationName: 'Main Library', imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop' },
  { title: 'Student ID Card - Aisha Bello', description: 'UniLorin student ID card with blue lanyard attached. Name visible on the front.', category: ItemCategory.ID_CARDS, type: ItemType.LOST, userIndex: 0, locationName: 'Senate Building', imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop' },
  { title: 'Blue Jansport Backpack', description: 'Navy blue Jansport backpack containing engineering textbooks and a calculator. Has a small tear on the side pocket.', category: ItemCategory.BAGS, type: ItemType.LOST, userIndex: 1, locationName: 'Faculty of Engineering', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop' },
  { title: 'Scientific Calculator (Casio fx-991)', description: 'Found a Casio scientific calculator on a desk in the CBT center after the morning exam session.', category: ItemCategory.ELECTRONICS, type: ItemType.FOUND, userIndex: 2, locationName: 'CBT Center', imageUrl: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&h=300&fit=crop' },
  { title: 'Course Registration Form', description: 'Printed course registration form for 300 level Law found near the photocopier.', category: ItemCategory.COURSE_FORM, type: ItemType.FOUND, userIndex: 3, locationName: 'Faculty of Law', imageUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop' },
  { title: 'iPhone 13 Pro Max', description: 'Gold iPhone 13 Pro Max in a clear case. Was using it at SUB and left it on the table.', category: ItemCategory.ELECTRONICS, type: ItemType.LOST, userIndex: 4, locationName: 'SUB Building', imageUrl: 'https://images.unsplash.com/photo-1632633173522-47456de71b76?w=400&h=300&fit=crop' },
  { title: 'Prescription Glasses', description: 'Black frame prescription glasses in a brown leather case. Lost somewhere between the hostel and faculty.', category: ItemCategory.OTHER, type: ItemType.LOST, userIndex: 5, locationName: 'Hostel Area', imageUrl: 'https://images.unsplash.com/photo-1574258495973-f7977603b6d2?w=400&h=300&fit=crop' },
  { title: 'Bunch of Keys (4 keys)', description: 'Found a bunch of 4 keys on a silver keyring with a small torch near the stadium entrance.', category: ItemCategory.KEYS, type: ItemType.FOUND, userIndex: 6, locationName: 'Unilorin Stadium', imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&h=300&fit=crop' },
  { title: 'HP Laptop Charger', description: 'Black HP laptop charger with blue tip. Left it plugged in at the library and forgot to pick it up.', category: ItemCategory.ELECTRONICS, type: ItemType.LOST, userIndex: 7, locationName: 'Main Library', imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop' },
  { title: 'White Lab Coat', description: 'White lab coat with name tag "K. Musa" on the breast pocket. Size medium.', category: ItemCategory.CLOTHING, type: ItemType.LOST, userIndex: 8, locationName: 'Faculty of Science', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop' },
  { title: 'Foundation of Law Textbook', description: 'Found a copy of "Foundations of Nigerian Law" textbook on a bench outside the moot court.', category: ItemCategory.BOOKS, type: ItemType.FOUND, userIndex: 9, locationName: 'Faculty of Law', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop' },
  { title: 'ATM Card (Access Bank)', description: 'Lost my Access Bank ATM card somewhere around the cafeteria area during lunch break.', category: ItemCategory.OTHER, type: ItemType.LOST, userIndex: 10, locationName: 'SUB Building', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop' },
  { title: 'Stethoscope', description: 'Found a red Littmann stethoscope in the Health Center waiting area this morning.', category: ItemCategory.OTHER, type: ItemType.FOUND, userIndex: 11, locationName: 'University Health Center', imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=300&fit=crop' },
  { title: 'Exam Docket', description: 'Lost my exam docket for second semester 2025/2026. Might have fallen out of my folder.', category: ItemCategory.COURSE_FORM, type: ItemType.LOST, userIndex: 12, locationName: 'Senate Building', imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop' },
  { title: 'Wireless Earbuds (AirPods)', description: 'White AirPods in charging case. Left them in the 200-level lecture hall after morning class.', category: ItemCategory.ELECTRONICS, type: ItemType.LOST, userIndex: 13, locationName: 'Faculty of Engineering', imageUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=300&fit=crop' },
  { title: 'Brown Leather Wallet', description: 'Found a brown leather wallet with some cash and a student ID near Gate A bus stop.', category: ItemCategory.OTHER, type: ItemType.FOUND, userIndex: 14, locationName: 'Gate A (Tanke)', imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop' },
  { title: 'Umbrella (Black, Foldable)', description: 'Lost my black foldable umbrella at the Education faculty. It has a wooden handle.', category: ItemCategory.OTHER, type: ItemType.LOST, userIndex: 15, locationName: 'Faculty of Education', imageUrl: 'https://images.unsplash.com/photo-1534309466160-70b22cc6254b?w=400&h=300&fit=crop' },
  { title: 'Notebook with Handwritten Notes', description: 'A4 hardcover notebook with semester notes for MGS 301. Very important for exams.', category: ItemCategory.STATIONERY, type: ItemType.LOST, userIndex: 16, locationName: 'Faculty of Management Sciences', imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=300&fit=crop' },
];

// Items specifically for the test user
const TEST_USER_ITEMS = [
  { title: 'MacBook Pro Charger', description: 'Lost my MacBook charger (USB-C, 67W) at the library. Was sitting on the second floor near the window.', category: ItemCategory.ELECTRONICS, type: ItemType.LOST, locationName: 'Main Library', imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=300&fit=crop' },
  { title: 'Red Nike Water Bottle', description: 'Found a red Nike water bottle at the stadium bleachers after the football match.', category: ItemCategory.OTHER, type: ItemType.FOUND, locationName: 'Unilorin Stadium', imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop' },
  { title: 'USB Flash Drive (32GB)', description: 'Lost a black SanDisk 32GB flash drive with all my project files. Might be at the CBT center.', category: ItemCategory.ELECTRONICS, type: ItemType.LOST, locationName: 'CBT Center', imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=300&fit=crop' },
  { title: 'Student ID Card', description: 'Found a student ID card near the Senate Building parking lot.', category: ItemCategory.ID_CARDS, type: ItemType.FOUND, locationName: 'Senate Building', imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop', status: ItemStatus.RECOVERED },
  { title: 'Textbook - Introduction to Algorithms', description: 'Found CLRS algorithms textbook left on a bench at the Engineering faculty.', category: ItemCategory.BOOKS, type: ItemType.FOUND, locationName: 'Faculty of Engineering', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop', status: ItemStatus.RECOVERED },
];

const CHAT_MESSAGES = [
  // Conversation 1: Test user found someone's item
  [
    { fromTest: false, content: 'Hi! I think you found my calculator. It has my initials "FA" scratched on the back.' },
    { fromTest: true, content: 'Hey! Yes I did find a calculator at the CBT center. Let me check the back...' },
    { fromTest: true, content: 'Yes I can see "FA" scratched on it! Where can we meet?' },
    { fromTest: false, content: 'Thats great! Can we meet at the SUB Building tomorrow around 12pm?' },
    { fromTest: true, content: 'Sure, I\'ll be there. I\'ll be wearing a blue shirt.' },
    { fromTest: false, content: 'Thank you so much! You\'re a lifesaver!' },
  ],
  // Conversation 2: Someone found test user's item
  [
    { fromTest: true, content: 'Hello, I saw you found a MacBook charger at the library. I think it might be mine!' },
    { fromTest: false, content: 'Hi! Yes I found one yesterday. What brand is yours?' },
    { fromTest: true, content: 'It\'s a 67W USB-C Apple charger. White color.' },
    { fromTest: false, content: 'That matches! I\'m at the Engineering faculty most days. When works for you?' },
    { fromTest: true, content: 'I can come by tomorrow morning before 10am class.' },
    { fromTest: false, content: 'Perfect. Meet me at the entrance. I\'ll have it with me.' },
    { fromTest: true, content: 'Thanks a lot! Really appreciate it.' },
  ],
  // Conversation 3: Active conversation about a lost phone
  [
    { fromTest: false, content: 'Salam! I noticed you reported finding items before. Have you seen a gold iPhone around SUB?' },
    { fromTest: true, content: 'Hmm not recently. When did you lose it?' },
    { fromTest: false, content: 'Yesterday afternoon around 3pm. I was eating at the food court.' },
    { fromTest: true, content: 'I was there around that time actually. Let me think... I didn\'t see a phone but you should check with the SUB security office.' },
    { fromTest: false, content: 'Good idea, I\'ll check there. Thanks!' },
  ],
];

const FEEDBACK_ENTRIES = [
  { message: 'This platform is really helpful! I found my lost ID card within 2 days.', rating: 5, reviewed: true },
  { message: 'The chat feature makes it so easy to coordinate with people who found my stuff.', rating: 4, reviewed: true },
  { message: 'Would be nice to have push notifications when someone finds a matching item.', rating: 4, reviewed: false },
  { message: 'Great initiative for the campus. The games make it fun too!', rating: 5, reviewed: false },
  { message: 'I wish the search filters were more detailed. Maybe add date range filtering.', rating: 3, reviewed: false },
  { message: 'The leaderboard is a cool way to encourage people to return items.', rating: 4, reviewed: true },
  { message: 'Had trouble uploading images on mobile. Otherwise works great.', rating: 3, reviewed: false },
  { message: 'Recovered my backpack thanks to this app. 10/10 would recommend!', rating: 5, reviewed: true },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function dateStr(n: number): string {
  return daysAgo(n).toISOString().split('T')[0];
}

async function runSeed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
      User, UserBadge, Location, ItemReport, ImageAsset, Claim, Sighting,
      AuditLog, Notification, DetectiveGuess, GhostHunt, TriviaQuestion,
      TriviaAnswer, Conversation, Message, Feedback,
    ],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connected');

  const userRepo = dataSource.getRepository(User);
  const locationRepo = dataSource.getRepository(Location);
  const triviaRepo = dataSource.getRepository(TriviaQuestion);
  const itemRepo = dataSource.getRepository(ItemReport);
  const claimRepo = dataSource.getRepository(Claim);
  const sightingRepo = dataSource.getRepository(Sighting);
  const notifRepo = dataSource.getRepository(Notification);
  const badgeRepo = dataSource.getRepository(UserBadge);
  const convRepo = dataSource.getRepository(Conversation);
  const msgRepo = dataSource.getRepository(Message);
  const feedbackRepo = dataSource.getRepository(Feedback);

  // ── Admin user ──
  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@lostfound.unilorin.edu.ng' } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin123!', 12);
    await userRepo.save(userRepo.create({
      email: 'admin@lostfound.unilorin.edu.ng',
      password_hash: passwordHash,
      name: 'System Admin',
      role: UserRole.ADMIN,
      faculty: 'Central',
      is_verified: true,
    }));
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  // ── Campus locations ──
  const existingLocations = await locationRepo.count();
  if (existingLocations === 0) {
    const locations = CAMPUS_LOCATIONS.map((loc) => locationRepo.create(loc));
    await locationRepo.save(locations);
    console.log(`${locations.length} campus locations seeded`);
  } else {
    console.log('Locations already seeded');
  }

  // ── Trivia questions ──
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
      triviaRepo.create({ ...q, week_of: weekOf, type: TriviaType.STATIC }),
    );
    await triviaRepo.save(questions);
    console.log(`${questions.length} trivia questions seeded for week ${weekOf}`);
  } else {
    console.log('Trivia questions already seeded for this week');
  }

  // ── Test user (test123@gmail.com) ──
  let testUser = await userRepo.findOne({ where: { email: 'test123@gmail.com' } });
  if (!testUser) {
    const passwordHash = await bcrypt.hash('test123', 12);
    testUser = await userRepo.save(userRepo.create({
      email: 'test123@gmail.com',
      password_hash: passwordHash,
      name: 'Abdulsalam Mohammed',
      role: UserRole.USER,
      faculty: 'Faculty of Engineering',
      is_verified: true,
      detective_points: 45,
      trivia_points: 120,
      phone: '08012345678',
      bank_name: 'GTBank',
      account_number: '0123456789',
      account_name: 'Abdulsalam Mohammed',
    }));
    console.log('Test user created (test123@gmail.com / test123)');
  } else {
    console.log('Test user already exists');
  }

  // ── Seed other users ──
  let savedUsers: User[] = [];
  const forceReseed = process.argv.includes('--force');
  const existingUserCount = await userRepo.count({ where: { role: UserRole.USER } });

  if (forceReseed || existingUserCount < 10) {
    // Clear old data to re-seed cleanly
    await msgRepo.createQueryBuilder().delete().execute();
    await convRepo.createQueryBuilder().delete().execute();
    await feedbackRepo.createQueryBuilder().delete().execute();
    await notifRepo.createQueryBuilder().delete().execute();
    await sightingRepo.createQueryBuilder().delete().execute();
    await claimRepo.createQueryBuilder().delete().execute();
    await badgeRepo.createQueryBuilder().delete().execute();
    await itemRepo.createQueryBuilder().delete().execute();
    await userRepo.delete({ role: UserRole.USER });
    console.log('Cleared existing data for re-seed');

    // Re-create test user after delete
    const passwordHash = await bcrypt.hash('test123', 12);
    testUser = await userRepo.save(userRepo.create({
      email: 'test123@gmail.com',
      password_hash: passwordHash,
      name: 'Abdulsalam Mohammed',
      role: UserRole.USER,
      faculty: 'Faculty of Engineering',
      is_verified: true,
      detective_points: 45,
      trivia_points: 120,
      phone: '08012345678',
      bank_name: 'GTBank',
      account_number: '0123456789',
      account_name: 'Abdulsalam Mohammed',
    }));

    // Seed other users
    for (let i = 0; i < SEED_USERS.length; i++) {
      const u = SEED_USERS[i];
      const hash = await bcrypt.hash('123456789', 12);
      savedUsers.push(await userRepo.save(userRepo.create({
        email: `abdulsalammohammed586686+${i + 1}@gmail.com`,
        password_hash: hash,
        name: u.name,
        role: UserRole.USER,
        faculty: u.faculty,
        is_verified: true,
        detective_points: Math.floor(Math.random() * 60),
        trivia_points: Math.floor(Math.random() * 100),
      })));
    }
    console.log(`${savedUsers.length} other users seeded`);
  } else {
    savedUsers = await userRepo.find({ where: { role: UserRole.USER } });
    savedUsers = savedUsers.filter((u) => u.id !== testUser!.id);
    console.log('Users already seeded');
  }

  // Ensure we have users to work with
  if (savedUsers.length === 0) {
    savedUsers = await userRepo.find({ where: { role: UserRole.USER } });
    savedUsers = savedUsers.filter((u) => u.id !== testUser!.id);
  }

  const allLocations = await locationRepo.find();
  const locationMap = new Map(allLocations.map((l) => [l.name, l.id]));

  // ── Seed items from other users ──
  const existingItemCount = await itemRepo.count();
  if (forceReseed || existingItemCount === 0) {
    const savedItems: ItemReport[] = [];

    for (const item of SEED_ITEMS) {
      const reporter = savedUsers[item.userIndex];
      const locationId = locationMap.get(item.locationName);
      if (!reporter || !locationId) continue;

      const report = await itemRepo.save(itemRepo.create({
        title: item.title,
        description: item.description,
        category: item.category,
        type: item.type,
        reporter_id: reporter.id,
        location_id: locationId,
        date_of_event: dateStr(Math.floor(Math.random() * 30) + 1),
        image_url: item.imageUrl,
      }));
      savedItems.push(report);
    }
    console.log(`${savedItems.length} items from other users seeded`);

    // ── Test user's items ──
    const testItems: ItemReport[] = [];
    for (const item of TEST_USER_ITEMS) {
      const locationId = locationMap.get(item.locationName);
      if (!locationId) continue;

      const report = await itemRepo.save(itemRepo.create({
        title: item.title,
        description: item.description,
        category: item.category,
        type: item.type,
        reporter_id: testUser!.id,
        location_id: locationId,
        date_of_event: dateStr(Math.floor(Math.random() * 14) + 1),
        image_url: item.imageUrl,
        status: (item as any).status ?? ItemStatus.ACTIVE,
      }));
      testItems.push(report);
    }
    console.log(`${testItems.length} test user items seeded`);

    // ── Mark some items as RECOVERED ──
    const recoveredIndices = [0, 3, 7, 10]; // Samsung, calc, charger, textbook
    for (const idx of recoveredIndices) {
      if (savedItems[idx]) {
        await itemRepo.update(savedItems[idx].id, { status: ItemStatus.RECOVERED });
      }
    }
    console.log('Marked 4 items as RECOVERED');

    // ── Claims ──
    // Test user claims items found by others
    const foundByOthers = savedItems.filter((i) => i.type === ItemType.FOUND);
    if (foundByOthers.length >= 2) {
      // Approved claim
      await claimRepo.save(claimRepo.create({
        item_report_id: foundByOthers[0].id,
        claimant_id: testUser!.id,
        evidence_description: 'This is my Casio calculator. I can show the purchase receipt and it has my initials "AM" on the back cover.',
        status: ClaimStatus.APPROVED,
        reviewed_at: daysAgo(3),
      }));
      // Pending claim
      await claimRepo.save(claimRepo.create({
        item_report_id: foundByOthers[1].id,
        claimant_id: testUser!.id,
        evidence_description: 'I believe this is my course registration form. My matric number 19/0845 should be on it.',
        status: ClaimStatus.PENDING,
      }));
    }

    // Other users claim test user's found items
    const testFoundItems = testItems.filter((i) => i.type === ItemType.FOUND);
    if (testFoundItems.length > 0 && savedUsers.length > 0) {
      await claimRepo.save(claimRepo.create({
        item_report_id: testFoundItems[0].id,
        claimant_id: savedUsers[0].id,
        evidence_description: 'That is my red Nike water bottle! I left it at the stadium last week during the inter-faculty match.',
        status: ClaimStatus.PENDING,
      }));
    }

    // Other users claiming other items
    if (savedItems.length >= 5 && savedUsers.length >= 5) {
      await claimRepo.save(claimRepo.create({
        item_report_id: savedItems[4].id,
        claimant_id: savedUsers[3].id,
        evidence_description: 'This is my course registration form. My name Chinedu Okafor should be on it.',
        status: ClaimStatus.APPROVED,
        reviewed_at: daysAgo(5),
      }));
      await claimRepo.save(claimRepo.create({
        item_report_id: savedItems[7].id,
        claimant_id: savedUsers[4].id,
        evidence_description: 'Those are my keys! The keyring has a small Manchester United logo on it.',
        status: ClaimStatus.PENDING,
      }));
      await claimRepo.save(claimRepo.create({
        item_report_id: savedItems[2].id,
        claimant_id: savedUsers[1].id,
        evidence_description: 'This is my Jansport backpack. It has my engineering drawing set inside and a name tag inside the front pocket.',
        status: ClaimStatus.REJECTED,
        reviewed_at: daysAgo(2),
      }));
    }
    console.log('Claims seeded');

    // ── Sightings ──
    const sightingData = [
      { itemIdx: 0, locName: 'SUB Building', desc: 'I think I saw this phone at a table in the SUB food court around 4pm.' },
      { itemIdx: 2, locName: 'Faculty of Science', desc: 'Saw a blue backpack matching this description near the Science faculty entrance.' },
      { itemIdx: 5, locName: 'Hostel Area', desc: 'Someone was holding a gold iPhone near the hostel gate this morning.' },
      { itemIdx: 8, locName: 'Faculty of Engineering', desc: 'I saw a charger like this still plugged in at the library yesterday evening.' },
      { itemIdx: 14, locName: 'Main Library', desc: 'AirPods case spotted on a desk in the quiet study area, 3rd floor.' },
    ];

    for (const s of sightingData) {
      const item = savedItems[s.itemIdx];
      const locId = locationMap.get(s.locName);
      if (!item || !locId) continue;
      await sightingRepo.save(sightingRepo.create({
        item_report_id: item.id,
        description: s.desc,
        location_id: locId,
        spotted_at: daysAgo(Math.floor(Math.random() * 7) + 1),
      }));
    }
    console.log('Sightings seeded');

    // ── Conversations & Messages ──
    const chatPartners = [savedUsers[2], savedUsers[1], savedUsers[4]]; // Fatima, Tunde, Mariam
    const chatItems = [
      testItems[1] ?? savedItems[3], // Found items for context
      testItems[0] ?? savedItems[0],
      savedItems[5] ?? savedItems[0],
    ];

    for (let c = 0; c < CHAT_MESSAGES.length; c++) {
      const partner = chatPartners[c];
      const item = chatItems[c];
      if (!partner || !item) continue;

      const conv = await convRepo.save(convRepo.create({
        item_report_id: item.id,
        initiator_id: c === 0 ? partner.id : testUser!.id,
        recipient_id: c === 0 ? testUser!.id : partner.id,
      }));

      const messages = CHAT_MESSAGES[c];
      for (let m = 0; m < messages.length; m++) {
        const msg = messages[m];
        const senderId = msg.fromTest ? testUser!.id : partner.id;
        const createdAt = daysAgo(CHAT_MESSAGES.length - c + 1);
        createdAt.setMinutes(createdAt.getMinutes() + m * 3);

        await msgRepo.save(msgRepo.create({
          conversation_id: conv.id,
          sender_id: senderId,
          content: msg.content,
          is_read: m < messages.length - 1,
        }));
      }
    }
    console.log('Conversations and messages seeded');

    // ── Badges for test user ──
    const testBadges = [
      BadgeType.FIRST_RETURN,
      BadgeType.SERIAL_FINDER,
      BadgeType.CAMPUS_HERO,
    ];
    for (const bt of testBadges) {
      await badgeRepo.save(badgeRepo.create({
        user_id: testUser!.id,
        badge_type: bt,
      }));
    }
    // Badges for some other users
    if (savedUsers.length >= 5) {
      await badgeRepo.save(badgeRepo.create({ user_id: savedUsers[0].id, badge_type: BadgeType.FIRST_RETURN }));
      await badgeRepo.save(badgeRepo.create({ user_id: savedUsers[2].id, badge_type: BadgeType.GHOST_HUNTER }));
      await badgeRepo.save(badgeRepo.create({ user_id: savedUsers[3].id, badge_type: BadgeType.TRIVIA_CHAMP }));
    }
    console.log('Badges seeded');

    // ── Feedback ──
    const feedbackUsers = [testUser!, ...savedUsers.slice(0, 7)];
    for (let f = 0; f < FEEDBACK_ENTRIES.length; f++) {
      const entry = FEEDBACK_ENTRIES[f];
      await feedbackRepo.save(feedbackRepo.create({
        message: entry.message,
        rating: entry.rating,
        reviewed: entry.reviewed,
        user_id: feedbackUsers[f]?.id ?? null,
      }));
    }
    console.log('Feedback seeded');
  } else {
    console.log('Items already seeded, skipping all related data');
  }

  await dataSource.destroy();
  console.log('Seed complete!');
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
