import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import Header from '../../components/Header';
import CartScreen from './CartScreen';
import CheckoutScreen from './CheckoutScreen';
import OrderHistoryScreen from './OrderHistoryScreen';
import ProfileScreen from './ProfileScreen';
import ProductDetailScreen from './ProductDetailScreen';
import CategorySelector from '../../components/CategorySelector';
import {
  fetchProducts,
  fetchCategories,
  addToCart,
  getCartItems,
  Product,
  Category,
  User,
} from '../../database/database';
import { EmptyState, getImgUri, formatPrice } from '../../components/shared';

interface Props {
  currentUser: User | null;
  onLogout: () => void;
  onNavigateToAdminHome?: () => void;
  onUserUpdated?: (user: User) => void;
  activeSubView?: UserSubView;
  onSubViewChange?: (view: UserSubView) => void;
}

export type UserSubView =
  | 'home'
  | 'cart'
  | 'checkout'
  | 'history'
  | 'profile'
  | 'detail';
type HomeSubNav = 'home' | 'category';

const PRICE_FILTERS = [
  { label: 'Tất cả giá', min: 0, max: Infinity },
  { label: '< 300.000 đ', min: 0, max: 300000 },
  { label: '300k - 700k', min: 300000, max: 700000 },
  { label: '700k - 1.5 triệu', min: 700000, max: 1500000 },
  { label: '> 1.5 triệu', min: 1500000, max: Infinity },
];

const BANNER_IMG =
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000';

