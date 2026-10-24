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
  Alert,
} from 'react-native';
import { Handshake, Plus, Check, RotateCcw, Trash2 } from 'lucide-react-native';
import { useFinance } from '@/context/FinanceContext';
import { AddLentModal } from '@/components/AddLentModal';
import { PendingStatus } from '@/types/finance';

export default function LentBorrowedScreen() {
  const {
    lentBorrowed,
    owedToYouTotal,
    youOweTotal,
    toggleLentStatus,
    deleteLentBorrowed,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<PendingStatus>('pending');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredEntries = lentBorrowed.filter(e => e.status === activeTab);

  const handleDelete = (id: string, name: string) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(`Delete record for "${name}"?`)) {
        deleteLentBorrowed(id);
      }
    } else {
      Alert.alert('Delete Record', `Are you sure you want to delete the record for ${name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteLentBorrowed(id) },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.headerTitle}>Lent & Borrowed</Text>
        <Text style={styles.headerSubtitle}>Keep track of money with friends.</Text>

        {/* Summary Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.lentIconBgGreen}>
              <Handshake color="#10B981" size={20} />
            </View>
            <View>
              <Text style={styles.statLabel}>Owed to you</Text>
              <Text style={styles.statAmount}>₹{owedToYouTotal.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.lentIconBgPink}>
              <Handshake color="#F43F5E" size={20} />
            </View>
            <View>
              <Text style={styles.statLabel}>You owe</Text>
              <Text style={styles.statAmount}>₹{youOweTotal.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Segmented Control Pills */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === 'pending' && styles.segmentTabActive]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.segmentText, activeTab === 'pending' && styles.segmentTextActive]}>
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentTab, activeTab === 'settled' && styles.segmentTabActive]}
            onPress={() => setActiveTab('settled')}
          >
            <Text style={[styles.segmentText, activeTab === 'settled' && styles.segmentTextActive]}>
              Settled
            </Text>
          </TouchableOpacity>
        </View>

        {/* Entry List Card Container */}
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          <View style={styles.listCardWrapper}>
            {filteredEntries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {activeTab === 'pending'
                    ? 'No pending lent or borrowed records.'
                    : 'No settled records yet.'}
                </Text>
              </View>
            ) : (
              filteredEntries.map((entry, idx) => {
                const isLent = entry.direction === 'lent';
                const initial = entry.personName.charAt(0).toUpperCase();

                return (
                  <View
                    key={entry.id}
                    style={[
                      styles.entryRow,
                      idx < filteredEntries.length - 1 && styles.entryRowBorder,
                    ]}
                  >
                    <View style={styles.entryLeft}>
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{initial}</Text>
                      </View>
                      <View style={styles.entryMeta}>
                        <Text style={styles.personName}>{entry.personName}</Text>
                        <Text style={styles.directionText}>
                          {isLent ? 'Lent' : 'Borrowed'} ₹{entry.amount.toLocaleString('en-IN')}
                        </Text>
                        {entry.note ? <Text style={styles.entryNote}>{entry.note}</Text> : null}
                      </View>
                    </View>

                    <View style={styles.entryActions}>
                      {activeTab === 'pending' ? (
                        <>
                          <View style={styles.pendingBadge}>
                            <Text style={styles.pendingBadgeText}>Pending</Text>
                          </View>

                          <TouchableOpacity
                            style={styles.settleBtn}
                            onPress={() => toggleLentStatus(entry.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.settleBtnText}>Settle</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <View style={styles.settledBadge}>
                            <Check size={12} color="#10B981" />
                            <Text style={styles.settledBadgeText}>Settled</Text>
                          </View>

                          <TouchableOpacity
                            style={styles.unsettleBtn}
                            onPress={() => toggleLentStatus(entry.id)}
                          >
                            <RotateCcw size={14} color="#9CA3AF" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDelete(entry.id, entry.personName)}
                          >
                            <Trash2 size={14} color="#F43F5E" />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button (+) */}
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Plus color="#FFFFFF" size={28} />
        </TouchableOpacity>
      </View>

      {/* Add Lent/Borrowed Modal */}
      <AddLentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
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
  lentIconBgGreen: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lentIconBgPink: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#171424',
    borderRadius: 20,
    padding: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  segmentTabActive: {
    backgroundColor: '#8B5CF6',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 110,
  },
  listCardWrapper: {
    backgroundColor: '#171424',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  entryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2E294E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C4B5FD',
  },
  entryMeta: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  directionText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  entryNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pendingBadgeText: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
  },
  settleBtn: {
    borderColor: '#8B5CF6',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  settleBtnText: {
    fontSize: 13,
    color: '#A78BFA',
    fontWeight: '600',
  },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  settledBadgeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  unsettleBtn: {
    padding: 6,
    backgroundColor: '#27233B',
    borderRadius: 10,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderRadius: 10,
  },
  fabButton: {
    position: 'absolute',
    bottom: 95,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
});
