import { Transaction, LentBorrowedEntry } from '../types/finance';

interface StorageData {
  transactions: Transaction[];
  lentBorrowed: LentBorrowedEntry[];
  monthlyIncome: number;
}

export function processChatQuery(queryText: string, data: StorageData): string {
  const query = queryText.toLowerCase().trim();
  const { transactions, lentBorrowed, monthlyIncome } = data;

  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const thisMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return mKey === currentMonthKey;
  });

  const loggedExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingLentTotal = lentBorrowed
    .filter(e => e.direction === 'lent' && e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalSpentThisMonth = loggedExpenses + pendingLentTotal;
  const balanceLeft = monthlyIncome - totalSpentThisMonth;

  // 1. "Who owes me money?" / Lent query
  if (
    query.includes('who owes me') ||
    query.includes('owed to me') ||
    query.includes('pending lent') ||
    (query.includes('who') && query.includes('owes') && !query.includes('do i owe'))
  ) {
    const pendingLent = lentBorrowed.filter(e => e.direction === 'lent' && e.status === 'pending');
    if (pendingLent.length === 0) {
      return 'No one currently owes you money! All lent entries are settled.';
    }
    const totalOwed = pendingLent.reduce((sum, e) => sum + e.amount, 0);
    const details = pendingLent.map(e => `${e.personName} owes you ₹${e.amount.toLocaleString('en-IN')}`).join(' and ');
    return `${details} — total ₹${totalOwed.toLocaleString('en-IN')} pending. Note: Pending lent money is counted as an active expense until settled.`;
  }

  // 2. "Who do I owe money to?" / Borrowed query
  if (
    query.includes('who do i owe') ||
    query.includes('who i owe') ||
    query.includes('my debts') ||
    query.includes('borrowed money') ||
    query.includes('you owe')
  ) {
    const pendingBorrowed = lentBorrowed.filter(e => e.direction === 'borrowed' && e.status === 'pending');
    if (pendingBorrowed.length === 0) {
      return 'You don’t owe anyone money! All borrowed entries are settled.';
    }
    const totalBorrowed = pendingBorrowed.reduce((sum, e) => sum + e.amount, 0);
    const details = pendingBorrowed.map(e => `you owe ${e.personName} ₹${e.amount.toLocaleString('en-IN')}`).join(' and ');
    return `Currently, ${details} — total ₹${totalBorrowed.toLocaleString('en-IN')} pending to be paid back.`;
  }

  // 3. Category specific queries: "how much did I spend on [food / textbooks / travel / misc / etc.]"
  const categoriesInUse = Array.from(new Set(transactions.map(t => t.category.toLowerCase())));
  const matchedCategory = categoriesInUse.find(cat => query.includes(cat));

  if (
    matchedCategory ||
    query.includes('food') ||
    query.includes('textbooks') ||
    query.includes('book') ||
    query.includes('travel') ||
    query.includes('misc')
  ) {
    let catTarget = matchedCategory;
    if (!catTarget) {
      if (query.includes('food')) catTarget = 'food';
      else if (query.includes('textbook') || query.includes('book')) catTarget = 'textbooks';
      else if (query.includes('travel') || query.includes('bus') || query.includes('metro')) catTarget = 'travel';
      else if (query.includes('misc')) catTarget = 'misc';
    }

    if (catTarget) {
      const catTx = thisMonthTransactions.filter(
        t => t.type === 'expense' && t.category.toLowerCase() === catTarget
      );
      const catTotal = catTx.reduce((sum, t) => sum + t.amount, 0);
      const displayName = catTarget.charAt(0).toUpperCase() + catTarget.slice(1);
      
      if (catTx.length === 0) {
        return `You haven't logged any expenses for ${displayName} this month yet.`;
      }
      return `You spent ₹${catTotal.toLocaleString('en-IN')} on ${displayName} this month, across ${catTx.length} ${catTx.length === 1 ? 'entry' : 'entries'}.`;
    }
  }

  // 4. "Spending this week?" / Last 7 days query
  if (query.includes('week') || query.includes('last 7 days')) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekTx = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= sevenDaysAgo);
    const weekTotal = weekTx.reduce((sum, t) => sum + t.amount, 0);
    return `In the last 7 days, you logged ₹${weekTotal.toLocaleString('en-IN')} across ${weekTx.length} expense transactions.`;
  }

  // 5. "Biggest category?" / "Top category" / "Where did I spend the most?"
  if (
    query.includes('biggest category') ||
    query.includes('top category') ||
    query.includes('most spent') ||
    query.includes('highest spending') ||
    query.includes('where did i spend')
  ) {
    const categoryTotals: Record<string, number> = {};
    thisMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCats.length === 0) {
      return 'You have no expenses recorded for this month yet.';
    }

    const [topCat, topAmount] = sortedCats[0];
    const secondCatStr = sortedCats.length > 1 ? `, followed by ${sortedCats[1][0]} at ₹${sortedCats[1][1].toLocaleString('en-IN')}.` : '.';
    return `Your biggest expense category this month is ${topCat} at ₹${topAmount.toLocaleString('en-IN')}${secondCatStr}`;
  }

  // 6. Payment method query: "UPI" or "Cash"
  if (query.includes('upi') || query.includes('cash') || query.includes('payment method')) {
    const isUPI = query.includes('upi');
    const isCash = query.includes('cash');
    const targetMode = isUPI ? 'UPI' : isCash ? 'Cash' : 'Misc';
    
    const modeTx = thisMonthTransactions.filter(t => t.type === 'expense' && t.paymentMethod === targetMode);
    const modeTotal = modeTx.reduce((sum, t) => sum + t.amount, 0);
    return `You spent ₹${modeTotal.toLocaleString('en-IN')} via ${targetMode} across ${modeTx.length} transactions this month.`;
  }

  // 7. "Remaining balance" / "How much money do I have left?" / "Received"
  if (
    query.includes('balance') ||
    query.includes('left') ||
    query.includes('income') ||
    query.includes('received') ||
    query.includes('savings')
  ) {
    const lentNote = pendingLentTotal > 0 ? ` (includes ₹${pendingLentTotal.toLocaleString('en-IN')} pending lent money)` : '';
    return `Your total income for this month is ₹${monthlyIncome.toLocaleString('en-IN')}. Total spent/outflow is ₹${totalSpentThisMonth.toLocaleString('en-IN')}${lentNote}, leaving you with a balance of ₹${balanceLeft.toLocaleString('en-IN')}.`;
  }

  // 8. General monthly total: "How much did I spend this month?"
  if (query.includes('how much') && (query.includes('spend') || query.includes('total'))) {
    const lentNote = pendingLentTotal > 0 ? ` (₹${loggedExpenses.toLocaleString('en-IN')} logged expenses + ₹${pendingLentTotal.toLocaleString('en-IN')} pending lent money)` : '';
    return `Your total outflow this month is ₹${totalSpentThisMonth.toLocaleString('en-IN')}${lentNote}. Your remaining balance is ₹${balanceLeft.toLocaleString('en-IN')}.`;
  }

  // 9. Off-topic check
  if (
    query.includes('weather') ||
    query.includes('capital') ||
    query.includes('recipe') ||
    query.includes('python') ||
    query.includes('joke') ||
    query.includes('movie') ||
    query.includes('who is') ||
    query.includes('what is the')
  ) {
    return `I am an on-device personal finance assistant for your student budget. I can only answer questions based on your logged transactions, categories, and lent/borrowed money. Try asking "Who owes me money?" or "How much did I spend on Food this month?"`;
  }

  // Generic fallback
  return `Based on your data: Income = ₹${monthlyIncome.toLocaleString('en-IN')}, Spent/Outflow = ₹${totalSpentThisMonth.toLocaleString('en-IN')}, Remaining Balance = ₹${balanceLeft.toLocaleString('en-IN')}. Settling lent money adds it directly back to your balance!`;
}
