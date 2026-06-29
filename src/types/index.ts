export type UserRole = 'player' | 'admin';

export type GameType = 'freefire' | 'bgmi' | 'pubg' | 'cod' | 'valorant' | 'other';
export type GameMode = 'solo' | 'duo' | 'squad' | 'custom';
export type Platform = 'mobile' | 'pc' | 'console' | 'cross-platform';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  game_type: GameType;
  game_mode: GameMode;
  platform: Platform;
  prize_pool: number;
  team_size: number;
  date: string;
  time: string;
  location: string;
  price: number;
  max_slots: number;
  filled_slots: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image_url?: string;
  created_by: string;
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  slot_number: number | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  bkash_transaction_id?: string | null;
  bkash_submitted_at?: string | null;
  payment_id?: string;
  created_at: string;
  event?: GameEvent;
  profile?: Profile;
}

export interface Payment {
  id: string;
  registration_id: string;
  amount: number;
  bkash_payment_id?: string;
  bkash_transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
}

export interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  upcomingEvents: number;
}
