import BackgroundScreen from "@/components/BackgroundScreen";
import { IMAGES } from "@/constants/images";
import { usePlaylist } from "@/context/playlistContextProvider";
import { useSpotify } from "@/context/spotifyContextProvider";
import tw from "@/lib";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface PlaylistItem {
  id: string;
  name: string;
  description?: string;
  isLocal?: boolean;
  images?: Array<{ url: string }>;
  image?: string;
  tracks?: {
    length?: number;
    total?: number;
  };
}

export default function LibraryScreen() {
  const { playlists, fetchPlaylists, createPlaylist } = usePlaylist();
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const router = useRouter();

  const filters = ["All", "Playlists", "Artists", "Albums", "Downloaded"];
  const { user } = useSpotify();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreate = async () => {
    if (!playlistName.trim()) return;
    setCreating(true);
    await createPlaylist(playlistName);
    setPlaylistName("");
    setModalVisible(false);
    setCreating(false);
  };

  const renderHeader = () => (
    <View style={tw`px-4 pt-[10px] pb-2 bg-background`}>
      <View style={tw`flex-row justify-between items-center mb-6`}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={
              user?.images?.[0]?.url
                ? { uri: user.images[0].url }
                : IMAGES.defaultAvatar
            }
            style={styles.avatar}
          />
          <Text style={tw`text-white text-2xl font-bold font-dm-sans`}>
            Your Library
          </Text>
        </View>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity
            style={tw`p-2`}
            onPress={() => setModalVisible(true)}
          >
            <Text style={tw`text-white text-4xl`}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`mb-4`}>
        <TouchableOpacity style={tw`flex-row items-center py-2 mb-1`}>
          <View
            style={tw`w-14 h-14 bg-[#282828] rounded justify-center items-center mr-3`}
          >
            <Text style={tw`text-white text-lg`}>↓</Text>
          </View>
          <Text style={tw`text-white text-base font-dm-sans`}>Downloaded</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`flex-row items-center py-2 mb-1`}>
          <View
            style={tw`w-14 h-14 bg-[#282828] rounded justify-center items-center mr-3`}
          >
            <Text style={tw`text-white text-lg`}>♥</Text>
          </View>
          <Text style={tw`text-white text-base font-dm-sans`}>Liked Songs</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`mb-4 h-10`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-4`}
        >
          {filters.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                tw`px-4 py-2 rounded-full mr-2 bg-[#282828]`,
                selectedFilter === item && tw`bg-primary`,
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text
                style={[
                  tw`text-white text-sm font-dm-sans`,
                  selectedFilter === item && tw`text-background font-semibold`,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={tw`flex-row justify-between items-center mb-2`}>
        <TouchableOpacity style={tw`flex-row items-center`}>
          <Text style={tw`text-white text-base mr-2`}>⇅</Text>
          <Text style={tw`text-white text-sm font-dm-sans`}>
            Recently added
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`p-2`}>
          <Text style={tw`text-white text-base`}>☰</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPlaylistCard = ({ item }: { item: PlaylistItem }) => {
    const isLocal = !!item.isLocal;
    const imageUrl =
      item.images?.[0]?.url || item.image || "https://via.placeholder.com/56";
    const trackCount = item.tracks?.length || item.tracks?.total || 5;
    const description = item.description || `${trackCount} songs`;

    return (
      <TouchableOpacity
        style={tw`flex-row items-center px-4 py-3 min-h-[64px]`}
        onPress={() =>
          router.push({
            pathname: "/(drawer)/playlist/[playlistId]",
            params: { playlistId: item.id, isLocal: String(isLocal) },
          })
        }
      >
        <Image source={{ uri: imageUrl }} style={tw`w-14 h-14 rounded mr-3`} />
        <View style={tw`flex-1 justify-center`}>
          <Text
            style={tw`text-white text-base font-dm-sans font-medium mb-0.5`}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <View style={tw`flex-row items-center`}>
            {isLocal && <Text style={tw`text-primary text-xs mr-1`}>↓</Text>}
            <Text
              style={tw`text-[#A7A7A7] text-sm font-dm-sans`}
              numberOfLines={1}
            >
              {description}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={tw`p-2`}>
          <Text style={tw`text-[#A7A7A7] text-xl`}>⋯</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundScreen>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylistCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={tw`flex-1 justify-center items-center px-8 pt-20`}>
            <Text style={tw`text-white text-xl font-bold text-center mb-2`}>
              Start building your library
            </Text>
            <Text
              style={tw`text-[#A7A7A7] text-base text-center mb-6 leading-[22px]`}
            >
              Create your first playlist or follow your first artist
            </Text>
            <TouchableOpacity
              style={tw`bg-white px-8 py-3 rounded-full`}
              onPress={() => setModalVisible(true)}
            >
              <Text
                style={tw`text-background text-base font-semibold font-dm-sans`}
              >
                Create playlist
              </Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
        style={tw`flex-1 bg-background`}
        contentContainerStyle={
          playlists.length === 0 ? tw`flex-grow justify-center` : undefined
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={tw`flex-1 bg-black/80 justify-end`}>
          <View style={tw`bg-[#282828] min-h-[400px] rounded-t-4`}>
            <View
              style={tw`flex-row justify-between items-center px-4 pt-5 pb-4 border-b border-[#404040]`}
            >
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={tw`text-[#A7A7A7] text-base font-dm-sans`}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={tw`text-white text-lg font-semibold font-dm-sans`}>
                Create playlist
              </Text>
              <View style={tw`w-15`} />
            </View>

            <View style={tw`p-6 items-center`}>
              <View
                style={tw`w-[200px] h-[200px] bg-[#404040] rounded-lg justify-center items-center mb-8`}
              >
                <Text style={tw`text-5xl opacity-60`}>🎵</Text>
              </View>

              <TextInput
                placeholder="Give your playlist a title"
                value={playlistName}
                onChangeText={setPlaylistName}
                style={tw`w-full bg-[#404040] text-white text-base px-4 py-4 rounded-lg mb-6 text-center font-dm-sans`}
                placeholderTextColor="#888"
                autoFocus
              />

              <TouchableOpacity
                onPress={handleCreate}
                disabled={creating || !playlistName.trim()}
                style={[
                  tw`w-full py-4 rounded-full items-center`,
                  !playlistName.trim() || creating
                    ? tw`bg-[#404040]`
                    : tw`bg-white`,
                ]}
              >
                <Text
                  style={[
                    tw`text-base font-semibold font-dm-sans`,
                    !playlistName.trim() || creating
                      ? tw`text-[#808080]`
                      : tw`text-background`,
                  ]}
                >
                  {creating ? "Creating..." : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 35, 
    marginBottom: 12,
    marginRight: 12
  },
});