import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Product, User, addToCart } from '../../database/database';
import { ui } from '../../styles/uiStyles';
import { NavBar, getImgUri, formatPrice } from '../../components/shared';

interface ProductDetailProps {
  product: Product;
  currentUser: User | null;
  onBack: () => void;
  onCartUpdated?: () => void;
  onGoToCart?: () => void;
}

const STATUS_PILLS = ['✅ Còn hàng', '🚚 Giao nhanh 24h', '🛡️ Bảo hành 12T'];

const ProductDetailScreen: React.FC<ProductDetailProps> = ({
  product,
  currentUser,
  onBack,
  onCartUpdated,
  onGoToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const imgUri = getImgUri(
    product.img,
    `${product.categoryName || ''} ${product.name}`,
  );

  const handleAddToCart = async () => {
    if (!currentUser) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!',
      );
      return;
    }

    setIsAdding(true);
    const ok = await addToCart(currentUser.id, product.id, quantity);
    setIsAdding(false);

    if (!ok) {
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
      return;
    }

    onCartUpdated?.();
    Alert.alert(
      'Thành công! 🎉',
      `Đã thêm ${quantity} x "${product.name}" vào giỏ hàng!`,
      [
        { text: 'Tiếp tục xem', style: 'cancel' },
        { text: 'Đến giỏ hàng', onPress: () => onGoToCart?.() },
      ],
    );
  };

  return (
    <View style={ui.screen}>
      <NavBar
        title="Chi tiết sản phẩm"
        onBack={onBack}
        backText="← Quay lại"
        dark
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageCard}>
          <Image
            source={{ uri: imgUri }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {product.categoryName
                ? `📂 ${product.categoryName}`
                : 'Sản phẩm nổi bật'}
            </Text>
          </View>
        </View>

        <View style={[ui.card, styles.infoCard]}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>

          <View style={styles.statusRow}>
            {STATUS_PILLS.map(label => (
              <View key={label} style={styles.statusPill}>
                <Text style={styles.statusText}>{label}</Text>
              </View>
            ))}
          </View>

          <View style={ui.divider} />

          <Text style={styles.sectionHeading}>Chọn số lượng:</Text>
          <View style={ui.row}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Text
                style={[
                  styles.qtyBtnText,
                  quantity <= 1 && styles.qtyBtnDisabled,
                ]}
              >
                −
              </Text>
            </TouchableOpacity>

            <Text style={styles.qtyDisplayText}>{quantity}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>

            <Text style={styles.totalPreviewText}>
              = {formatPrice(product.price * quantity)}
            </Text>
          </View>

          <View style={ui.divider} />

          <Text style={styles.sectionHeading}>Mô tả & Đặc điểm nổi bật:</Text>
          <Text style={styles.descriptionText}>
            {product.description?.trim() ||
              `Sản phẩm ${product.name} chính hãng 100%, chất lượng cao cấp, thiết kế hiện đại và sang trọng. Đáp ứng hoàn hảo mọi nhu cầu sử dụng hàng ngày.`}
          </Text>

          <View style={styles.guaranteeBox}>
            <Text style={styles.guaranteeTitle}>⭐️ Cam kết từ Shop:</Text>
            <Text style={styles.guaranteeItem}>
              • Cam kết 100% hàng chính hãng mới nguyên seal
            </Text>
            <Text style={styles.guaranteeItem}>
              • 1 đổi 1 trong 30 ngày nếu phát sinh lỗi
            </Text>
            <Text style={styles.guaranteeItem}>
              • Miễn phí vận chuyển toàn quốc cho đơn hàng
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAddToCart}
          disabled={isAdding}
          activeOpacity={0.8}
        >
          <Text style={ui.btnPrimaryText}>
            {isAdding ? 'Đang thêm...' : '🛒 Thêm vào giỏ hàng'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  imageCard: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  productImage: { width: '100%', height: 260 },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15,23,42,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  categoryBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  infoCard: { marginTop: 10, marginHorizontal: 12, padding: 18 },
  productName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#EF4444',
    marginBottom: 12,
  },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusText: { color: '#065F46', fontSize: 12, fontWeight: '600' },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  qtyBtnDisabled: { color: '#94A3B8' },
  qtyDisplayText: {
    width: 48,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalPreviewText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
    marginLeft: 14,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
  },
  guaranteeBox: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  guaranteeItem: { fontSize: 13, color: '#1E3A8A', marginBottom: 3 },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 6,
  },
  addBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});
