import TabIcon from "@/components/TabIcon";
import { IMAGES } from "@/constants/images";
import { COLORS } from "@/constants/theme";
import tw from "@/lib";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { Tabs, router } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Share, Text, TouchableOpacity, View } from "react-native";

type ModalItem = {
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: 'route' | 'share';
};

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState(false);

  const modalItems: ModalItem[] = [
    {
      title: "Playlist",
      desc: "Build a playlist with songs, or episodes",
      icon: "musical-notes-outline",
      action: 'route',
    },
    {
      title: "Collaborative Playlist",
      desc: "Invite friends and create something together",
      icon: "people-outline",
      action: 'route',
    },
    {
      title: "Blend",
      desc: "Combine tastes in a shared playlist with friends",
      icon: "sync-outline",
      action: 'share',
    },
  ];

  const handleItemPress = async (item: ModalItem) => {
    setModalVisible(false);
    
    if (item.action === 'route') {
      router.push('/(drawer)/(tabs)/explore');
    } else if (item.action === 'share' && item.title === 'Blend') {
      await handleBlendShare();
    }
  };

  const handleBlendShare = async () => {
    try {
      const inviteLink = 'exp://192.168.45.30:8081/blend/invite/12345'; 
      const shareMessage = `Join my music blend! ${inviteLink}`;
      
     
      const result = await Share.share({
        message: shareMessage,
        url: inviteLink, 
        title: 'Join my Blend',
      });

      if (result.action === Share.sharedAction) {
        console.log('Blend invite shared successfully');
      }
    } catch (error) {
      console.error('Error sharing blend invite:', error);
      await handleCopyToClipboard();
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const inviteLink = 'exp://192.168.45.30:8081/blend/invite/12345';
      await Clipboard.setStringAsync(inviteLink);
      Alert.alert('Copied!', 'Invite link copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy invite link');
    }
  };



  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: { backgroundColor: COLORS.background },
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 12, color: "white" },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                activeIcon={IMAGES.homeActive}
                inactiveIcon={IMAGES.homeInactive}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                activeIcon={IMAGES.searchActive}
                inactiveIcon={IMAGES.searchInactive}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Library",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                activeIcon={IMAGES.libraryActive}
                inactiveIcon={IMAGES.libraryInactive}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="premium"
          options={{
            title: "Premium",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                activeIcon={IMAGES.premiumActive}
                inactiveIcon={IMAGES.premiumInactive}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            tabBarButton: (props) => (
              <TouchableOpacity
                onPress={() => setModalVisible(!modalVisible)}
                style={tw`flex-1 items-center justify-center`}
              >
                <Ionicons
                  name={modalVisible ? "close" : "add"}
                  size={23}
                  color={modalVisible ? COLORS.white : COLORS.white}
                />
                <Text
                  style={tw`text-xs mt-1 mb-0 font-bold ${
                    modalVisible ? "text-white" : "text-white"
                  }`}
                >
                  Create
                </Text>
              </TouchableOpacity>
            ),
          }}
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();
            },
          })}
        />
      </Tabs>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black bg-opacity-70`}>
          <View style={tw`bg-[#121212] p-5 rounded-t-3xl`}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={tw`self-end mb-4`}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>

            {modalItems.map((item) => (
              <TouchableOpacity
                key={item.title}
                style={tw`flex-row items-start mb-5`}
                onPress={() => handleItemPress(item)}
              >
                <View style={tw`bg-[#2A2A2A] p-3 rounded-full mr-4`}>
                  <Ionicons name={item.icon} size={24} color="#ccc" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-white font-bold text-base`}>
                    {item.title}
                  </Text>
                  <Text style={tw`text-gray-400 text-sm`}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}