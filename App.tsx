import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import HomeScreen from './app/(drawer)/(tabs)';
import CustomDrawerContent from './components/DrawerNav';

import LoginScreen from './app/login';
import { DrawerParamList } from './types';

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{ headerShown: false }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Login" component={LoginScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}