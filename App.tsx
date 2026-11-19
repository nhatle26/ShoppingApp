import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  Platform,
  LogBox,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initDatabase, User } from './src/database/database';
import Header from './src/components/Header';
import LoginSqlite from './src/screens/auth/LoginSqlite';
import SignupSqlite from './src/screens/auth/SignupSqlite';
import AdminHome from './src/screens/admin/AdminHome';
import UserHomeScreen, { UserSubView } from './src/screens/user/UserHomeScreen';
import { ui } from './src/styles/uiStyles';

LogBox.ignoreAllLogs(true);

export type TabType =
  | 'userHome'
  | 'adminHome'
  | 'signup'
  | 'login'
  | 'cart'
  | 'history'
  | 'profile';

const App = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('userHome');
  const [userSubView, setUserSubView] = useState<UserSubView>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    initDatabase(async () => {
      try {
        const saved = await AsyncStorage.getItem('loggedInUser');
        if (!saved) return;
        const user: User = JSON.parse(saved);
        setCurrentUser(user);
        setCurrentTab(user.role === 'admin' ? 'adminHome' : 'userHome');
      } catch (e) {
        console.error('Lỗi đọc user:', e);
      }
    });
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setUserSubView('home');
    setCurrentTab(user.role === 'admin' ? 'adminHome' : 'userHome');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('loggedInUser');
    setCurrentUser(null);
    setUserSubView('home');
    setCurrentTab('userHome');
  };

  const isAdmin = currentUser?.role === 'admin';

  const standardTabs: { key: TabType; icon: string; label: string; active: boolean }[] = [
    {
      key: 'userHome',
      icon: '🛍️',
      label: isAdmin ? 'Cửa hàng' : 'Trang chủ',
      active: currentTab === 'userHome' && (userSubView === 'home' || userSubView === 'detail'),
    },
    ...(isAdmin
      ? [{ key: 'adminHome' as TabType, icon: '🛡️', label: 'Quản trị', active: currentTab === 'adminHome' }]
      : []),
    {
      key: 'cart',
      icon: '🛒',
      label: 'Giỏ hàng',
      active: currentTab === 'userHome' && (userSubView === 'cart' || userSubView === 'checkout'),
    },
    {
      key: 'history',
      icon: '📦',
      label: 'Đơn hàng',
      active: currentTab === 'userHome' && userSubView === 'history',
    },
    {
      key: 'profile',
      icon: '👤',
      label: currentUser ? 'Tài khoản' : 'Đăng nhập',
      active:
        (currentTab === 'userHome' && userSubView === 'profile') ||
        currentTab === 'login' ||
        currentTab === 'signup',
    },
  ];

  const handleTabPress = (tabKey: TabType) => {
    if (tabKey === 'userHome') {
      setCurrentTab('userHome');
      setUserSubView('home');
    } else if (tabKey === 'adminHome') {
      setCurrentTab('adminHome');
    } else if (tabKey === 'cart') {
      if (!currentUser) {
        Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để xem và quản lý giỏ hàng!', [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => setCurrentTab('login') },
        ]);
        return;
      }
      setCurrentTab('userHome');
      setUserSubView('cart');
    } else if (tabKey === 'history') {
      if (!currentUser) {
        Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để xem lịch sử mua hàng!', [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => setCurrentTab('login') },
        ]);
        return;
      }
      setCurrentTab('userHome');
      setUserSubView('history');
    } else if (tabKey === 'profile') {
      if (!currentUser) {
        setCurrentTab('login');
      } else {
        setCurrentTab('userHome');
        setUserSubView('profile');
      }
    }
  };

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar barStyle="light-content" />

      <View style={styles.contentArea}>
        {currentTab === 'userHome' && (
          <UserHomeScreen
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigateToAdminHome={() => setCurrentTab('adminHome')}
            onUserUpdated={setCurrentUser}
            activeSubView={userSubView}
            onSubViewChange={setUserSubView}
          />
        )}

        {currentTab === 'adminHome' && (
          <AdminHome
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigateToUserHome={() => {
              setCurrentTab('userHome');
              setUserSubView('home');
            }}
          />
        )}

        {currentTab === 'signup' && (
          <View style={ui.flex1}>
            <Header currentUser={currentUser} onLogout={handleLogout} title="ĐĂNG KÝ THÀNH VIÊN" />
            <SignupSqlite
              onSwitchToLogin={() => setCurrentTab('login')}
              onSignupSuccess={() => setCurrentTab('login')}
            />
          </View>
        )}

        {currentTab === 'login' && (
          <View style={ui.flex1}>
            <Header currentUser={currentUser} onLogout={handleLogout} title="ĐĂNG NHẬP HỆ THỐNG" />
            <LoginSqlite
              onSwitchToSignup={() => setCurrentTab('signup')}
              onLoginSuccess={handleLoginSuccess}
            />
          </View>
        )}
      </View>

      <View style={styles.bottomTabBar}>
        {standardTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, tab.active && styles.tabButtonActive]}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#0F172A' },
  contentArea: { flex: 1, backgroundColor: '#F8FAFC' },
  bottomTabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 60 : 54,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
  },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, marginHorizontal: 2, borderRadius: 10 },
  tabButtonActive: { backgroundColor: 'rgba(56, 189, 248, 0.16)' },
  tabIcon: { fontSize: 17, marginBottom: 1 },
  tabLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  tabLabelActive: { color: '#38BDF8', fontWeight: '700' },
});
