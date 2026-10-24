export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'UPI' | 'Cash' | 'Misc';

export type LentDirection = 'lent' | 'borrowed'; // lent = owed to you, borrowed = you owe

export type PendingStatus = 'pending' | 'settled';

export interface Category {
  id: string;
  name: string;
  iconName: string; // lucide icon name
  color: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number; // in INR
  type: TransactionType;
  category: string; // category name
  paymentMethod: PaymentMethod;
  date: string; // ISO string
  note?: string;
}

export interface LentBorrowedEntry {
  id: string;
  personName: string;
  amount: number; // in INR
  direction: LentDirection;
  status: PendingStatus;
  date: string; // ISO string
  note?: string;
}

export interface MonthlyIncome {
  monthKey: string; // format YYYY-MM e.g. "2026-09"
  amount: number; // in INR
  source?: string;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  queryDetails?: {
    type?: string;
    category?: string;
    amount?: number;
    count?: number;
  };
}
