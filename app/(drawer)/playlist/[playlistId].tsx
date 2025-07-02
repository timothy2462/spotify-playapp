import TrackCard from '@/components/TrackCard';
import { usePlaylist } from '@/context/playlistContextProvider';
import { useSpotify } from '@/context/spotifyContextProvider';
import tw from '@/lib';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface RecommendedPlaylist {
  id: string;
  name: string;
  image?: string;
  images?: Array<{ url: string }>;
  tracks?: any[];
}

type RootStackParamList = {
  playlist: {
    playlistId: string;
    isLocal: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

type PlaylistNavigationProp = NativeStackNavigationProp<RootStackParamList, 'playlist'>;

export default function PlaylistDetailScreen() {
  const { playlistId, isLocal } = useLocalSearchParams();
  const { accessToken } = useSpotify();
  const { playlists } = usePlaylist();
  const navigation = useNavigation<PlaylistNavigationProp>();
  const [tracks, setTracks] = useState<any[]>([]);
  const [playlistInfo, setPlaylistInfo] = useState<any>(null);
  const [recommendedPlaylists, setRecommendedPlaylists] = useState<RecommendedPlaylist[]>([]);

  useEffect(() => {
    const fetchPlaylist = async () => {
      const selected = playlists.find((p) => p.id === playlistId);

      if (!selected) {
        setPlaylistInfo(null);
        setTracks([]);
        return;
      }

      setPlaylistInfo(selected);

      if (isLocal === 'true') {
        setTracks(selected.tracks || []);
      } else {
        try {
          const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = await res.json();
          setTracks(data.items.map((item: any) => item.track));
        } catch (err) {
          console.error('Failed to load playlist tracks:', err);
        }
      }
    };
    fetchPlaylist();
  }, [playlistId, playlists]);

  useEffect(() => {
    const recommended = playlists
      .filter(p => p.id !== playlistId)
      .slice(0, 6);
    setRecommendedPlaylists(recommended);
  }, [playlists, playlistId]);

  const renderRecommendedItem = ({ item }: { item: RecommendedPlaylist }) => (
    <TouchableOpacity 
      style={tw`w-35 mr-4`}
      onPress={() => navigation.navigate('playlist', { 
        playlistId: item.id, 
        isLocal: !item.images ? 'true' : 'false' 
      })}
    >
      <Image
        source={{ 
          uri: item.images?.[0]?.url || item.image || 'https://via.placeholder.com/120' 
        }}
        style={tw`w-35 h-35 rounded-lg mb-2`}
      />
      <Text style={tw`text-white text-sm font-semibold mb-1 leading-5`} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={tw`text-gray-400 text-xs`}>
        {item.tracks?.length || 0} songs
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {playlistInfo && (
        <ImageBackground
          source={{ 
            uri: playlistInfo.images?.[0]?.url || playlistInfo.image || 'https://via.placeholder.com/400' 
          }}
          style={tw`w-[${screenWidth}px] h-100 justify-end`}
          blurRadius={50}
        >
          <View style={tw`bg-black/40 flex-1 pt-[${StatusBar.currentHeight || 44}px]`}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={tw`absolute top-[${(StatusBar.currentHeight || 44) + 10}px] left-4 z-10 bg-black/50 rounded-full p-2`}
            >
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            
            <View style={tw`items-center px-5 pb-7 flex-1 justify-center`}>
              <Image
                source={{ 
                  uri: playlistInfo.images?.[0]?.url || playlistInfo.image || 'https://via.placeholder.com/200' 
                }}
                style={tw`w-50 h-50 rounded-xl mb-5 shadow-lg shadow-black`}
              />
              <Text style={tw`text-white text-2xl font-bold text-center mb-2`}>
                {playlistInfo.name}
              </Text>
              <Text style={tw`text-white/80 text-base text-center mb-6`}>
                {tracks.length} songs • Made for you
              </Text>
              
              <View style={tw`flex-row items-center gap-5`}>
                <TouchableOpacity style={tw`bg-spotify-green w-14 h-14 rounded-full justify-center items-center shadow-lg shadow-spotify-green/30`}>
                  <Ionicons name="play" size={32} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={tw`bg-white/20 w-12 h-12 rounded-full justify-center items-center`}>
                  <Ionicons name="shuffle" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={tw`bg-white/20 w-12 h-12 rounded-full justify-center items-center`}>
                  <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      )}

      <View style={tw`px-4 py-5 bg-background`}>
        <Text style={tw`text-white text-xl font-bold`}>Songs</Text>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={tw`bg-background`}>
      {recommendedPlaylists.length > 0 && (
        <View style={tw`pt-8 pb-5`}>
          <Text style={tw`text-white text-xl font-bold px-4 mb-4` }>You might also like</Text>
          <FlatList
            data={recommendedPlaylists}
            renderItem={renderRecommendedItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`px-4 gap-4`}
          />
        </View>
      )}
      
      <View style={tw`h-25`} />
    </View>
  );

  return (
    <View style={tw`flex-1 bg-background`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <FlatList
        data={tracks}
        keyExtractor={(item, index) => item?.id || index.toString()}
        renderItem={({ item, index }) => (
          <TrackCard track={item} number={index + 1} showNumber />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={tw`items-center py-15 px-8`}>
            <Ionicons name="musical-notes-outline" size={48} color="#666" />
            <Text style={tw`text-white text-lg font-semibold mt-4 text-center`}>No tracks in this playlist</Text>
            <Text style={tw`text-gray-400 text-sm mt-2 text-center`}>Add some songs to get started</Text>
          </View>
        }
        style={tw`flex-1`}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}