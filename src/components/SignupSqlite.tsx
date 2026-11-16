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
  KeyboardTypeOptions,
} from 'react-native';
import { addUser } from './database';
import { ui } from './uiStyles';

interface Props {
  onSwitchToLogin?: () => void;
  onSignupSuccess?: () => void;
}

const initialForm = {
  username: '',
  password: '',
  confirmPassword: '',
  fullname: '',
  phone: '',
  address: '',
};

const SignupSqlite: React.FC<Props> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [role, setRole] = useState<'user' | 'admin'>('user');

  const updateField = (key: keyof typeof initialForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSignup = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập và mật khẩu!');
      return;
    }
    if (form.password.length < 4) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 4 ký tự!');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }

    const ok = await addUser(
      form.username.trim(),
      form.password,
      role,
      form.fullname.trim(),
      form.phone.trim(),
      form.address.trim()
    );

    if (!ok) {
      Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác!');
      return;
    }

    Alert.alert('Thành công', 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.', [
      {
        text: 'Đăng nhập',
        onPress: () => (onSignupSuccess ? onSignupSuccess() : onSwitchToLogin?.()),
      },
    ]);
    setForm(initialForm);
  };

  const fields: {
    key: keyof typeof initialForm;
    label: string;
    placeholder: string;
    secure?: boolean;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: 'none' | 'sentences';
  }[] = [
    { key: 'username', label: 'Tên đăng nhập (*)', placeholder: 'Nhập username', autoCapitalize: 'none' },
    { key: 'password', label: 'Mật khẩu (*)', placeholder: 'Nhập mật khẩu', secure: true },
    { key: 'confirmPassword', label: 'Xác nhận mật khẩu (*)', placeholder: 'Nhập lại mật khẩu', secure: true },
    { key: 'fullname', label: 'Họ và tên', placeholder: 'Ví dụ: Nguyễn Văn A' },
    { key: 'phone', label: 'Số điện thoại', placeholder: 'Ví dụ: 0912345678', keyboardType: 'phone-pad' },
    { key: 'address', label: 'Địa chỉ', placeholder: 'Ví dụ: 123 Nguyễn Huệ, Đà Nẵng' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={ui.screen}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={ui.authCard}>
          <View style={ui.authHeader}>
            <Text style={ui.authLogo}>📝</Text>
            <Text style={ui.authTitle}>ĐĂNG KÝ TÀI KHOẢN</Text>
            <Text style={ui.authSub}>Tạo tài khoản để mua sắm hoặc quản lý</Text>
          </View>

          {fields.map((f) => (
            <View key={f.key}>
              <Text style={ui.label}>{f.label}</Text>
              <TextInput
                placeholder={f.placeholder}
                placeholderTextColor="#94A3B8"
                style={ui.input}
                secureTextEntry={f.secure}
                keyboardType={f.keyboardType}
                autoCapitalize={f.autoCapitalize}
                value={form[f.key]}
                onChangeText={(val) => updateField(f.key, val)}
              />
            </View>
          ))}

          <Text style={ui.label}>Loại tài khoản</Text>
          <View style={styles.roleRow}>
            {(['user', 'admin'] as const).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.roleOption, role === item && styles.roleOptionActive]}
                onPress={() => setRole(item)}
              >
                <Text style={[styles.roleText, role === item && styles.roleTextActive]}>
                  {item === 'user' ? '👤 User (Khách hàng)' : '🛡️ Admin (Quản trị)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={ui.btnPrimary} onPress={handleSignup} activeOpacity={0.85}>
            <Text style={ui.btnPrimaryText}>ĐĂNG KÝ NGAY</Text>
          </TouchableOpacity>

          {onSwitchToLogin && (
            <TouchableOpacity style={ui.switchBtn} onPress={onSwitchToLogin}>
              <Text style={ui.switchText}>
                Đã có tài khoản? <Text style={ui.switchBold}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupSqlite;

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleOption: { flex: 1, paddingVertical: 10, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 8, alignItems: 'center', backgroundColor: '#F8FAFC' },
  roleOptionActive: { borderColor: '#0284C7', backgroundColor: '#E0F2FE' },
  roleText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  roleTextActive: { color: '#0369A1', fontWeight: 'bold' },
});
