import {
  ItemType,
  ItemCategory,
  ItemStatus,
  ClaimStatus,
  BadgeType,
  TriviaType,
  UserRole,
} from './enums';

// ── Auth DTOs ──

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  faculty: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ── Item Report DTOs ──

export interface CreateItemReportDto {
  type: ItemType;
  category: ItemCategory;
  title: string;
  description: string;
  location_id: string;
  date_of_event: string;
  serial_number?: string;
}

// ── Claim DTOs ──

export interface CreateClaimDto {
  item_report_id: string;
  evidence_description: string;
}

// ── Sighting DTOs ──

export interface CreateSightingDto {
  item_report_id: string;
  description: string;
  location_id?: string;
  spotted_at: string;
}

// ── Gamification DTOs ──

export interface DetectiveGuessDto {
  guessed_ranking: string[];
}

export interface GhostHuntClaimDto {
  secret_code: string;
}

export interface TriviaAnswerDto {
  question_id: string;
  answer: string;
}

// ── Response Types ──

export interface ItemReportResponse {
  id: string;
  type: ItemType;
  category: ItemCategory;
  title: string;
  description: string;
  location_id: string;
  date_of_event: string;
  serial_number?: string;
  status: ItemStatus;
  reported_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClaimResponse {
  id: string;
  item_report_id: string;
  claimant_id: string;
  evidence_description: string;
  status: ClaimStatus;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SightingResponse {
  id: string;
  item_report_id: string;
  reporter_id: string;
  description: string;
  location_id?: string;
  spotted_at: string;
  created_at: string;
}

export interface StatsResponse {
  total_items: number;
  total_lost: number;
  total_found: number;
  total_recovered: number;
  total_claims: number;
  recovery_rate: number;
}

export interface HeatmapEntry {
  location_id: string;
  location_name: string;
  count: number;
  latitude: number;
  longitude: number;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  points: number;
  rank: number;
  badges: BadgeType[];
}

export interface TriviaQuestionResponse {
  id: string;
  question: string;
  options: string[];
  type: TriviaType;
  points: number;
}

export interface BadgeResponse {
  type: BadgeType;
  name: string;
  description: string;
  earned_at: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  faculty: string;
  role: UserRole;
  points: number;
  badges: BadgeResponse[];
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserProfileResponse;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
