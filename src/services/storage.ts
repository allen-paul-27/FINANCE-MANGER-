import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Category, LentBorrowedEntry, ChatMessage } from '../types/finance';
import { DEFAULT_CATEGORIES, INITIAL_TRANSACTIONS, INITIAL_LENT_BORROWED, INITIAL_MONTHLY_INCOME } from '../constants/defaultData';

const STORAGE_KEYS = {
  TRANSACTIONS: '@student_budget_transactions_v2',
  CATEGORIES: '@student_budget_categories_v2',
  LENT_BORROWED: '@student_budget_lent_borrowed_v2',
  MONTHLY_INCOMES: '@student_budget_monthly_incomes_v2',
  CHAT_MESSAGES: '@student_budget_chat_messages_v2',
  HAS_INITIALIZED: '@student_budget_has_init_v2',
};

export const getCurrentMonthKey = (): string => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${month}`;
};

export async function initializeStorageIfNeeded(): Promise<void> {
  try {
    const hasInit = await AsyncStorage.getItem(STORAGE_KEYS.HAS_INITIALIZED);
    if (!hasInit) {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      await AsyncStorage.setItem(STORAGE_KEYS.LENT_BORROWED, JSON.stringify(INITIAL_LENT_BORROWED));
      
      const currentMonth = getCurrentMonthKey();
      const initialIncomes: Record<string, number> = {
        [currentMonth]: INITIAL_MONTHLY_INCOME,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.MONTHLY_INCOMES, JSON.stringify(initialIncomes));

      const welcomeChat: ChatMessage[] = [
        {
          id: 'chat-welcome-1',
          sender: 'bot',
          text: 'Welcome to your Student Budget assistant! Log your income, expenses, or lent money to get started. Ask me anything about your balance, spending by category, or pending money.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(welcomeChat));

      await AsyncStorage.setItem(STORAGE_KEYS.HAS_INITIALIZED, 'true');
    }
  } catch (e) {
    console.error('Storage initialization failed:', e);
  }
}

export async function clearAllAppData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.CATEGORIES,
      STORAGE_KEYS.LENT_BORROWED,
      STORAGE_KEYS.MONTHLY_INCOMES,
      STORAGE_KEYS.CHAT_MESSAGES,
      STORAGE_KEYS.HAS_INITIALIZED,
    ]);
    await initializeStorageIfNeeded();
  } catch (e) {
    console.error('Failed to clear app data:', e);
  }
}

// Transactions
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return json ? JSON.parse(json) : INITIAL_TRANSACTIONS;
  } catch (e) {
    return INITIAL_TRANSACTIONS;
  }
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

// Categories
export async function getCategories(): Promise<Category[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return json ? JSON.parse(json) : DEFAULT_CATEGORIES;
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

// Lent / Borrowed
export async function getLentBorrowedEntries(): Promise<LentBorrowedEntry[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.LENT_BORROWED);
    return json ? JSON.parse(json) : INITIAL_LENT_BORROWED;
  } catch (e) {
    return INITIAL_LENT_BORROWED;
  }
}

export async function saveLentBorrowedEntries(entries: LentBorrowedEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.LENT_BORROWED, JSON.stringify(entries));
}

// Monthly Incomes
export async function getMonthlyIncomes(): Promise<Record<string, number>> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.MONTHLY_INCOMES);
    const currentMonth = getCurrentMonthKey();
    const map = json ? JSON.parse(json) : {};
    if (map[currentMonth] === undefined) {
      map[currentMonth] = INITIAL_MONTHLY_INCOME;
    }
    return map;
  } catch (e) {
    return { [getCurrentMonthKey()]: INITIAL_MONTHLY_INCOME };
  }
}

export async function setMonthlyIncome(monthKey: string, amount: number): Promise<void> {
  const map = await getMonthlyIncomes();
  map[monthKey] = amount;
  await AsyncStorage.setItem(STORAGE_KEYS.MONTHLY_INCOMES, JSON.stringify(map));
}

// Chat Messages
export async function getChatMessages(): Promise<ChatMessage[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
}

export async function saveChatMessages(messages: ChatMessage[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
}
