import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import Header from './Header';
import UserManager from './UserManager';
import CategoryManager from './CategoryManager';
import ProductManager from './ProductManager';
import OrderManager from './OrderManager';
import { fetchUsers, fetchCategories, fetchProducts, getAllOrders, User } from './database';
import { ui } from './uiStyles';

interface Props {
  currentUser: User | null;
  onLogout: () => void;
  onNavigateToUserHome?: () => void;
}

type AdminSubScreen = 'dashboard' | 'users' | 'categories' | 'products' | 'orders';

const AdminHome: React.FC<Props> = ({ currentUser, onLogout, onNavigateToUserHome }) => {
  const [screen, setScreen] = useState<AdminSubScreen>('dashboard');
  const [stats, setStats] = useState({ users: 0, categories: 0, products: 0, orders: 0 });

  const loadStats = async () => {
    try {
      const [users, cats, prods, orders] = await Promise.all([
        fetchUsers(),
        fetchCategories(),
        fetchProducts(),
        getAllOrders(),
      ]);
      setStats({
        users: users.length,
        categories: cats.length,
        products: prods.length,
        orders: orders.length,
      });
    } catch (e) {
      console.log('Error loading stats', e);
    }
  };

  useEffect(() => {
    loadStats();
  }, [screen]);

  if (screen === 'users') {
    return <UserManager currentUser={currentUser} onBack={() => setScreen('dashboard')} />;
  }
  if (screen === 'categories') {
    return (
      <CategoryManager
        onBack={() => setScreen('dashboard')}
        onRefreshProducts={loadStats}
      />
    );
  }
  if (screen === 'products') {
    return <ProductManager onBack={() => setScreen('dashboard')} />;
  }
  if (screen === 'orders') {
    return <OrderManager onBack={() => setScreen('dashboard')} />;
  }

  const statCards = [
    { icon: '👥', value: stats.users, label: 'Người dùng', border: '#0284C7' },
    { icon: '📂', value: stats.categories, label: 'Loại sản phẩm', border: '#F59E0B' },
    { icon: '🛍️', value: stats.products, label: 'Sản phẩm', border: '#10B981' },
    { icon: '📦', value: stats.orders, label: 'Đơn hàng', border: '#8B5CF6' },
  ];

  const menuItems: {
    key: AdminSubScreen;
    icon: string;
    bg: string;
    title: string;
    desc: string;
  }[] = [
    {
      key: 'users',
      icon: '👥',
      bg: '#E0F2FE',
      title: '1. Quản lý user',
      desc: 'Xem danh sách, cập nhật vai trò (Admin / User), xóa tài khoản.',
    },
    {
      key: 'categories',
      icon: '📂',
      bg: '#FEF3C7',
      title: '2. Quản lý loại sản phẩm',
      desc: 'Xem, thêm, sửa, xóa loại sản phẩm & thêm SP cho loại tương ứng.',
    },
    {
      key: 'products',
      icon: '🛍️',
      bg: '#DCFCE7',
      title: '3. Quản lý sản phẩm',
      desc: 'Xem, thêm sản phẩm mới (chọn ảnh, danh mục), sửa và xóa.',
    },
    {
      key: 'orders',
      icon: '📦',
      bg: '#F3E8FF',
      title: '4. Quản lý đơn hàng',
      desc: 'Xem danh sách đơn hàng toàn hệ thống, cập nhật trạng thái giao.',
    },
  ];

  return (
    <View style={ui.screen}>
      <StatusBar barStyle="light-content" />
      <Header currentUser={currentUser} onLogout={onLogout} title="BẢNG QUẢN TRỊ ADMIN" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>HỆ THỐNG QUẢN TRỊ VIÊN</Text>
          <Text style={styles.bannerSub}>
            Quản lý người dùng, danh mục, sản phẩm & đơn hàng cửa hàng
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {statCards.map((card) => (
            <View key={card.label} style={[styles.statCard, { borderLeftColor: card.border }]}>
              <Text style={styles.statIcon}>{card.icon}</Text>
              <View>
                <Text style={styles.statNum}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>CHỨC NĂNG QUẢN LÝ</Text>

        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[ui.card, ui.row]}
            onPress={() => setScreen(item.key)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
              <Text style={styles.cardEmoji}>{item.icon}</Text>
            </View>
            <View style={ui.flex1}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.arrow}>➔</Text>
          </TouchableOpacity>
        ))}

        {onNavigateToUserHome && (
          <TouchableOpacity style={styles.shortcut} onPress={onNavigateToUserHome} activeOpacity={0.8}>
            <Text style={styles.shortcutText}>
              🛍️ Chuyển sang Giao diện Cửa hàng của User ➔
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default AdminHome;

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 60 },
  banner: { backgroundColor: '#0F172A', borderRadius: 14, padding: 16, marginBottom: 14 },
  bannerTitle: { fontSize: 17, fontWeight: 'bold', color: '#38BDF8', marginBottom: 4 },
  bannerSub: { fontSize: 13, color: '#94A3B8', lineHeight: 18 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderLeftWidth: 4, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  statIcon: { fontSize: 26 },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  statLabel: { fontSize: 12, color: '#64748B' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 10 },
  iconCircle: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardEmoji: { fontSize: 22 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 3 },
  cardDesc: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  arrow: { fontSize: 18, color: '#94A3B8', marginLeft: 8 },
  shortcut: { backgroundColor: '#E0F2FE', borderWidth: 1.5, borderColor: '#BAE6FD', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  shortcutText: { color: '#0369A1', fontWeight: 'bold', fontSize: 14 },
});
