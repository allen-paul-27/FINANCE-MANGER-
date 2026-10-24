import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Plus, Users, MessageSquare } from 'lucide-react-native';

export interface CustomTabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
  descriptors: Record<string, { options: any }>;
  navigation: {
    emit: (event: any) => any;
    navigate: (name: string) => void;
  };
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabContainerWrapper}>
      <View style={styles.tabContainer}>
        {state.routes.map((route: { key: string; name: string }, index: number) => {
          const { options } = descriptors[route.key] || { options: {} };
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let IconComponent = Home;
          let label = 'Home';

          if (route.name === 'index') {
            IconComponent = Home;
            label = 'Home';
          } else if (route.name === 'add') {
            IconComponent = Plus;
            label = 'Add';
          } else if (route.name === 'lent-borrowed') {
            IconComponent = Users;
            label = 'Lent & Borrowed';
          } else if (route.name === 'chatbot') {
            IconComponent = MessageSquare;
            label = 'Chatbot';
          }

          const activeColor = '#A78BFA';
          const inactiveColor = '#8E8D9A';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              activeOpacity={0.7}
              style={[styles.tabButton, isFocused && styles.tabButtonActive]}
            >
              <IconComponent
                size={20}
                color={isFocused ? activeColor : inactiveColor}
              />
              <Text style={[styles.tabLabel, { color: isFocused ? activeColor : inactiveColor }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainerWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#171424',
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
    maxWidth: 420,
    justifyContent: 'space-around',
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 24,
  },
  tabButtonActive: {
    backgroundColor: '#2E1E54',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
});
