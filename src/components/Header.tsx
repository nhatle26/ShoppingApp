import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { User } from './database';
import { ui } from './uiStyles';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  title?: string;
  onCartPress?: () => void;
  cartCount?: number;
  onHistoryPress?: () => void;
  onProfilePress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  title,
  onCartPress,
  cartCount = 0,
  onHistoryPress,
  onProfilePress,
}) => {
  const confirmLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <View style={styles.header}>
      <View style={[ui.rowBetween, styles.topRow]}>
        <View style={ui.row}>
          <Text style={styles.logo}>🛍️</Text>
          <Text style={styles.title}>{title || 'SHOP ONLINE'}</Text>
        </View>

        <View style={ui.row}>
          {onCartPress && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onCartPress}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {currentUser && onHistoryPress && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onHistoryPress}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>📦</Text>
            </TouchableOpacity>
          )}
          {currentUser && onProfilePress && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onProfilePress}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>👤</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {currentUser ? (
        <View style={styles.userBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userRow}>
            <Text
              style={styles.greeting}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Xin chào,{' '}
              <Text style={styles.username}>
                {currentUser.fullname || currentUser.username}
              </Text>
            </Text>
            <Text
              style={[
                styles.badgeRole,
                currentUser.role === 'admin' ? styles.adminBg : styles.userBg,
              ]}
            >
              {currentUser.role === 'admin' ? 'Admin' : 'Khách'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={confirmLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.guest}>Chưa đăng nhập • Chế độ khách</Text>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0F172A',
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topRow: { marginBottom: 6 },
  logo: { fontSize: 18, marginRight: 6 },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.4,
  },
  iconBtn: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 6,
    borderRadius: 16,
    marginLeft: 6,
  },
  icon: { fontSize: 16 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' },
  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  userRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  greeting: { color: '#E2E8F0', fontSize: 12, flexShrink: 1 },
  username: { fontWeight: 'bold', color: '#FFFFFF' },
  badgeRole: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 6,
    color: '#FFFFFF',
  },
  adminBg: { backgroundColor: '#DC2626', fontWeight: 'bold' },
  userBg: { backgroundColor: '#10B981', fontWeight: '600' },
  logoutBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  logoutText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  guest: {
    color: '#94A3B8',
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 2,
  },
});
