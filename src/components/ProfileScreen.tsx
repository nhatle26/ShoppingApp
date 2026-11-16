import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserProfile, getUserById, User } from './database';
import { ui } from './uiStyles';
import { NavBar, PasswordField } from './shared';

interface Props {
  currentUser: User | null;
  onBack: () => void;
  onUserUpdated: (user: User) => void;
}

const ProfileScreen: React.FC<Props> = ({ currentUser, onBack, onUserUpdated }) => {
  const [fullname, setFullname] = useState(currentUser?.fullname || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [password, setPassword] = useState('');

  const handleSave = async () => {
    if (!currentUser) return;
    if (!fullname.trim() && !phone.trim() && !address.trim() && !password.trim()) {
      Alert.alert('Thông báo', 'Không có thông tin nào thay đổi!');
      return;
    }

    const ok = await updateUserProfile(
      currentUser.id,
      fullname.trim(),
      phone.trim(),
      address.trim(),
      password.trim() || undefined
    );

    if (!ok) {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại!');
      return;
    }

    const refreshed = await getUserById(currentUser.id);
    if (refreshed) {
      await AsyncStorage.setItem('loggedInUser', JSON.stringify(refreshed));
      onUserUpdated(refreshed);
    }
    Alert.alert('Thành công 🎉', 'Cập nhật thông tin người dùng thành công!');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={ui.screen}
    >
      <NavBar title="👤 THÔNG TIN CÁ NHÂN" onBack={onBack} backText="◀ Mua sắm" />

      <ScrollView contentContainerStyle={ui.scrollPad}>
        <View style={[ui.card, styles.avatarCard]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{currentUser?.fullname || currentUser?.username}</Text>
          <View
            style={[
              styles.roleBadge,
              currentUser?.role === 'admin' ? styles.adminBadge : styles.userBadge,
            ]}
          >
            <Text style={styles.roleText}>
              {currentUser?.role === 'admin' ? '🛡️ Quản trị viên (Admin)' : '👤 Khách hàng (User)'}
            </Text>
          </View>
        </View>

        <View style={ui.card}>
          <Text style={styles.formTitle}>CẬP NHẬT THÔNG TIN</Text>

          <Text style={ui.label}>Tên đăng nhập (Username):</Text>
          <TextInput
            style={[ui.input, styles.disabledInput]}
            value={currentUser?.username}
            editable={false}
          />
          <Text style={styles.hint}>* Tên đăng nhập không thể thay đổi</Text>

          <Text style={ui.label}>Họ và tên:</Text>
          <TextInput
            placeholder="Nhập họ và tên đầy đủ"
            placeholderTextColor="#94A3B8"
            style={ui.input}
            value={fullname}
            onChangeText={setFullname}
          />

          <Text style={ui.label}>Số điện thoại:</Text>
          <TextInput
            placeholder="Nhập số điện thoại liên lạc"
            placeholderTextColor="#94A3B8"
            style={ui.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={ui.label}>Địa chỉ giao hàng mặc định:</Text>
          <TextInput
            placeholder="Nhập địa chỉ của bạn"
            placeholderTextColor="#94A3B8"
            style={ui.input}
            value={address}
            onChangeText={setAddress}
          />

          <Text style={ui.label}>Đổi mật khẩu mới (nếu muốn):</Text>
          <PasswordField
            placeholder="Để trống nếu giữ nguyên mật khẩu cũ"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={ui.btnPrimary} onPress={handleSave} activeOpacity={0.85}>
            <Text style={ui.btnPrimaryText}>LƯU THÔNG TIN THAY ĐỔI</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  avatarCard: { alignItems: 'center', padding: 20 },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0284C7', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarLetter: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  adminBadge: { backgroundColor: '#FEE2E2' },
  userBadge: { backgroundColor: '#E0F2FE' },
  roleText: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  formTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  disabledInput: { backgroundColor: '#F1F5F9', color: '#64748B' },
  hint: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
});
