import React, { useState, useRef, useEffect } from 'react';
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
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Bot, ArrowUp, Plus, CheckCheck, Trash2, Cpu } from 'lucide-react-native';
import { useFinance } from '@/context/FinanceContext';

const QUICK_SUGGESTIONS = [
  'Who owes me money?',
  'Spending this week?',
  'Biggest category?',
  'How much spent on Food?',
  'UPI transactions',
  'Remaining balance',
];

export default function ChatbotScreen() {
  const { chatMessages, sendChatMessage, clearChatHistory } = useFinance();
  const [inputQuery, setInputQuery] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatMessages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    setInputQuery('');
    Keyboard.dismiss();
    await sendChatMessage(textToSend.trim());
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <View style={styles.titleWithBadge}>
              <Text style={styles.headerTitle}>Chatbot</Text>
              <View style={styles.localEngineBadge}>
                <Cpu size={12} color="#10B981" />
                <Text style={styles.localEngineText}>On-Device AI Engine</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>Ask about your spending, savings or friends.</Text>
          </View>
          {chatMessages.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearChatHistory}>
              <Trash2 size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Chat Messages List */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.map(msg => {
            const isUser = msg.sender === 'user';

            if (isUser) {
              return (
                <View key={msg.id} style={styles.userMsgWrapper}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userMsgText}>{msg.text}</Text>
                  </View>
                  <View style={styles.userTimestampRow}>
                    <Text style={styles.msgTimestamp}>{msg.timestamp}</Text>
                    <CheckCheck size={14} color="#8B5CF6" style={{ marginLeft: 4 }} />
                  </View>
                </View>
              );
            }

            return (
              <View key={msg.id} style={styles.botMsgWrapper}>
                <View style={styles.botRow}>
                  <View style={styles.botAvatar}>
                    <Bot size={20} color="#C4B5FD" />
                  </View>
                  <View style={styles.botBubble}>
                    <Text style={styles.botMsgText}>{msg.text}</Text>
                  </View>
                </View>
                <Text style={styles.botTimestamp}>{msg.timestamp}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        <View style={styles.suggestionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsRow}>
            {QUICK_SUGGESTIONS.map((suggestion, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                onPress={() => handleSend(suggestion)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputBarContainer}>
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.plusIconBtn}>
              <Plus size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              value={inputQuery}
              onChangeText={setInputQuery}
              placeholder="Ask about your spending..."
              placeholderTextColor="#6B7280"
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                !inputQuery.trim() && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputQuery.trim()}
              activeOpacity={0.8}
            >
              <ArrowUp size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  localEngineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  localEngineText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  clearBtn: {
    padding: 8,
    backgroundColor: '#171424',
    borderRadius: 12,
  },
  chatScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 20,
    gap: 16,
  },
  userMsgWrapper: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    borderBottomRightRadius: 6,
    maxWidth: '82%',
  },
  userMsgText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  userTimestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  msgTimestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  botMsgWrapper: {
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    maxWidth: '88%',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A1F4D',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  botBubble: {
    flex: 1,
    backgroundColor: '#171424',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  botMsgText: {
    fontSize: 15,
    color: '#E5E7EB',
    lineHeight: 22,
  },
  botTimestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 46,
    marginTop: 4,
  },
  suggestionsContainer: {
    marginBottom: 8,
  },
  suggestionsRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#171424',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  suggestionText: {
    fontSize: 13,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  inputBarContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 95 : 85,
    paddingTop: 6,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171424',
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  plusIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#242036',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#373052',
    opacity: 0.6,
  },
});
