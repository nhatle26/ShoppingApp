import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { OrderItem } from './database';
import { ui } from './uiStyles';

export const DEFAULT_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

export const getImgUri = (uri?: string) =>
  uri && (uri.startsWith('http') || uri.startsWith('file')) ? uri : DEFAULT_IMG;

export const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

export const pickImageUri = (onPicked: (uri: string) => void) => {
  launchImageLibrary({ mediaType: 'photo' }, (res) => {
    if (res.assets?.[0]?.uri) onPicked(res.assets[0].uri);
  });
};

export const NavBar: React.FC<{
  title: string;
  onBack?: () => void;
  backText?: string;
  dark?: boolean;
  right?: React.ReactNode;
}> = ({ title, onBack, backText = '◀ Quay lại', dark, right }) => (
  <View style={dark ? ui.darkBar : ui.navBar}>
    {onBack ? (
      <TouchableOpacity
        style={dark ? ui.darkBackBtn : ui.backBtn}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Text style={dark ? ui.darkBackText : ui.backText}>{backText}</Text>
      </TouchableOpacity>
    ) : (
      <View style={dark ? ui.darkSpace : ui.navSpace} />
    )}
    <Text style={dark ? ui.darkTitle : ui.navTitle} numberOfLines={1}>
      {title}
    </Text>
    {right ?? <View style={dark ? ui.darkSpace : ui.navSpace} />}
  </View>
);

export const PasswordField: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}> = ({ value, onChangeText, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <View style={ui.passwordRow}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={ui.passwordInput}
        secureTextEntry={!show}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity style={ui.eyeBtn} onPress={() => setShow(!show)}>
        <Text style={ui.eyeText}>{show ? '🙈' : '👁️'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export const EmptyState: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon, title, subtitle, actionLabel, onAction }) => (
  <View style={ui.emptyBox}>
    <Text style={ui.emptyEmoji}>{icon}</Text>
    <Text style={ui.emptyTitle}>{title}</Text>
    {subtitle && <Text style={ui.emptySub}>{subtitle}</Text>}
    {actionLabel && onAction && (
      <TouchableOpacity style={[ui.btnPrimary, ui.actionBtnPad]} onPress={onAction}>
        <Text style={ui.btnPrimaryText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const OrderItemList: React.FC<{ items?: OrderItem[] }> = ({ items }) => (
  <>
    {items?.map((prod, idx) => (
      <View key={idx} style={ui.orderProdRow}>
        <Image source={{ uri: getImgUri(prod.productImg) }} style={ui.orderProdImg} />
        <View style={ui.orderProdMeta}>
          <Text style={ui.orderProdName} numberOfLines={1}>
            {prod.productName}
          </Text>
          <Text style={ui.orderProdSub}>
            {prod.quantity} × {formatPrice(prod.productPrice)}
          </Text>
        </View>
        <Text style={ui.orderProdTotal}>{formatPrice(prod.quantity * prod.productPrice)}</Text>
      </View>
    ))}
  </>
);
