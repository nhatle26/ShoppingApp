import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getAllOrders, updateOrderStatus, Order } from './database';
import { ui } from './uiStyles';
import { NavBar, EmptyState, OrderItemList, formatPrice } from './shared';

interface Props {
  onBack: () => void;
}

const ORDER_STATUSES = ['Chờ xác nhận', 'Đang giao hàng', 'Đã giao', 'Đã hủy'];
const FILTER_OPTIONS = ['Tất cả', ...ORDER_STATUSES];

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  'Đã giao': { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
  'Đang giao hàng': { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  'Đã hủy': { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  default: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
};

const OrderManager: React.FC<Props> = ({ onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setOrders(await getAllOrders());
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = (order: Order, newStatus: string) => {
    Alert.alert(
      'Cập nhật tình trạng đơn hàng',
      `Đổi đơn hàng #${order.id} sang "${newStatus}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            const ok = await updateOrderStatus(order.id, newStatus);
            Alert.alert(
              ok ? 'Thành công' : 'Lỗi',
              ok ? `Đơn #${order.id} đã chuyển sang "${newStatus}"!` : 'Không thể cập nhật!'
            );
            if (ok) loadOrders();
          },
        },
      ]
    );
  };

  const filteredOrders = orders.filter(
    (o) => filterStatus === 'Tất cả' || o.status === filterStatus
  );

  const renderOrderItem = ({ item }: { item: Order }) => {
    const sc = STATUS_STYLE[item.status] || STATUS_STYLE.default;

    return (
      <View style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderIdText}>Mã đơn: #{item.id}</Text>
            <Text style={styles.dateText}>🕒 {item.orderDate}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.customerBox}>
          <Text style={styles.customerInfoText}>
            👤 <Text style={styles.boldText}>{item.customerName}</Text> • 📞 {item.phone}
          </Text>
          <Text style={styles.customerInfoText}>📍 {item.address}</Text>
          <Text style={styles.customerInfoText}>
            💳 Phương thức: <Text style={styles.boldText}>{item.paymentMethod}</Text>
          </Text>
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>📦 Sản phẩm đã đặt:</Text>
          {item.items?.length ? (
            <OrderItemList items={item.items} />
          ) : (
            <Text style={styles.emptyItemsText}>Không có chi tiết sản phẩm</Text>
          )}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalValue}>{formatPrice(item.totalAmount)}</Text>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>Chuyển trạng thái đơn hàng:</Text>
          <View style={styles.statusButtonGroup}>
            {ORDER_STATUSES.map((st) => {
              const current = item.status === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[styles.statusSelectBtn, current && styles.statusSelectBtnCurrent]}
                  onPress={() => handleUpdateStatus(item, st)}
                  disabled={current}
                >
                  <Text
                    style={[
                      styles.statusSelectBtnText,
                      current && styles.statusSelectBtnTextCurrent,
                    ]}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={ui.screen}>
      <NavBar
        title="QUẢN TRỊ ĐƠN HÀNG"
        onBack={onBack}
        backText="← Bảng quản trị"
        dark
        right={
          <TouchableOpacity style={ui.darkBackBtn} onPress={loadOrders} activeOpacity={0.7}>
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTER_OPTIONS.map((st) => {
            const active = filterStatus === st;
            return (
              <TouchableOpacity
                key={st}
                style={[ui.chip, active && ui.chipActive]}
                onPress={() => setFilterStatus(st)}
              >
                <Text style={[ui.chipText, active && ui.chipTextActive]}>{st}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={ui.listPad}
        refreshing={loading}
        onRefresh={loadOrders}
        ListEmptyComponent={<EmptyState icon="📦" title="Chưa có đơn hàng nào!" />}
      />
    </View>
  );
};

export default OrderManager;

const styles = StyleSheet.create({
  refreshText: { fontSize: 16 },
  filterBar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 8 },
  filterScroll: { paddingHorizontal: 12 },
  orderCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10, marginBottom: 10 },
  orderIdText: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  dateText: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '700' },
  customerBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 12, gap: 4 },
  customerInfoText: { fontSize: 13, color: '#334155' },
  boldText: { fontWeight: '700', color: '#0F172A' },
  itemsSection: { marginBottom: 10 },
  itemsTitle: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
  emptyItemsText: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10, marginBottom: 10 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#475569' },
  totalValue: { fontSize: 17, fontWeight: '800', color: '#EF4444' },
  actionSection: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  actionTitle: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  statusButtonGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusSelectBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },
  statusSelectBtnCurrent: { backgroundColor: '#1E293B', borderColor: '#0F172A' },
  statusSelectBtnText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  statusSelectBtnTextCurrent: { color: '#38BDF8', fontWeight: '700' },
});
