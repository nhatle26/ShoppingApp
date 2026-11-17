import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { getOrdersByUserId, Order, User } from './database';
import { ui } from './uiStyles';
import { NavBar, EmptyState, OrderItemList, formatPrice } from './shared';

interface Props {
  currentUser: User | null;
  onBack: () => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Chờ xác nhận':
      return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A', icon: '⏳' };
    case 'Đang giao hàng':
      return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', icon: '🚚' };
    case 'Đã giao':
      return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', icon: '✓' };
    case 'Đã hủy':
      return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', icon: '✕' };
    default:
      return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A', icon: '⏳' };
  }
};

const OrderHistoryScreen: React.FC<Props> = ({ currentUser, onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = useCallback(async () => {
    if (!currentUser) return;
    setOrders(await getOrdersByUserId(currentUser.id));
  }, [currentUser]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const renderOrderItem = ({ item }: { item: Order }) => {
    const stConfig = getStatusConfig(item.status);
    return (
      <View style={ui.card}>
        <View style={[ui.rowBetween, styles.orderHeader]}>
          <View>
            <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
            <Text style={styles.orderDate}>📅 {item.orderDate}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: stConfig.bg, borderColor: stConfig.border },
            ]}
          >
            <Text style={[styles.statusText, { color: stConfig.text }]}>
              {stConfig.icon} {item.status}
            </Text>
          </View>
        </View>

      <View style={styles.shippingBox}>
        <Text style={styles.shippingText}>
          👤 <Text style={styles.bold}>{item.customerName}</Text> | 📞 {item.phone}
        </Text>
        <Text style={styles.shippingText}>📍 {item.address}</Text>
        <Text style={styles.shippingText}>💳 {item.paymentMethod}</Text>
      </View>

      <View style={styles.itemsList}>
        <OrderItemList items={item.items} />
      </View>

      <View style={[ui.rowBetween, styles.orderFooter]}>
        <Text style={styles.totalLabel}>Tổng đơn hàng:</Text>
        <Text style={styles.totalVal}>{formatPrice(item.totalAmount)}</Text>
      </View>
    </View>
    );
  };

  return (
    <View style={ui.screen}>
      <NavBar title="📦 LỊCH SỬ MUA HÀNG" onBack={onBack} backText="◀ Mua sắm" />

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={ui.listPad}
        ListEmptyComponent={
          <EmptyState
            icon="📦"
            title="Bạn chưa có đơn hàng nào"
            subtitle="Các đơn hàng đã đặt sẽ hiển thị tại đây."
            actionLabel="Bắt đầu mua sắm ngay"
            onAction={onBack}
          />
        }
      />
    </View>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
  orderHeader: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8, marginBottom: 8 },
  orderId: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  orderDate: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusText: { color: '#166534', fontSize: 12, fontWeight: 'bold' },
  shippingBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 8 },
  shippingText: { fontSize: 12, color: '#475569', marginBottom: 2 },
  bold: { fontWeight: 'bold', color: '#0F172A' },
  itemsList: { marginBottom: 8 },
  orderFooter: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  totalLabel: { fontSize: 13, color: '#475569', fontWeight: '600' },
  totalVal: { fontSize: 16, fontWeight: 'bold', color: '#E11D48' },
});
