import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserByCredentials, User } from './database';
import { ui } from './uiStyles';
import { PasswordField } from './shared';

interface Props {
  onSwitchToSignup?: () => void;
  onLoginSuccess: (user: User) => void;
}

const LoginSqlite: React.FC<Props> = ({ onSwitchToSignup, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(
        'Thông báo',
        'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!',
      );
      return;
    }

    try {
      const user = await getUserByCredentials(username, password);
      if (!user) {
        Alert.alert('Thất bại', 'Tên đăng nhập hoặc mật khẩu không chính xác!');
        return;
      }

      await AsyncStorage.setItem('loggedInUser', JSON.stringify(user));
      Alert.alert(
        'Đăng nhập thành công',
        `Xin chào ${
          user.fullname || user.username
        }!\nVai trò: ${user.role.toUpperCase()}`,
        [{ text: 'Bắt đầu', onPress: () => onLoginSuccess(user) }],
      );
    } catch {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi trong quá trình đăng nhập');
    }
  };

  const quickAccounts = [
    {
      label: '🛡️ Admin (admin/123456)',
      u: 'admin',
      p: '123456',
      isAdmin: true,
    },
    { label: '👤 User (user/123456)', u: 'user', p: '123456', isAdmin: false },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={ui.screen}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={ui.authCard}>
          <View style={ui.authHeader}>
            <Text style={ui.authLogo}>🔑</Text>
            <Text style={ui.authTitle}>ĐĂNG NHẬP</Text>
            <Text style={ui.authSub}>Hệ thống mua sắm & Quản trị Shop</Text>
          </View>

          <Text style={ui.label}>Tên đăng nhập</Text>
          <TextInput
            placeholder="Nhập username"
            placeholderTextColor="#94A3B8"
            style={ui.input}
            autoCapitalize="none"
            onChangeText={setUsername}
            value={username}
          />

          <Text style={ui.label}>Mật khẩu</Text>
          <PasswordField
            placeholder="Nhập mật khẩu"
            onChangeText={setPassword}
            value={password}
          />

          <TouchableOpacity
            style={ui.btnPrimary}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={ui.btnPrimaryText}>ĐĂNG NHẬP</Text>
          </TouchableOpacity>

          {onSwitchToSignup && (
            <TouchableOpacity style={ui.switchBtn} onPress={onSwitchToSignup}>
              <Text style={ui.switchText}>
                Chưa có tài khoản?{' '}
                <Text style={ui.switchBold}>Đăng ký ngay</Text>
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>💡 Tài khoản mẫu:</Text>
            {quickAccounts.map(acc => (
              <TouchableOpacity
                key={acc.u}
                style={[
                  styles.quickBtn,
                  acc.isAdmin ? styles.adminQuick : styles.userQuick,
                ]}
                onPress={() => {
                  setUsername(acc.u);
                  setPassword(acc.p);
                }}
              >
                <Text style={styles.quickText}>{acc.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginSqlite;

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  demoBox: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  demoTitle: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  quickBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  adminQuick: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  userQuick: { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' },
  quickText: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
});
