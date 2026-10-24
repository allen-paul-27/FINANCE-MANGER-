import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { X, Handshake, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';
import { LentDirection } from '../types/finance';

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultDirection?: LentDirection;
}

export const AddLentModal: React.FC<Props> = ({ visible, onClose, defaultDirection = 'lent' }) => {
  const { addLentBorrowed } = useFinance();
  const [personName, setPersonName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [direction, setDirection] = useState<LentDirection>(defaultDirection);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!personName.trim()) {
      setError('Please enter the person’s name.');
      return;
    }
    const num = parseFloat(amountStr);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    await addLentBorrowed({
      personName: personName.trim(),
      amount: num,
      direction,
      note: note.trim() || undefined,
    });

    setPersonName('');
    setAmountStr('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Handshake color="#A78BFA" size={22} style={{ marginRight: 8 }} />
                <Text style={styles.title}>Track Money with Friends</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color="#9CA3AF" size={20} />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Direction Selector */}
            <View style={styles.directionToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.directionBtn,
                  direction === 'lent' && styles.directionBtnLentActive,
                ]}
                onPress={() => setDirection('lent')}
              >
                <ArrowUpRight size={18} color={direction === 'lent' ? '#10B981' : '#9CA3AF'} />
                <Text style={[styles.directionText, direction === 'lent' && { color: '#10B981', fontWeight: '700' }]}>
                  Lent (Owed to you)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.directionBtn,
                  direction === 'borrowed' && styles.directionBtnBorrowedActive,
                ]}
                onPress={() => setDirection('borrowed')}
              >
                <ArrowDownLeft size={18} color={direction === 'borrowed' ? '#F43F5E' : '#9CA3AF'} />
                <Text style={[styles.directionText, direction === 'borrowed' && { color: '#F43F5E', fontWeight: '700' }]}>
                  Borrowed (You owe)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Person Name */}
            <Text style={styles.label}>Person's Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={personName}
                onChangeText={(t) => {
                  setPersonName(t);
                  setError('');
                }}
                placeholder="e.g. Rahul, Aisha, Kabir"
                placeholderTextColor="#6B7280"
              />
            </View>

            {/* Amount */}
            <Text style={styles.label}>Amount (₹)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={[styles.input, styles.amountInput]}
                value={amountStr}
                onChangeText={(t) => {
                  setAmountStr(t);
                  setError('');
                }}
                keyboardType="numeric"
                placeholder="500"
                placeholderTextColor="#6B7280"
              />
            </View>

            {/* Note */}
            <Text style={styles.label}>Note (Optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Lunch splitting, Movie ticket"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: direction === 'lent' ? '#10B981' : '#F43F5E' },
                ]}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>Save Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1B2E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  errorText: {
    color: '#F43F5E',
    fontSize: 13,
    marginBottom: 10,
  },
  directionToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#13111C',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#382666',
  },
  directionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  directionBtnLentActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  directionBtnBorrowedActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
  },
  directionText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13111C',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#382666',
    marginBottom: 14,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#A78BFA',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#2A2740',
    alignItems: 'center',
  },
  cancelText: {
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 15,
  },
  saveBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
