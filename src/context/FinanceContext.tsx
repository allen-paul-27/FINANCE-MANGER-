import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Category, LentBorrowedEntry, ChatMessage } from '../types/finance';
import {
  initializeStorageIfNeeded,
  getTransactions,
  saveTransactions,
  getCategories,
  saveCategories,
  getLentBorrowedEntries,
  saveLentBorrowedEntries,
  getMonthlyIncomes,
  setMonthlyIncome,
  getChatMessages,
  saveChatMessages,
  getCurrentMonthKey,
  clearAllAppData,
} from '../services/storage';
import { processChatQuery } from '../services/chatbotEngine';

interface FinanceContextType {
  isLoading: boolean;
  transactions: Transaction[];
  categories: Category[];
  lentBorrowed: LentBorrowedEntry[];
  monthlyIncome: number;
  currentMonthKey: string;
  chatMessages: ChatMessage[];
  // Derived state
  loggedExpensesTotal: number;
  totalSpentThisMonth: number;
  balanceLeft: number;
  owedToYouTotal: number;
  owedToYouCount: number;
  youOweTotal: number;
  youOweCount: number;
  // Actions
  addTransaction: (txData: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  editTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (catData: Omit<Category, 'id'>) => Promise<Category>;
  addLentBorrowed: (entryData: Omit<LentBorrowedEntry, 'id' | 'date' | 'status'>) => Promise<void>;
  toggleLentStatus: (id: string) => Promise<void>;
  deleteLentBorrowed: (id: string) => Promise<void>;
  updateMonthlyIncome: (amount: number) => Promise<void>;
  sendChatMessage: (text: string) => Promise<void>;
  clearChatHistory: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lentBorrowed, setLentBorrowed] = useState<LentBorrowedEntry[]>([]);
  const [monthlyIncomes, setMonthlyIncomesState] = useState<Record<string, number>>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const currentMonthKey = getCurrentMonthKey();

  useEffect(() => {
    async function loadAllData() {
      setIsLoading(true);
      await initializeStorageIfNeeded();
      const [txs, cats, lbs, incs, chats] = await Promise.all([
        getTransactions(),
        getCategories(),
        getLentBorrowedEntries(),
        getMonthlyIncomes(),
        getChatMessages(),
      ]);
      setTransactions(txs);
      setCategories(cats);
      setLentBorrowed(lbs);
      setMonthlyIncomesState(incs);
      setChatMessages(chats);
      setIsLoading(false);
    }
    loadAllData();
  }, []);

  const monthlyIncome = monthlyIncomes[currentMonthKey] ?? 0;

  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return mKey === currentMonthKey;
  });

  const loggedExpensesTotal = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Lent & Borrowed stats
  const pendingLent = lentBorrowed.filter(e => e.direction === 'lent' && e.status === 'pending');
  const owedToYouTotal = pendingLent.reduce((sum, e) => sum + e.amount, 0);
  const owedToYouCount = new Set(pendingLent.map(e => e.personName.toLowerCase())).size;

  const pendingBorrowed = lentBorrowed.filter(e => e.direction === 'borrowed' && e.status === 'pending');
  const youOweTotal = pendingBorrowed.reduce((sum, e) => sum + e.amount, 0);
  const youOweCount = new Set(pendingBorrowed.map(e => e.personName.toLowerCase())).size;

  // Key User Requirement: "value input in the owe to you be considered as an expense and once settled reflect back into your current balance."
  // Total Spent = Direct logged expenses + Pending money lent out (outflow until settled)
  const totalSpentThisMonth = loggedExpensesTotal + owedToYouTotal;

  // Available Balance = Monthly Income - Total Outflow
  const balanceLeft = monthlyIncome - totalSpentThisMonth;

  // Action methods
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'date'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toISOString(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const editTransaction = async (updatedTx: Transaction) => {
    const updated = transactions.map(t => (t.id === updatedTx.id ? updatedTx : t));
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const addCategory = async (catData: Omit<Category, 'id'>): Promise<Category> => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      isCustom: true,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    await saveCategories(updated);
    return newCat;
  };

  const addLentBorrowed = async (entryData: Omit<LentBorrowedEntry, 'id' | 'date' | 'status'>) => {
    const newEntry: LentBorrowedEntry = {
      ...entryData,
      id: `lb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'pending',
      date: new Date().toISOString(),
    };
    const updated = [newEntry, ...lentBorrowed];
    setLentBorrowed(updated);
    await saveLentBorrowedEntries(updated);
  };

  const toggleLentStatus = async (id: string) => {
    const updated = lentBorrowed.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: (e.status === 'pending' ? 'settled' : 'pending') as LentBorrowedEntry['status'],
        };
      }
      return e;
    });
    setLentBorrowed(updated);
    await saveLentBorrowedEntries(updated);
  };

  const deleteLentBorrowed = async (id: string) => {
    const updated = lentBorrowed.filter(e => e.id !== id);
    setLentBorrowed(updated);
    await saveLentBorrowedEntries(updated);
  };

  const updateMonthlyIncome = async (amount: number) => {
    const newMap = { ...monthlyIncomes, [currentMonthKey]: amount };
    setMonthlyIncomesState(newMap);
    await setMonthlyIncome(currentMonthKey, amount);
  };

  const sendChatMessage = async (text: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: nowStr,
    };

    const replyText = processChatQuery(text, {
      transactions,
      lentBorrowed,
      monthlyIncome,
    });

    const botMsg: ChatMessage = {
      id: `chat-${Date.now()}-bot`,
      sender: 'bot',
      text: replyText,
      timestamp: nowStr,
    };

    const updated = [...chatMessages, userMsg, botMsg];
    setChatMessages(updated);
    await saveChatMessages(updated);
  };

  const clearChatHistory = async () => {
    setChatMessages([]);
    await saveChatMessages([]);
  };

  const resetAllData = async () => {
    await clearAllAppData();
    const [txs, cats, lbs, incs, chats] = await Promise.all([
      getTransactions(),
      getCategories(),
      getLentBorrowedEntries(),
      getMonthlyIncomes(),
      getChatMessages(),
    ]);
    setTransactions(txs);
    setCategories(cats);
    setLentBorrowed(lbs);
    setMonthlyIncomesState(incs);
    setChatMessages(chats);
  };

  return (
    <FinanceContext.Provider
      value={{
        isLoading,
        transactions,
        categories,
        lentBorrowed,
        monthlyIncome,
        currentMonthKey,
        chatMessages,
        loggedExpensesTotal,
        totalSpentThisMonth,
        balanceLeft,
        owedToYouTotal,
        owedToYouCount,
        youOweTotal,
        youOweCount,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addCategory,
        addLentBorrowed,
        toggleLentStatus,
        deleteLentBorrowed,
        updateMonthlyIncome,
        sendChatMessage,
        clearChatHistory,
        resetAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
