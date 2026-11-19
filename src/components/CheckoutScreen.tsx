import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { getCartItems, createOrder, CartItem, User } from './database';
import { ui } from './uiStyles';
import { NavBar, getImgUri, formatPrice } from './shared';

interface Props {
  currentUser: User | null;
  onBack: () => void;
  onOrderSuccess: () => void;
}

const PAYMENT_METHODS = [
  {
    key: 'COD' as const,
    icon: '💵',
    name: 'Thanh toán khi nhận hàng (COD)',
    desc: 'Trả tiền mặt trực tiếp cho shipper khi nhận hàng',
  },
  {
    key: 'BANK' as const,
    icon: '🏦',
    name: 'Chuyển khoản qua Ngân hàng / QR Code',
    desc: 'Quét mã QR qua app ngân hàng',
  },
];

const CheckoutScreen: React.FC<Props> = ({ currentUser, onBack, onOrderSuccess }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState(
    currentUser?.fullname || currentUser?.username || ''
  );
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK'>('COD');

  const loadCart = useCallback(async () => {
    if (!currentUser) return;
    setCartItems(await getCartItems(currentUser.id));
  }, [currentUser]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng!');
      return;
    }
    if (cartItems.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng của bạn đang trống!');
      return;
    }
    if (!currentUser) return;

    const paymentLabel =
      paymentMethod === 'COD' ? 'Tiền mặt khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng';
    const orderId = await createOrder(
      currentUser.id,
      customerName.trim(),
      phone.trim(),
      address.trim(),
      paymentLabel,
      cartItems
    );

    if (!orderId) {
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại!');
      return;
    }

    Alert.alert(
      'Đặt hàng thành công! 🎉',
      `Đơn hàng #${orderId} đã được tạo thành công.\nTrạng thái: ⏳ Chờ Admin xác nhận\nTổng tiền: ${formatPrice(totalAmount)}`,
      [{ text: 'Xem đơn hàng', onPress: onOrderSuccess }]
    );
  };

  return (
    <View style={ui.screen}>
      <NavBar title="ĐẶT HÀNG & THANH TOÁN" onBack={onBack} backText="◀ Giỏ hàng" />

      <ScrollView contentContainerStyle={ui.scrollPad}>
        <View style={ui.card}>
          <Text style={styles.cardTitle}>📍 Thông Tin Nhận Hàng</Text>

          <Text style={ui.label}>Họ và tên người nhận (*)</Text>
          <TextInput
            placeholder="Nhập họ và tên"
            placeholderTextColor="#94A3B8"
            style={ui.input}
            value={customerName}
            onChangeText={setCustomerName}
          />

          <Text style={ui.label}>Số điện thoại liên hệ (*)</Text>
          <TextInput
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#94A3B8"
            style={ui.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={ui.label}>Địa chỉ giao hàng (*)</Text>
          <TextInput
            placeholder="Nhập địa chỉ nhận hàng chi tiết"
            placeholderTextColor="#94A3B8"
            style={ui.input}
            value={address}
            onChangeText={setAddress}
          />

          <Text style={ui.label}>Ghi chú đơn hàng (tuỳ chọn)</Text>
          <TextInput
            placeholder="Ví dụ: Giao giờ hành chính..."
            placeholderTextColor="#94A3B8"
            style={ui.input}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <View style={ui.card}>
          <Text style={styles.cardTitle}>💳 Phương Thức Thanh Toán</Text>
          {PAYMENT_METHODS.map((pm) => {
            const active = paymentMethod === pm.key;
            return (
              <TouchableOpacity
                key={pm.key}
                style={[styles.payOption, active && styles.payOptionActive]}
                onPress={() => setPaymentMethod(pm.key)}
              >
                <Text style={styles.payIcon}>{pm.icon}</Text>
                <View style={ui.flex1}>
                  <Text style={styles.payName}>{pm.name}</Text>
                  <Text style={styles.payDesc}>{pm.desc}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={ui.card}>
          <Text style={styles.cardTitle}>🛍️ Tóm Tắt Đơn Hàng ({cartItems.length} sản phẩm)</Text>

          {cartItems.map((item) => (
            <View key={item.id} style={[ui.row, styles.sumItem]}>
              <Image source={{ uri: getImgUri(item.img, item.name) }} style={styles.sumImg} />
              <View style={styles.sumInfo}>
                <Text style={styles.sumName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.sumQty}>
                  SL: {item.quantity} x {formatPrice(item.price)}
                </Text>
              </View>
              <Text style={styles.sumSub}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}

          <View style={ui.divider} />
          <View style={[ui.rowBetween, styles.sumRow]}>
            <Text style={styles.sumLabel}>Tạm tính:</Text>
            <Text style={styles.sumVal}>{formatPrice(totalAmount)}</Text>
          </View>
          <View style={[ui.rowBetween, styles.sumRow]}>
            <Text style={styles.sumLabel}>Phí vận chuyển:</Text>
            <Text style={[styles.sumVal, styles.freeText]}>Miễn phí</Text>
          </View>
          <View style={ui.divider} />
          <View style={ui.rowBetween}>
            <Text style={styles.totalLabel}>TỔNG CỘNG:</Text>
            <Text style={styles.totalVal}>{formatPrice(totalAmount)}</Text>
          </View>
        </View>

        <TouchableOpacity style={ui.btnPrimary} onPress={handlePlaceOrder} activeOpacity={0.85}>
          <Text style={ui.btnPrimaryText}>XÁC NHẬN ĐẶT HÀNG NGAY</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  freeText: { color: '#10B981' },
  payOption: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, marginTop: 8, backgroundColor: '#F8FAFC' },
  payOptionActive: { borderColor: '#0284C7', backgroundColor: '#EFF6FF' },
  payIcon: { fontSize: 24, marginRight: 10 },
  payName: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  payDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#94A3B8' },
  radioActive: { borderColor: '#0284C7', backgroundColor: '#0284C7' },
  sumItem: { marginBottom: 10 },
  sumImg: { width: 44, height: 44, borderRadius: 6, backgroundColor: '#F1F5F9' },
  sumInfo: { flex: 1, marginLeft: 10 },
  sumName: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  sumQty: { fontSize: 12, color: '#64748B', marginTop: 2 },
  sumSub: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  sumRow: { marginBottom: 6 },
  sumLabel: { fontSize: 13, color: '#64748B' },
  sumVal: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  totalLabel: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  totalVal: { fontSize: 17, fontWeight: 'bold', color: '#E11D48' },
});
