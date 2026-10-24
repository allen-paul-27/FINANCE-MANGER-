import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import {
  User,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Handshake,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFinance } from '@/context/FinanceContext';
import { CategoryIcon } from '@/components/CategoryIcon';
import { IncomeModal } from '@/components/IncomeModal';
import { AllTransactionsModal } from '@/components/AllTransactionsModal';

export default function HomeScreen() {
  const router = useRouter();
  const {
    monthlyIncome,
    totalSpentThisMonth,
    balanceLeft,
    owedToYouTotal,
    owedToYouCount,
    youOweTotal,
    youOweCount,
    transactions,
    categories,
    isLoading,
  } = useFinance();

  const [incomeModalVisible, setIncomeModalVisible] = useState(false);
  const [allTxModalVisible, setAllTxModalVisible] = useState(false);

  // Group transactions by category for current month
  const categoryTotals: Record<string, number> = {};
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  
  const currentMonthExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return mKey === currentMonthKey && t.type === 'expense';
  });

  currentMonthExpenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  // Calculate percentage & sort categories
  const sortedCategories = categories
    .map(cat => ({
      ...cat,
      total: categoryTotals[cat.name] || 0,
    }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total);

  // Recent 3 transactions
  const recentTransactions = transactions.slice(0, 4);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24 && d.getDate() === now.getDate()) {
      return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffHours < 48 && d.getDate() === now.getDate() - 1) {
      return `Yesterday`;
    }
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const getCategoryDetails = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    return {
      color: cat?.color || '#8B5CF6',
      iconName: cat?.iconName || catName,
    };
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Student Budget</Text>
            <Text style={styles.headerSubtitle}>Small steps. Bigger goals.</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => setIncomeModalVisible(true)}
            activeOpacity={0.7}
          >
            <User color="#E5E7EB" size={20} />
          </TouchableOpacity>
        </View>

        {/* Main Balance Left Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Balance left this month</Text>
            <View style={styles.walletIconCircle}>
              <Wallet color="#A78BFA" size={20} />
            </View>
          </View>
          <Text style={styles.balanceAmount}>
            ₹{balanceLeft.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.balanceSubtext}>
            {balanceLeft >= 0 ? "Keep going! You're on track." : "Over budget this month!"}
          </Text>
        </View>

        {/* Received & Spent side-by-side cards */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setIncomeModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <ArrowDownLeft color="#10B981" size={20} />
            </View>
            <View style={styles.statMeta}>
              <Text style={styles.statLabel}>Received</Text>
              <Text style={styles.statAmount}>₹{monthlyIncome.toLocaleString('en-IN')}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
              <ArrowUpRight color="#F43F5E" size={20} />
            </View>
            <View style={styles.statMeta}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statAmount}>₹{totalSpentThisMonth.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Spending by category section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Spending by category</Text>
          <TouchableOpacity style={styles.seeMoreRow}>
            <Text style={styles.seeMoreText}>This month</Text>
            <ChevronRight size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryCard}>
          {sortedCategories.length === 0 ? (
            <Text style={styles.emptyCatText}>No spending logged for this month yet.</Text>
          ) : (
            sortedCategories.map(cat => {
              const maxCatSpent = Math.max(...sortedCategories.map(c => c.total), 1);
              const progressPct = Math.min((cat.total / maxCatSpent) * 100, 100);

              return (
                <View key={cat.id} style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <CategoryIcon
                      name={cat.iconName}
                      color={cat.color}
                      backgroundColor={`${cat.color}20`}
                      size={18}
                    />
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </View>

                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${progressPct}%`,
                          backgroundColor: cat.color,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.categoryAmount}>
                    ₹{cat.total.toLocaleString('en-IN')}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* Lent & Borrowed summary side-by-side cards */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.lentCard}
            onPress={() => router.push('/lent-borrowed')}
            activeOpacity={0.8}
          >
            <View style={styles.lentIconBgGreen}>
              <Handshake color="#10B981" size={20} />
            </View>
            <View style={styles.lentMeta}>
              <Text style={styles.lentLabel}>Owed to you</Text>
              <View style={styles.lentAmountRow}>
                <Text style={styles.lentAmount}>₹{owedToYouTotal.toLocaleString('en-IN')}</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
              <Text style={styles.lentSubtext}>
                {owedToYouCount} {owedToYouCount === 1 ? 'person' : 'people'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.lentCard}
            onPress={() => router.push('/lent-borrowed')}
            activeOpacity={0.8}
          >
            <View style={styles.lentIconBgPink}>
              <Handshake color="#F43F5E" size={20} />
            </View>
            <View style={styles.lentMeta}>
              <Text style={styles.lentLabel}>You owe</Text>
              <View style={styles.lentAmountRow}>
                <Text style={styles.lentAmount}>₹{youOweTotal.toLocaleString('en-IN')}</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
              <Text style={styles.lentSubtext}>
                {youOweCount} {youOweCount === 1 ? 'person' : 'people'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent activity section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <TouchableOpacity onPress={() => setAllTxModalVisible(true)}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          {recentTransactions.map(tx => {
            const { color, iconName } = getCategoryDetails(tx.category);
            const isIncome = tx.type === 'income';

            return (
              <View key={tx.id} style={styles.activityRow}>
                <View style={[styles.activityIconBg, { backgroundColor: `${color}20` }]}>
                  <CategoryIcon name={iconName} color={color} size={20} />
                </View>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityTitle}>{tx.title}</Text>
                  <Text style={styles.activityDate}>{formatDate(tx.date)}</Text>
                </View>
                <Text style={[styles.activityAmount, isIncome && styles.incomeAmountText]}>
                  {isIncome ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Modals */}
      <IncomeModal
        visible={incomeModalVisible}
        onClose={() => setIncomeModalVisible(false)}
      />
      <AllTransactionsModal
        visible={allTxModalVisible}
        onClose={() => setAllTxModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0D0C14',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E1B2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceCard: {
    backgroundColor: '#20163B',
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#C4B5FD',
    fontWeight: '500',
  },
  walletIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 8,
    letterSpacing: -0.5,
  },
  balanceSubtext: {
    fontSize: 13,
    color: '#A78BFA',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171424',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statIconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statMeta: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeMoreText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  categoryCard: {
    backgroundColor: '#171424',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyCatText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
    gap: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#27233B',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 65,
    textAlign: 'right',
  },
  lentCard: {
    flex: 1,
    backgroundColor: '#171424',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  lentIconBgGreen: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  lentIconBgPink: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  lentMeta: {},
  lentLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  lentAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  lentAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  lentSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  activityList: {
    gap: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171424',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activityIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityMeta: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activityDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  incomeAmountText: {
    color: '#10B981',
  },
});
