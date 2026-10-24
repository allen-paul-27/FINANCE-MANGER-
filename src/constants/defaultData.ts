import { Category, Transaction, LentBorrowedEntry } from '../types/finance';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Food', iconName: 'Utensils', color: '#A78BFA' },
  { id: 'cat-2', name: 'Textbooks', iconName: 'BookOpen', color: '#60A5FA' },
  { id: 'cat-3', name: 'Travel', iconName: 'Bus', color: '#34D399' },
  { id: 'cat-4', name: 'Misc', iconName: 'MoreHorizontal', color: '#F59E0B' },
  { id: 'cat-5', name: 'Shopping', iconName: 'ShoppingBag', color: '#EC4899' },
  { id: 'cat-6', name: 'Entertainment', iconName: 'Film', color: '#8B5CF6' },
];

export const INITIAL_MONTHLY_INCOME = 0;

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_LENT_BORROWED: LentBorrowedEntry[] = [];
