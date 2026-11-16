import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { fetchUsers, updateUserRole, deleteUser, addUser, User } from './database';
import { ui } from './uiStyles';
import { NavBar } from './shared';

interface Props {
  currentUser: User | null;
  onBack?: () => void;
}

const emptyForm = { username: '', password: '', fullname: '', phone: '' };

const UserManager: React.FC<Props> = ({ currentUser, onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');

  const loadUsers = async () => setUsers(await fetchUsers());

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleRole = (user: User) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    Alert.alert(
      'Cập nhật vai trò',
      `Đổi vai trò của [${user.username}] từ ${user.role} thành ${nextRole}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            await updateUserRole(user.id, nextRole);
            Alert.alert('Thành công', `Đã cập nhật vai trò thành: ${nextRole}`);
            loadUsers();
          },
        },
      ]
    );
  };

  const handleDelete = (user: User) => {
    if (currentUser?.id === user.id) {
      Alert.alert('Lỗi', 'Bạn không thể tự xóa tài khoản đang đăng nhập!');
      return;
    }
    Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa người dùng [${user.username}]?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa ngay',
        style: 'destructive',
        onPress: async () => {
          const ok = await deleteUser(user.id);
          Alert.alert(ok ? 'Thành công' : 'Lỗi', ok ? 'Đã xóa người dùng!' : 'Không thể xóa!');
          if (ok) loadUsers();
        },
      },
    ]);
  };

  const handleCreateUser = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }
    const ok = await addUser(
      form.username.trim(),
      form.password,
      newRole,
      form.fullname.trim(),
      form.phone.trim()
    );
    if (!ok) {
      Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại!');
      return;
    }
    Alert.alert('Thành công', 'Thêm người dùng mới thành công!');
    setShowAddModal(false);
    setForm(emptyForm);
    loadUsers();
  };

  const q = search.toLowerCase();
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      u.fullname?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
  );

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarTxt}>{item.username.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userMeta}>
          <Text style={styles.usernameText}>
            {item.username} <Text style={styles.userIdText}>#{item.id}</Text>
          </Text>
          <Text style={styles.fullnameText}>{item.fullname || 'Chưa cập nhật tên'}</Text>
        </View>
        <View
          style={[
            styles.roleBadge,
            item.role === 'admin' ? styles.adminBadge : styles.normalBadge,
          ]}
        >
          <Text style={styles.roleBadgeText}>
            {item.role === 'admin' ? '🛡️ ADMIN' : '👤 USER'}
          </Text>
        </View>
      </View>

      <View style={[ui.rowBetween, styles.infoRow]}>
        <Text style={styles.infoLabel}>
          📞 SĐT: <Text style={styles.infoVal}>{item.phone || 'N/A'}</Text>
        </Text>
        <Text style={styles.infoLabel}>
          📍 Đ/c: <Text style={styles.infoVal}>{item.address || 'N/A'}</Text>
        </Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.roleBtn} onPress={() => handleToggleRole(item)}>
          <Text style={styles.roleBtnText}>
            🔄 Đổi sang {item.role === 'admin' ? 'USER' : 'ADMIN'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[ui.deleteBtn, styles.delPad]} onPress={() => handleDelete(item)}>
          <Text style={ui.deleteBtnText}>🗑️ Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={ui.screen}>
      <NavBar
        title="👥 QUẢN TRỊ USER"
        onBack={onBack}
        right={
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addBtnText}>+ Thêm</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="🔍 Tìm kiếm user theo tên hoặc vai trò..."
          placeholderTextColor="#94A3B8"
          style={ui.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={ui.listPad}
        ListEmptyComponent={<Text style={ui.emptyPlain}>Không tìm thấy người dùng nào</Text>}
      />

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={ui.modalOverlay}>
          <View style={ui.modalBox}>
            <Text style={ui.modalTitle}>Thêm Người Dùng Mới</Text>

            <TextInput
              placeholder="Tên đăng nhập (*)"
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
              autoCapitalize="none"
              value={form.username}
              onChangeText={(v) => setForm({ ...form, username: v })}
            />
            <TextInput
              placeholder="Mật khẩu (*)"
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
              secureTextEntry
              value={form.password}
              onChangeText={(v) => setForm({ ...form, password: v })}
            />
            <TextInput
              placeholder="Họ và tên"
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
              value={form.fullname}
              onChangeText={(v) => setForm({ ...form, fullname: v })}
            />
            <TextInput
              placeholder="Số điện thoại"
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
            />

            <View style={[ui.row, styles.modalRoleRow]}>
              <Text style={styles.modalRoleLabel}>Vai trò:</Text>
              {(['user', 'admin'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleSelectBtn, newRole === r && styles.roleSelectBtnActive]}
                  onPress={() => setNewRole(r)}
                >
                  <Text
                    style={[styles.roleSelectText, newRole === r && styles.roleSelectTextActive]}
                  >
                    {r === 'user' ? 'User' : 'Admin'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={ui.modalActions}>
              <TouchableOpacity style={ui.modalCancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={ui.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={ui.modalSubmitBtn} onPress={handleCreateUser}>
                <Text style={ui.modalSubmitText}>Tạo User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserManager;

const styles = StyleSheet.create({
  addBtn: { backgroundColor: '#0284C7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  addBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  searchWrapper: { padding: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  userCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  userHeader: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarTxt: { fontSize: 18, fontWeight: 'bold', color: '#0369A1' },
  userMeta: { flex: 1 },
  usernameText: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  userIdText: { fontSize: 12, color: '#94A3B8', fontWeight: 'normal' },
  fullnameText: { fontSize: 13, color: '#64748B', marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  adminBadge: { backgroundColor: '#FEE2E2' },
  normalBadge: { backgroundColor: '#DCFCE7' },
  roleBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#0F172A' },
  infoRow: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  infoLabel: { fontSize: 12, color: '#64748B' },
  infoVal: { color: '#1E293B', fontWeight: '500' },
  cardActions: { flexDirection: 'row', marginTop: 12, gap: 8 },
  roleBtn: { flex: 1, backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  roleBtnText: { fontSize: 12, fontWeight: '600', color: '#0284C7' },
  delPad: { paddingHorizontal: 14, justifyContent: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, height: 42, marginBottom: 10, fontSize: 14, color: '#0F172A' },
  modalRoleRow: { marginBottom: 16 },
  modalRoleLabel: { fontSize: 14, fontWeight: '600', color: '#334155', marginRight: 12 },
  roleSelectBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, borderWidth: 1, borderColor: '#CBD5E1', marginRight: 8 },
  roleSelectBtnActive: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  roleSelectText: { fontSize: 13, color: '#64748B' },
  roleSelectTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
});
