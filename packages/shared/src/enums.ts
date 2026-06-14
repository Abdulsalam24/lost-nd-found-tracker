export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum ItemType {
  LOST = 'LOST',
  FOUND = 'FOUND',
}

export enum ItemCategory {
  ELECTRONICS = 'ELECTRONICS',
  ID_CARDS = 'ID_CARDS',
  CLOTHING = 'CLOTHING',
  BOOKS = 'BOOKS',
  STATIONERY = 'STATIONERY',
  BAGS = 'BAGS',
  KEYS = 'KEYS',
  COURSE_FORM = 'COURSE_FORM',
  OTHER = 'OTHER',
}

export enum ItemStatus {
  ACTIVE = 'ACTIVE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RECOVERED = 'RECOVERED',
  DISPOSED = 'DISPOSED',
}

export enum ClaimStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum NotifChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum BadgeType {
  FIRST_RETURN = 'FIRST_RETURN',
  GHOST_HUNTER = 'GHOST_HUNTER',
  TRIVIA_CHAMP = 'TRIVIA_CHAMP',
  SERIAL_FINDER = 'SERIAL_FINDER',
  CAMPUS_HERO = 'CAMPUS_HERO',
}

export enum TriviaType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}
