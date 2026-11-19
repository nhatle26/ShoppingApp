import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Category } from './database';

interface CategorySelectorProps {
  categories: Category[];
  selectedId: number | null;
  onSelectCategory: (id: number | null) => void;
}

const getCategoryIcon = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('điện thoại') || lower.includes('phone')) return '📱';
  if (lower.includes('laptop') || lower.includes('máy tính')) return '💻';
  if (lower.includes('đồng hồ') || lower.includes('watch')) return '⌚';
  if (lower.includes('tai nghe') || lower.includes('âm thanh')) return '🎧';
  if (lower.includes('máy ảnh') || lower.includes('camera')) return '📷';
  if (lower.includes('phụ kiện')) return '🔌';
  return '📦';
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedId,
  onSelectCategory,
}) => {
  const options = [
    { id: null as number | null, name: 'Tất cả', icon: '🌐' },
    ...categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: getCategoryIcon(cat.name),
    })),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📂 Danh mục sản phẩm</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map(opt => {
          const active = selectedId === opt.id;
          return (
            <TouchableOpacity
              key={String(opt.id)}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => onSelectCategory(opt.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{opt.icon}</Text>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {opt.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategorySelector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    elevation: 2,
  },
  icon: { fontSize: 15, marginRight: 6 },
  pillText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '700' },
});
