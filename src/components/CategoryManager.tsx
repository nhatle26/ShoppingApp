import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  addProduct,
  Category,
} from './database';
import { ui } from './uiStyles';
import { NavBar, getDefaultImg, pickImageUri } from './shared';

interface Props {
  onBack?: () => void;
  onRefreshProducts?: () => void;
}

const CategoryManager: React.FC<Props> = ({ onBack, onRefreshProducts }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [targetCategory, setTargetCategory] = useState<Category | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImg, setProdImg] = useState('');

  const loadCategories = async () => setCategories(await fetchCategories());

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSaveCategory = async () => {
    const trimmed = categoryName.trim();
    if (!trimmed) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên loại sản phẩm!');
      return;
    }

    const ok = editingCategory
      ? await updateCategory({ id: editingCategory.id, name: trimmed })
      : await addCategory(trimmed);

    if (!ok) {
      Alert.alert('Lỗi', editingCategory ? 'Cập nhật thất bại!' : 'Thêm thất bại!');
      return;
    }

    Alert.alert(
      'Thành công',
      editingCategory ? 'Cập nhật loại sản phẩm thành công!' : 'Thêm loại sản phẩm mới thành công!'
    );
    setEditingCategory(null);
    setCategoryName('');
    loadCategories();
  };

  const handleDelete = (cat: Category) => {
    Alert.alert(
      'Xác nhận xóa loại sản phẩm',
      `Xóa loại [${cat.name}]? Các sản phẩm thuộc loại này cũng sẽ bị xóa!`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(cat.id);
            Alert.alert('Thành công', 'Đã xóa loại sản phẩm!');
            loadCategories();
            onRefreshProducts?.();
          },
        },
      ]
    );
  };

  const openAddProductModal = (cat: Category) => {
    setTargetCategory(cat);
    setProdName('');
    setProdPrice('');
    setProdImg('');
    setModalVisible(true);
  };

  const handleAddProductForCategory = async () => {
    if (!targetCategory || !prodName.trim() || !prodPrice.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và giá sản phẩm!');
      return;
    }
    const priceNum = parseFloat(prodPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Lỗi', 'Giá sản phẩm phải là một số hợp lệ!');
      return;
    }

    const ok = await addProduct({
      name: prodName.trim(),
      price: priceNum,
      img: prodImg.trim() || getDefaultImg(`${prodName} ${targetCategory.name}`),
      categoryId: targetCategory.id,
    });

    if (!ok) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm!');
      return;
    }

    Alert.alert('Thành công', `Đã thêm "${prodName.trim()}" vào loại "${targetCategory.name}"!`);
    setModalVisible(false);
    loadCategories();
    onRefreshProducts?.();
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.catCard}>
      <View style={styles.catInfoRow}>
        <View style={styles.catIconBox}>
          <Text style={styles.catIcon}>📂</Text>
        </View>
        <View style={ui.flex1}>
          <Text style={styles.catName}>{item.name}</Text>
          <Text style={styles.catCount}>
            Số sản phẩm: <Text style={styles.catCountBold}>{item.productCount ?? 0}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.catActions}>
        <TouchableOpacity style={styles.addProdBtn} onPress={() => openAddProductModal(item)}>
          <Text style={styles.addProdBtnText}>➕ Thêm SP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={ui.editBtn}
          onPress={() => {
            setEditingCategory(item);
            setCategoryName(item.name);
          }}
        >
          <Text style={ui.editBtnText}>✏️ Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ui.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={ui.deleteBtnText}>🗑️ Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={ui.screen}>
      <NavBar title="📂 QUẢN TRỊ LOẠI SẢN PHẨM" onBack={onBack} />

      <View style={[ui.card, styles.formWrap]}>
        <Text style={styles.formTitle}>
          {editingCategory ? `✏️ Đang sửa: ${editingCategory.name}` : '➕ Thêm loại sản phẩm mới'}
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Nhập tên loại sản phẩm..."
            placeholderTextColor="#94A3B8"
            style={[ui.input, ui.flex1]}
            value={categoryName}
            onChangeText={setCategoryName}
          />
          <TouchableOpacity
            style={[styles.saveBtn, editingCategory ? ui.btnUpdate : ui.btnCreate]}
            onPress={handleSaveCategory}
          >
            <Text style={styles.saveBtnText}>{editingCategory ? 'Lưu' : 'Thêm'}</Text>
          </TouchableOpacity>
        </View>
        {editingCategory && (
          <TouchableOpacity
            style={styles.cancelEditBtn}
            onPress={() => {
              setEditingCategory(null);
              setCategoryName('');
            }}
          >
            <Text style={styles.cancelEditText}>✕ Hủy chỉnh sửa</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={ui.listPad}
        ListEmptyComponent={<Text style={ui.emptyPlain}>Chưa có loại sản phẩm nào</Text>}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={ui.modalOverlay}>
          <View style={ui.modalBox}>
            <Text style={ui.modalTitle}>Thêm Sản Phẩm Mới</Text>
            <View style={styles.catBadgeRow}>
              <Text style={styles.catBadgeLabel}>Loại:</Text>
              <Text style={styles.catBadgeText}>📂 {targetCategory?.name}</Text>
            </View>

            <TextInput
              placeholder="Tên sản phẩm (*)"
              placeholderTextColor="#94A3B8"
              style={[ui.input, styles.modalInputGap]}
              value={prodName}
              onChangeText={setProdName}
            />
            <TextInput
              placeholder="Giá sản phẩm (VNĐ) (*)"
              placeholderTextColor="#94A3B8"
              style={[ui.input, styles.modalInputGap]}
              keyboardType="numeric"
              value={prodPrice}
              onChangeText={setProdPrice}
            />

            <TouchableOpacity style={styles.pickImgBtn} onPress={() => pickImageUri(setProdImg)}>
              <Text style={styles.pickImgText}>
                {prodImg ? '📷 Chọn lại ảnh từ máy' : '📷 Chọn ảnh từ thư viện'}
              </Text>
            </TouchableOpacity>

            {prodImg ? (
              <Image source={{ uri: prodImg }} style={styles.previewImage} />
            ) : (
              <TextInput
                placeholder="Hoặc dán URL hình ảnh..."
                placeholderTextColor="#94A3B8"
                style={[ui.input, styles.modalInputGap]}
                value={prodImg}
                onChangeText={setProdImg}
              />
            )}

            <View style={ui.modalActions}>
              <TouchableOpacity style={ui.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={ui.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={ui.modalSubmitBtn} onPress={handleAddProductForCategory}>
                <Text style={ui.modalSubmitText}>Lưu Sản Phẩm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoryManager;

const styles = StyleSheet.create({
  formWrap: { margin: 12 },
  formTitle: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 8 },
  saveBtn: { paddingHorizontal: 18, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  cancelEditBtn: { marginTop: 8, alignSelf: 'flex-start' },
  cancelEditText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
  catCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  catInfoRow: { flexDirection: 'row', alignItems: 'center' },
  catIconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  catIcon: { fontSize: 18 },
  catName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  catCount: { fontSize: 13, color: '#64748B', marginTop: 2 },
  catCountBold: { fontWeight: 'bold', color: '#0284C7' },
  catActions: { flexDirection: 'row', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 8 },
  addProdBtn: { flex: 1, backgroundColor: '#E0F2FE', borderWidth: 1, borderColor: '#BAE6FD', paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  addProdBtnText: { color: '#0369A1', fontWeight: 'bold', fontSize: 12 },
  catBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#F1F5F9', padding: 8, borderRadius: 8, gap: 8 },
  catBadgeLabel: { fontSize: 13, color: '#64748B' },
  catBadgeText: { backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 'bold', fontSize: 13, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 4 },
  modalInputGap: { marginBottom: 10 },
  pickImgBtn: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  pickImgText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  previewImage: { width: 90, height: 90, borderRadius: 8, alignSelf: 'center', marginBottom: 12 },
});
