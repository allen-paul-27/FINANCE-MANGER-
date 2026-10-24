import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCategoryCreated?: (categoryName: string) => void;
}

const AVAILABLE_ICONS = [
  'Utensils',
  'BookOpen',
  'Bus',
  'MoreHorizontal',
  'ShoppingBag',
  'Film',
  'Coffee',
  'Heart',
  'Zap',
  'DollarSign',
  'Briefcase',
];

const AVAILABLE_COLORS = [
  '#A78BFA', // Purple
  '#60A5FA', // Blue
  '#34D399', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
];

export const AddCategoryModal: React.FC<Props> = ({ visible, onClose, onCategoryCreated }) => {
  const { addCategory } = useFinance();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Utensils');
  const [selectedColor, setSelectedColor] = useState('#A78BFA');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a category name.');
      return;
    }

    const newCat = await addCategory({
      name: name.trim(),
      iconName: selectedIcon,
      color: selectedColor,
      isCustom: true,
    });

    setName('');
    setError('');
    if (onCategoryCreated) {
      onCategoryCreated(newCat.name);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Create New Category</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color="#9CA3AF" size={20} />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.label}>Category Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setError('');
                }}
                placeholder="e.g. Subscriptions, Snacks, Gym"
                placeholderTextColor="#6B7280"
                autoFocus
              />
            </View>

            <Text style={styles.label}>Choose Color</Text>
            <View style={styles.colorRow}>
              {AVAILABLE_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorCircle,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <Text style={styles.label}>Choose Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconRow}>
              {AVAILABLE_ICONS.map(iconName => (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    styles.iconBox,
                    selectedIcon === iconName && { borderColor: selectedColor, backgroundColor: '#2D1F50' },
                  ]}
                  onPress={() => setSelectedIcon(iconName)}
                >
                  <CategoryIcon name={iconName} color={selectedIcon === iconName ? selectedColor : '#9CA3AF'} size={20} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: selectedColor }]} onPress={handleSave}>
                <Text style={styles.saveText}>Save Category</Text>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
    marginTop: 8,
  },
  inputContainer: {
    backgroundColor: '#13111C',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#382666',
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectedColorCircle: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
    marginBottom: 24,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#13111C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
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
