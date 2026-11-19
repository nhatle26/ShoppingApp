import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import {
  fetchProducts,
  fetchCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  Product,
  Category,
} from './database';
import { ui } from './uiStyles';
import {
  NavBar,
  getImgUri,
  getDefaultImg,
  formatPrice,
  pickImageUri,
} from './shared';

interface Props {
  onBack?: () => void;
}

const ProductManager: React.FC<Props> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [imageUri, setImageUri] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    const [cats, prods] = await Promise.all([
      fetchCategories(),
      fetchProducts(),
    ]);
    setCategories(cats);
    setProducts(prods);
    if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
  }, [categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setImageUri('');
    if (categories.length > 0) setCategoryId(categories[0].id);
  };

  const handleSaveProduct = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và giá sản phẩm!');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Lỗi', 'Giá sản phẩm phải là một số hợp lệ!');
      return;
    }

    const selectedCat = categories.find(c => c.id === categoryId);
    const fallbackImage = getDefaultImg(`${name} ${selectedCat?.name || ''}`);

    const payload = {
      name: name.trim(),
      price: priceNum,
      img: imageUri.trim() || fallbackImage,
      categoryId: categoryId || 1,
    };

    const ok =
      editingId !== null
        ? await updateProduct({ id: editingId, ...payload })
        : await addProduct(payload);

    if (!ok) {
      Alert.alert(
        'Lỗi',
        editingId !== null ? 'Cập nhật thất bại!' : 'Thêm thất bại!',
      );
      return;
    }

    Alert.alert(
      'Thành công',
      editingId !== null ? 'Đã cập nhật sản phẩm!' : 'Đã thêm sản phẩm mới!',
    );
    resetForm();
    loadData();
  };

  const handleEdit = (item: Product) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(item.price.toString());
    setCategoryId(item.categoryId);
    setImageUri(item.img);
  };

  const handleDelete = (item: Product) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa sản phẩm "${item.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(item.id);
            Alert.alert('Thành công', 'Đã xóa sản phẩm!');
            loadData();
          },
        },
      ],
    );
  };

  const q = search.toLowerCase();
  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q),
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={[ui.card, ui.row]}>
      <Image
        source={{
          uri: getImgUri(item.img, `${item.categoryName || ''} ${item.name}`),
        }}
        style={styles.cardImage}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            📂 {item.categoryName || 'Chung'}
          </Text>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={ui.editBtn} onPress={() => handleEdit(item)}>
            <Text style={ui.editBtnText}>✏️ Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={ui.deleteBtn}
            onPress={() => handleDelete(item)}
          >
            <Text style={ui.deleteBtnText}>🗑️ Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={ui.screen}>
      <NavBar title="🛍️ QUẢN TRỊ SẢN PHẨM" onBack={onBack} />

      <View style={[ui.card, styles.formCard]}>
        <Text style={styles.formTitle}>
          {editingId ? '✏️ CHỈNH SỬA SẢN PHẨM' : '➕ THÊM SẢN PHẨM MỚI'}
        </Text>

        <TextInput
          placeholder="Tên sản phẩm (*)"
          placeholderTextColor="#94A3B8"
          style={[ui.input, styles.inputGap]}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Giá bán (VNĐ) (*)"
          placeholderTextColor="#94A3B8"
          style={[ui.input, styles.inputGap]}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.inputLabel}>Chọn Loại sản phẩm:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
        >
          {categories.map(c => {
            const active = categoryId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[ui.chip, active && styles.catChipActive]}
                onPress={() => setCategoryId(c.id)}
              >
                <Text style={[ui.chipText, active && styles.catChipTextActive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.imagePickerRow}>
          <TouchableOpacity
            style={ui.pickBtn}
            onPress={() => pickImageUri(setImageUri)}
          >
            <Text style={ui.pickText}>
              {imageUri ? '📷 Đổi ảnh' : '📷 Chọn ảnh từ máy'}
            </Text>
          </TouchableOpacity>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewThumb} />
          ) : (
            <TextInput
              placeholder="Hoặc dán URL ảnh..."
              placeholderTextColor="#94A3B8"
              style={styles.urlInput}
              value={imageUri}
              onChangeText={setImageUri}
            />
          )}
        </View>

        <View style={styles.formButtonRow}>
          {editingId && (
            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.saveButton, editingId ? ui.btnUpdate : ui.btnCreate]}
            onPress={handleSaveProduct}
          >
            <Text style={styles.saveButtonText}>
              {editingId ? '💾 Cập Nhật Sản Phẩm' : '➕ Thêm Sản Phẩm'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          placeholder="🔍 Tìm kiếm sản phẩm theo tên hoặc loại..."
          placeholderTextColor="#94A3B8"
          style={ui.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProductItem}
        contentContainerStyle={ui.listPad}
        ListEmptyComponent={
          <Text style={ui.emptyPlain}>Không tìm thấy sản phẩm nào</Text>
        }
      />
    </View>
  );
};

export default ProductManager;

const styles = StyleSheet.create({
  formCard: { margin: 12 },
  formTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10,
  },
  inputGap: { marginBottom: 8 },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  catScroll: { flexDirection: 'row', marginBottom: 10 },
  catChipActive: { borderColor: '#0284C7', backgroundColor: '#E0F2FE' },
  catChipTextActive: { color: '#0369A1', fontWeight: 'bold' },
  imagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  previewThumb: { width: 42, height: 42, borderRadius: 6 },
  urlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  formButtonRow: { flexDirection: 'row', gap: 8 },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
  },
  cancelButtonText: { color: '#64748B', fontWeight: '600' },
  saveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  searchBox: { paddingHorizontal: 12, marginBottom: 8 },
  cardImage: {
    width: 85,
    height: 85,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cardInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  productName: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E11D48',
    marginTop: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  categoryBadgeText: { fontSize: 11, color: '#64748B' },
  actionsRow: { flexDirection: 'row', marginTop: 6, gap: 8 },
});
