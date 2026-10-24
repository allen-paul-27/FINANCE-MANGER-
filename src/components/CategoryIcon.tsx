import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Utensils,
  BookOpen,
  Bus,
  MoreHorizontal,
  ShoppingBag,
  Film,
  Tag,
  Coffee,
  Heart,
  Zap,
  DollarSign,
  Briefcase,
  LucideProps,
} from 'lucide-react-native';

interface Props {
  name: string;
  color?: string;
  backgroundColor?: string;
  size?: number;
}

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Utensils,
  BookOpen,
  Bus,
  MoreHorizontal,
  ShoppingBag,
  Film,
  Coffee,
  Heart,
  Zap,
  DollarSign,
  Briefcase,
  Food: Utensils,
  Textbooks: BookOpen,
  Travel: Bus,
  Misc: MoreHorizontal,
  Shopping: ShoppingBag,
  Entertainment: Film,
};

export const CategoryIcon: React.FC<Props> = ({
  name,
  color = '#8B5CF6',
  backgroundColor,
  size = 20,
}) => {
  const IconComponent = ICON_MAP[name] || ICON_MAP[name.charAt(0).toUpperCase() + name.slice(1)] || Tag;

  if (backgroundColor) {
    return (
      <View style={[styles.container, { backgroundColor, width: size * 1.8, height: size * 1.8, borderRadius: (size * 1.8) / 2 }]}>
        <IconComponent size={size} color={color} />
      </View>
    );
  }

  return <IconComponent size={size} color={color} />;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
