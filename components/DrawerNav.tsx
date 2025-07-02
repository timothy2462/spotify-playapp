import { IMAGES } from '@/constants/images';
import { COLORS } from '@/constants/theme';
import { useSpotify } from '@/context/spotifyContextProvider';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CustomDrawerContent({ navigation }: DrawerContentComponentProps) {
  const { user, logout } = useSpotify();

  return (
    <View style={styles.container}>
      <Image
        source={user?.images?.[0]?.url ? { uri: user.images[0].url } : IMAGES.defaultAvatar}
        style={styles.avatar}
      />
      <Text style={styles.username}>Hi {user?.display_name || 'Guest'}</Text>

      <View style={styles.menuSection}>
        <DrawerItem icon="person-add" label="Add Account" onPress={() => {}} />
        <DrawerItem icon="gift" label="What's New" onPress={() => {}} />
        <DrawerItem icon="time-outline" label="Recents" onPress={() => {}} />
        <DrawerItem icon="settings" label="Settings" onPress={() => {}} />
        <DrawerItem icon="shield-outline" label="Privacy" onPress={() => {}} />
      </View>

      <View style={styles.footer}>
        <DrawerItem icon="log-out-outline" label="Logout" onPress={logout} />
        <DrawerItem icon="close" label="Close" onPress={() => navigation.closeDrawer()} />
      </View>
    </View>
  );
}

const DrawerItem = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Ionicons name={icon} size={26} color={COLORS.white} />
    <Text style={styles.itemText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 24,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 12,
  },
  username: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 36,
  },
  menuSection: {
    gap: 20,
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 24,
    gap: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemText: {
    marginLeft: 16,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '500',
  },
});
