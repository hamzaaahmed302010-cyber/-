export type ThemeId = 'pink-purple' | 'rose-red' | 'mint-emerald' | 'peach-amber';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  badgeBg: string;
  accentBg: string;
  gradient: string;
  cardBorder: string;
  activeTab: string;
}

export type PantryCategory = 'food' | 'fridge' | 'cleaning' | 'personal' | 'spices';

export interface PantryItem {
  id: string;
  name: string;
  category: PantryCategory;
  quantity: number;
  unit: string;
  minThreshold: number;
  status: 'available' | 'low' | 'out';
  notes?: string;
  lastUpdated: string;
  lastPurchasedAt?: string;
  defaultRestockQty?: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: PantryCategory;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  isBought: boolean;
  addedAt: string;
  boughtAt?: string;
  pantryItemId?: string;
}

export type ExpenseCategory = 'pantry' | 'bills' | 'kids' | 'home' | 'personal' | 'health' | 'other';

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  time: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
}

export interface BudgetConfig {
  totalIncome: number;
  savingsTarget: number;
  savingsPercent: number;
  categoryAllocations: Record<ExpenseCategory, number>;
  expenses: ExpenseRecord[];
}

export interface KidTask {
  id: string;
  title: string;
  completed: boolean;
  points: number;
  time?: string;
}

export interface KidProfile {
  id: string;
  name: string;
  avatarColor: string;
  gender: 'boy' | 'girl';
  stars: number;
  tasks: KidTask[];
  notes: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  timeRange: string;
  type: 'routine' | 'care' | 'work' | 'rest';
  completed: boolean;
  notes?: string;
}

export interface MomSchedule {
  blocks: TimeBlock[];
  pomodoroMinutes: number;
  pomodoroState: 'idle' | 'running' | 'paused';
  selfCareNotes: string;
}

export interface PrayersState {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface SunnahPrayersState {
  fajrSunnah: boolean;
  duha: boolean;
  dhuhrSunnah: boolean;
  maghribSunnah: boolean;
  ishaSunnah: boolean;
  witr: boolean;
  qiyam: boolean;
}

export interface DailyPrayers {
  date: string;
  prayers: PrayersState;
  sunnah: SunnahPrayersState;
  dhikrMorning: boolean;
  dhikrEvening: boolean;
  quranReading: boolean;
}

export interface HabitItem {
  id: string;
  title: string;
  category: string;
  icon: string;
  history: Record<string, boolean>; // 'YYYY-MM-DD' -> completed
}

export type MoodType = 'joyful' | 'calm' | 'tired' | 'anxious' | 'proud' | 'grateful';

export interface DiaryEntry {
  id: string;
  date: string;
  time: string;
  mood: MoodType;
  title: string;
  content: string;
  gratitude: string[];
  achievement: string;
}

export interface AppData {
  version: string;
  lastBackupDate: string | null;
  theme: ThemeId;
  pantry: PantryItem[];
  shoppingList: ShoppingItem[];
  budget: BudgetConfig;
  kids: KidProfile[];
  momSchedule: MomSchedule;
  prayerHistory: Record<string, DailyPrayers>; // YYYY-MM-DD
  habits: HabitItem[];
  diary: DiaryEntry[];
}
