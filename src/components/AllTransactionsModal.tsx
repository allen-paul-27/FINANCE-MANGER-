import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { X, Trash2, Edit3, ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';
import { CategoryIcon } from './CategoryIcon';
import { Transaction } from '../types/finance';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const AllTransactionsModal: React.FC<Props> = ({ visible, onClose }) => {
  const { transactions, categories, deleteTransaction } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All');

  const filteredTransactions = transactions.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesMode = selectedPaymentMethod === 'All' || t.paymentMethod === selectedPaymentMethod;
    return matchesCategory && matchesMode;
  });

  const handleDelete = (id: string, title: string) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(`Delete "${title}"?`)) {
        deleteTransaction(id);
      }
    } else {
      Alert.alert('Delete Transaction', `Are you sure you want to delete "${title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
      ]);
    }
  };

  const getCategoryColor = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    return cat?.color || '#8B5CF6';
  };

  const getCategoryIconName = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    return cat?.iconName || catName;
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24 && d.getDate() === now.getDate()) {
      return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffHours < 48 && d.getDate() === now.getDate() - 1) {
      return `Yesterday`;
    }
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>All Transactions</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>

        {/* Category Filter Pills */}
        <Text style={styles.filterLabel}>Filter by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, selectedCategory === 'All' && styles.filterPillActive]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text style={[styles.filterPillText, selectedCategory === 'All' && styles.filterPillTextActive]}>
              All Categories
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterPill, selectedCategory === cat.name && styles.filterPillActive]}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <CategoryIcon name={cat.iconName} color={selectedCategory === cat.name ? '#A78BFA' : '#9CA3AF'} size={14} />
              <Text style={[styles.filterPillText, selectedCategory === cat.name && styles.filterPillTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Payment Method Filter Pills */}
        <Text style={styles.filterLabel}>Filter by Payment Mode</Text>
        <View style={styles.paymentFilterRow}>
          {['All', 'UPI', 'Cash', 'Misc'].map(mode => (
            <TouchableOpacity
              key={mode}
              style={[styles.modePill, selectedPaymentMethod === mode && styles.modePillActive]}
              onPress={() => setSelectedPaymentMethod(mode)}
            >
              <Text style={[styles.modePillText, selectedPaymentMethod === mode && styles.modePillTextActive]}>
                {mode === 'All' ? 'All Modes' : mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Search color="#6B7280" size={40} />
              <Text style={styles.emptyText}>No transactions match the selected filters.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const catColor = getCategoryColor(item.category);
            const iconName = getCategoryIconName(item.category);
            const isIncome = item.type === 'income';

            return (
              <View style={styles.txCard}>
                <View style={styles.txLeft}>
                  <View style={[styles.iconBg, { backgroundColor: `${catColor}20` }]}>
                    <CategoryIcon name={iconName} color={catColor} size={22} />
                  </View>
                  <View style={styles.txMeta}>
                    <Text style={styles.txTitle}>{item.title}</Text>
                    <View style={styles.subMetaRow}>
                      <Text style={styles.txDate}>{formatDate(item.date)}</Text>
                      <View style={styles.dot} />
                      <Text style={styles.txTag}>{item.category}</Text>
                      <View style={styles.dot} />
                      <Text style={styles.txTagMode}>{item.paymentMethod}</Text>
                    </View>
                    {item.note ? <Text style={styles.txNote}>"{item.note}"</Text> : null}
                  </View>
                </View>

                <View style={styles.txRight}>
                  <Text style={[styles.txAmount, isIncome ? styles.incomeAmount : styles.expenseAmount]}>
                    {isIncome ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.title)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={16} color="#F43F5E" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0C14',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 6,
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1B2E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActive: {
    backgroundColor: '#2E1E54',
    borderColor: '#8B5CF6',
  },
  filterPillText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  filterPillTextActive: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  paymentFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  modePill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1E1B2E',
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modePillActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  modePillText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 12,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#171424',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txMeta: {
    flex: 1,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  txDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#6B7280',
    marginHorizontal: 6,
  },
  txTag: {
    fontSize: 12,
    color: '#A78BFA',
  },
  txTagMode: {
    fontSize: 11,
    color: '#60A5FA',
    fontWeight: '500',
  },
  txNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 44,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  expenseAmount: {
    color: '#FFFFFF',
  },
  incomeAmount: {
    color: '#10B981',
  },
  deleteBtn: {
    padding: 4,
  },
});
