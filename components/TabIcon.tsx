import { Image, StyleSheet } from 'react-native';

export default function TabIcon({ focused, activeIcon, inactiveIcon }: {
  focused: boolean,
  activeIcon: any,
  inactiveIcon: any,
}) {
  return (
    <Image
      source={focused ? activeIcon : inactiveIcon}
      style={styles.icon}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 26,
    height: 26,
  },
});