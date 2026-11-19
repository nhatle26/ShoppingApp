import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  getCartItems,
  updateCartQuantity,
  removeFromCart,
  CartItem,
  User,
} from '../../database/database';
import { ui } from '../../styles/uiStyles';
import { NavBar, EmptyState, getImgUri, formatPrice } from '../../components/shared';

interface Props {
  currentUser: User | null;
  onBack: () => void;
  onCheckout: () => void;
  onCartUpdated?: () => void;
}

const CartScreen: React.FC<Props> = ({
  currentUser,
  onBack,
  onCheckout,
  onCartUpdated,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const loadCart = useCallback(async () => {
    if (!currentUser) return;
    setCartItems(await getCartItems(currentUser.id));
    onCartUpdated?.();
  }, [currentUser, onCartUpdated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleRemove = (item: CartItem) => {
    Alert.alert(
      'Xóa sản phẩm',
      `Bạn có muốn xóa "${item.name}" khỏi giỏ hàng không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await removeFromCart(item.id);
            await loadCart();
          },
        },
      ],
    );
  };

  const changeQty = async (item: CartItem, delta: number) => {
    const next = item.quantity + delta;
    if (next <= 0) {
      handleRemove(item);
      return;
    }
    await updateCartQuantity(item.id, next);
    await loadCart();
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={[ui.card, ui.row]}>
      <Image
        source={{ uri: getImgUri(item.img, item.name) }}
        style={styles.img}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>

        <View style={[ui.rowBetween, styles.qtyRow]}>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => changeQty(item, -1)}
            >
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.stepQty}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => changeQty(item, 1)}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtotal}>
            ={formatPrice(item.price * item.quantity)}
          </Text>

          <TouchableOpacity
            style={styles.delBtn}
            onPress={() => handleRemove(item)}
          >
            <Text style={styles.delText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={ui.screen}>
      <NavBar
        title="🛒 GIỎ HÀNG"
        onBack={onBack}
        backText="◀ Tiếp tục mua sắm"
      />

      <FlatList
        data={cartItems}
        keyExtractor={item => item.id.toString()}
        renderItem={renderCartItem}
        contentContainerStyle={ui.listPad}
        ListEmptyComponent={
          <EmptyState
            icon="🛒"
            title="Giỏ hàng của bạn đang trống!"
            subtitle="Hãy chọn những sản phẩm ưng ý để mua sắm ngay."
            actionLabel="Khám phá sản phẩm"
            onAction={onBack}
          />
        }
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={[ui.rowBetween, styles.totalRow]}>
            <Text style={styles.totalLabel}>
              Tổng thanh toán ({cartItems.length} món):
            </Text>
            <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
          </View>
          <TouchableOpacity
            style={ui.btnPrimary}
            onPress={onCheckout}
            activeOpacity={0.85}
          >
            <Text style={ui.btnPrimaryText}>
              TIẾN HÀNH ĐẶT HÀNG (CHECKOUT) ➔
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  img: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#F1F5F9' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  name: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  price: { fontSize: 14, fontWeight: 'bold', color: '#E11D48', marginTop: 2 },
  qtyRow: { marginTop: 8 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  stepBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  stepBtnText: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  stepQty: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtotal: { fontSize: 13, fontWeight: 'bold', color: '#0284C7' },
  delBtn: { padding: 4 },
  delText: { fontSize: 16 },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 4,
  },
  totalRow: { marginBottom: 4 },
  totalLabel: { fontSize: 14, color: '#475569' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#E11D48' },
});
