import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Smartphone, Wallet, MoreHorizontal, Edit3, Plus, Check } from 'lucide-react-native';
import { useFinance } from '@/context/FinanceContext';
import { CategoryIcon } from '@/components/CategoryIcon';
import { AddCategoryModal } from '@/components/AddCategoryModal';
import { PaymentMethod } from '@/types/finance';

export default function AddTransactionScreen() {
  const router = useRouter();
  const { categories, addTransaction } = useFinance();

  const [amountStr, setAmountStr] = useState('350');
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    const txTitle = title.trim() || `${selectedCategory} Expense`;

    await addTransaction({
      title: txTitle,
      amount: numAmount,
      type: 'expense',
      category: selectedCategory,
      paymentMethod,
      note: note.trim() || undefined,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setAmountStr('');
      setTitle('');
      setNote('');
      setError('');
      router.push('/');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <Text style={styles.headerSubtitle}>Log your expenses, one step closer to your goals.</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Amount Box */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amountStr}
                onChangeText={(t) => {
                  setAmountStr(t);
                  setError('');
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#4B5563"
              />
            </View>
          </View>

          {/* Category Picker */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category</Text>
            <TouchableOpacity onPress={() => setShowAddCatModal(true)}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPill,
                    isSelected && { backgroundColor: '#2E1E54', borderColor: '#8B5CF6' },
                  ]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <CategoryIcon
                    name={cat.iconName}
                    color={isSelected ? cat.color : '#9CA3AF'}
                    size={16}
                  />
                  <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextSelected]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* + New Category Pill */}
            <TouchableOpacity
              style={styles.newCategoryPill}
              onPress={() => setShowAddCatModal(true)}
            >
              <Plus size={16} color="#A78BFA" />
              <Text style={styles.newCategoryText}>New</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Payment Method Selector */}
          <Text style={styles.sectionTitleMargin}>Payment method</Text>
          <View style={styles.paymentContainer}>
            <TouchableOpacity
              style={[styles.paymentPill, paymentMethod === 'UPI' && styles.paymentPillActive]}
              onPress={() => setPaymentMethod('UPI')}
            >
              <Smartphone size={18} color={paymentMethod === 'UPI' ? '#FFFFFF' : '#9CA3AF'} />
              <Text style={[styles.paymentText, paymentMethod === 'UPI' && styles.paymentTextActive]}>
                UPI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentPill, paymentMethod === 'Cash' && styles.paymentPillActive]}
              onPress={() => setPaymentMethod('Cash')}
            >
              <Wallet size={18} color={paymentMethod === 'Cash' ? '#FFFFFF' : '#9CA3AF'} />
              <Text style={[styles.paymentText, paymentMethod === 'Cash' && styles.paymentTextActive]}>
                Cash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentPill, paymentMethod === 'Misc' && styles.paymentPillActive]}
              onPress={() => setPaymentMethod('Misc')}
            >
              <MoreHorizontal size={18} color={paymentMethod === 'Misc' ? '#FFFFFF' : '#9CA3AF'} />
              <Text style={[styles.paymentText, paymentMethod === 'Misc' && styles.paymentTextActive]}>
                Misc
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <Text style={styles.sectionTitleMargin}>Title / Name (optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={`e.g. CCD Coffee, Bus Ticket`}
              placeholderTextColor="#6B7280"
            />
          </View>

          {/* Note Input */}
          <Text style={styles.sectionTitleMargin}>Note (optional)</Text>
          <View style={styles.inputContainer}>
            <Edit3 size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note"
              placeholderTextColor="#6B7280"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.saveButtonSuccess]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            {isSaved ? (
              <View style={styles.savedRow}>
                <Check size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Saved!</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save expense</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Add Custom Category Modal */}
      <AddCategoryModal
        visible={showAddCatModal}
        onClose={() => setShowAddCatModal(false)}
        onCategoryCreated={(newCatName) => setSelectedCategory(newCatName)}
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
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 20,
  },
  errorText: {
    color: '#F43F5E',
    fontSize: 14,
    marginBottom: 12,
  },
  amountContainer: {
    backgroundColor: '#171424',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  amountLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 38,
    fontWeight: '800',
    color: '#8B5CF6',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 38,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitleMargin: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#171424',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  categoryPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  newCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1F1A33',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  newCategoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  paymentContainer: {
    flexDirection: 'row',
    backgroundColor: '#171424',
    borderRadius: 20,
    padding: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  paymentPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  paymentPillActive: {
    backgroundColor: '#8B5CF6',
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  paymentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171424',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonSuccess: {
    backgroundColor: '#10B981',
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