const UserHomeScreen: React.FC<Props> = ({
  currentUser,
  onLogout,
  onNavigateToAdminHome,
  onUserUpdated,
  activeSubView,
  onSubViewChange,
}) => {
  const [internalSubView, setInternalSubView] = useState<UserSubView>('home');
  const subView = activeSubView ?? internalSubView;
  const setSubView = (view: UserSubView) => {
    setInternalSubView(view);
    onSubViewChange?.(view);
  };
  const [homeNav, setHomeNav] = useState<HomeSubNav>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [selectedPriceFilter, setSelectedPriceFilter] = useState(
    PRICE_FILTERS[0],
  );
  const [keyword, setKeyword] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    if (!currentUser) {
      setCartCount(0);
      return;
    }
    const items = await getCartItems(currentUser.id);
    setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
  }, [currentUser]);

  useEffect(() => {
    (async () => {
      setCategories(await fetchCategories());
      setProducts(await fetchProducts());
    })();
    refreshCartCount();
  }, [currentUser, refreshCartCount]);

  const handleAddToCart = async (product: Product) => {
    if (!currentUser) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!',
      );
      return;
    }
    const ok = await addToCart(currentUser.id, product.id, 1);
    if (ok) {
      await refreshCartCount();
      Alert.alert('Thành công', `Đã thêm "${product.name}" vào giỏ hàng!`);
    } else {
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng!');
    }
  };

  if (subView === 'detail' && selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        currentUser={currentUser}
        onBack={() => {
          setSelectedProduct(null);
          setSubView('home');
        }}
        onCartUpdated={refreshCartCount}
        onGoToCart={() => {
          setSelectedProduct(null);
          setSubView('cart');
        }}
      />
    );
  }

  if (subView === 'cart') {
    return (
      <CartScreen
        currentUser={currentUser}
        onBack={() => {
          setSubView('home');
          refreshCartCount();
        }}
        onCheckout={() => setSubView('checkout')}
        onCartUpdated={refreshCartCount}
      />
    );
  }

  if (subView === 'checkout') {
    return (
      <CheckoutScreen
        currentUser={currentUser}
        onBack={() => setSubView('cart')}
        onOrderSuccess={() => {
          refreshCartCount();
          setSubView('history');
        }}
      />
    );
  }

  if (subView === 'history') {
    return (
      <OrderHistoryScreen
        currentUser={currentUser}
        onBack={() => setSubView('home')}
      />
    );
  }

  if (subView === 'profile') {
    return (
      <ProfileScreen
        currentUser={currentUser}
        onBack={() => setSubView('home')}
        onUserUpdated={u => onUserUpdated?.(u)}
      />
    );
  }

  const q = keyword.trim().toLowerCase();
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCatId === null || p.categoryId === selectedCatId;
    const matchText =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q);
    const matchPrice =
      p.price >= selectedPriceFilter.min && p.price <= selectedPriceFilter.max;
    return matchCat && matchText && matchPrice;
  });

  const hasFilter =
    selectedCatId !== null ||
    selectedPriceFilter.label !== 'Tất cả giá' ||
    keyword !== '';

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.85}
      onPress={() => {
        setSelectedProduct(item);
        setSubView('detail');
      }}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: getImgUri(item.img, `${item.categoryName || ''} ${item.name}`) }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText} numberOfLines={1}>
            {item.categoryName || 'Sản phẩm'}
          </Text>
        </View>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        <TouchableOpacity
          style={styles.addCartBtn}
          onPress={() => handleAddToCart(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.addCartBtnText}>+ Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const listHeaderElement = (
    <View style={styles.listHeaderWrapper}>
      {homeNav === 'category' ? (
        <View
          key="category-selector"
          collapsable={false}
          style={styles.categoryViewBox}
        >
          <CategorySelector
            categories={categories}
            selectedId={selectedCatId}
            onSelectCategory={setSelectedCatId}
          />
        </View>
      ) : (
        <View
          key="home-banner"
          collapsable={false}
          style={styles.bannerContainer}
        >
          <Image
            source={{ uri: BANNER_IMG }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View collapsable={false} style={styles.bannerOverlay}>
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>🔥 SIÊU SALE HÔM NAY</Text>
            </View>
            <Text style={styles.bannerHeading}>GIẢM GIÁ ĐẾN 50%</Text>
            <Text style={styles.bannerSubheading}>
              Freeship cho đơn hàng đầu tiên
            </Text>
          </View>
        </View>
      )}

      <View style={styles.priceFilterContainer}>
        <Text style={styles.priceFilterTitle}>💰 Giá:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.priceFilterScroll}
        >
          {PRICE_FILTERS.map(filter => {
            const active = selectedPriceFilter.label === filter.label;
            return (
              <TouchableOpacity
                key={filter.label}
                style={[styles.priceChip, active && styles.priceChipActive]}
                onPress={() => setSelectedPriceFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.priceChipText,
                    active && styles.priceChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.resultInfoBar}>
        <Text style={styles.resultInfoText}>
          Sản phẩm nổi bật (
          <Text style={styles.boldText}>{filteredProducts.length}</Text>)
          {selectedCatId !== null && ' • Theo danh mục'}
          {selectedPriceFilter.label !== 'Tất cả giá' &&
            ` • ${selectedPriceFilter.label}`}
        </Text>
        {hasFilter && (
          <TouchableOpacity
            onPress={() => {
              setSelectedCatId(null);
              setSelectedPriceFilter(PRICE_FILTERS[0]);
              setKeyword('');
            }}
          >
            <Text style={styles.resetFilterText}>Xóa lọc ↺</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header
        currentUser={currentUser}
        onLogout={onLogout}
        title="SHOPPING ONLINE"
        cartCount={cartCount}
        onCartPress={() => setSubView('cart')}
        onHistoryPress={() => setSubView('history')}
        onProfilePress={() => setSubView('profile')}
      />

      <View style={styles.stickyControls}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Tìm sản phẩm, danh mục..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              value={keyword}
              onChangeText={setKeyword}
            />
            {keyword !== '' && (
              <TouchableOpacity
                onPress={() => setKeyword('')}
                style={styles.clearSearchBtn}
              >
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {currentUser?.role === 'admin' && onNavigateToAdminHome && (
            <TouchableOpacity
              style={styles.adminShortcutBtn}
              onPress={onNavigateToAdminHome}
              activeOpacity={0.8}
            >
              <Text style={styles.adminShortcutText}>🛡️ Admin</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.navMenuBar}>
          {[
            { key: 'home' as HomeSubNav, label: '🏠 Trang chủ' },
            { key: 'category' as HomeSubNav, label: '📂 Danh mục sản phẩm' },
          ].map(tab => {
            const active = homeNav === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.navMenuItem, active && styles.navMenuItemActive]}
                onPress={() => setHomeNav(tab.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.navMenuText,
                    active && styles.navMenuTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.rowWrapper}
        contentContainerStyle={styles.gridContent}
        ListHeaderComponent={listHeaderElement}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="🔍"
            title="Không tìm thấy sản phẩm nào phù hợp!"
            subtitle="Vui lòng thử tìm kiếm hoặc điều chỉnh bộ lọc giá"
          />
        }
      />
    </View>
  );
};

export default UserHomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  stickyControls: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
  },
  searchIcon: { fontSize: 13, marginRight: 6 },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A', paddingVertical: 0 },
  clearSearchBtn: { padding: 4 },
  clearSearchText: { color: '#64748B', fontSize: 14, fontWeight: 'bold' },
  adminShortcutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminShortcutText: { color: '#DC2626', fontSize: 12, fontWeight: '700' },
  navMenuBar: { flexDirection: 'row', paddingHorizontal: 10 },
  navMenuItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  navMenuItemActive: { borderBottomColor: '#2563EB' },
  navMenuText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  navMenuTextActive: { color: '#2563EB', fontWeight: '700' },
  listHeaderWrapper: { marginBottom: 4 },
  categoryViewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bannerContainer: {
    height: 92,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  bannerImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  bannerTag: {
    backgroundColor: '#EF4444',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 3,
  },
  bannerTagText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  bannerHeading: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  bannerSubheading: { color: '#E2E8F0', fontSize: 11, marginTop: 1 },
  priceFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingLeft: 10,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceFilterTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginRight: 6,
  },
  priceFilterScroll: { paddingRight: 10, gap: 6 },
  priceChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  priceChipActive: { backgroundColor: '#10B981', borderColor: '#059669' },
  priceChipText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  priceChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  resultInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingTop: 8,
    paddingBottom: 4,
  },
  resultInfoText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  boldText: { fontWeight: '800', color: '#0F172A' },
  resetFilterText: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
  gridContent: { paddingHorizontal: 10, paddingBottom: 20 },
  rowWrapper: { justifyContent: 'space-between', marginBottom: 10 },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '48.6%',
    overflow: 'hidden',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 118,
    backgroundColor: '#E2E8F0',
  },
  productImage: { width: '100%', height: '100%' },
  catBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    maxWidth: '85%',
  },
  catBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  cardDetails: { padding: 9 },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    minHeight: 34,
    lineHeight: 17,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    marginVertical: 4,
  },
  addCartBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    marginTop: 2,
  },
  addCartBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
