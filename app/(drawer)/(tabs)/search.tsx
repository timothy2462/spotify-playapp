import ArtistCard from '@/components/ArtistCard';
import BackgroundScreen from '@/components/BackgroundScreen';
import PlaylistModal from '@/components/PlaylistModal';
import TrackCard from '@/components/TrackCard';
import { IMAGES } from '@/constants/images';
import { useSpotify } from '@/context/spotifyContextProvider';
import tw from '@/lib';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SearchScreen() {
  const { user, searchTracks, searchResults } = useSpotify();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        searchTracks(query);
        if (!recentSearches.includes(query)) {
          setRecentSearches((prev) => [query, ...prev.slice(0, 9)]);
        }
        setShowSearchResults(true);
      } else {
        setShowSearchResults(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  const clearRecent = () => setRecentSearches([]);
  const removeRecent = (term: string) =>
    setRecentSearches((prev) => prev.filter((t) => t !== term));

  const openPlaylistModal = (track: any) => {
    setSelectedTrack(track);
    setModalVisible(true);
  };

  return (
    <BackgroundScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={tw`flex-row items-center mb-5`}>
          {user?.images?.[0]?.url && (
            <Image 
              source={{ uri: user.images[0].url }} 
              style={tw`w-8 h-8 rounded-full mr-2.5`} 
            />
          )}
          <Text style={tw`text-white text-2xl font-bold`}>Search</Text>
        </View>

        <View style={tw`flex-row bg-white rounded-lg items-center px-3 mb-6`}>
          <Ionicons name="search" size={20} color="#999" style={tw`mr-2`} />
          <TextInput
            placeholder="What do you want to listen to?"
            placeholderTextColor="#999"
            style={tw`flex-1 h-10 text-background`}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setShowSearchResults(true)}
          />
          {showSearchResults && (
            <TouchableOpacity onPress={() => { setQuery(''); setShowSearchResults(false); }}>
              <Text style={tw`text-primary font-semibold`}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {showSearchResults ? (
          <>
            {recentSearches.length > 0 && (
              <View style={tw`mb-5`}>
                <View style={tw`flex-row justify-between items-center mb-2.5`}>
                  <Text style={tw`text-white text-lg font-semibold`}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecent}>
                    <Text style={tw`text-primary`}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((item) => (
                  <View key={item} style={tw`flex-row justify-between items-center py-1.5 border-b border-gray-800`}>
                    <TouchableOpacity onPress={() => setQuery(item)}>
                      <Text style={tw`text-white`}>{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeRecent(item)}>
                      <Ionicons name="close" size={16} color="#aaa" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {searchResults.length > 0 && (
              <View style={tw`mb-6`}>
                <Text style={tw`text-white text-lg font-semibold mb-3`}>Search Results</Text>
                {searchResults.map((item) =>
                  item.type === 'track' ? (
                    <TrackCard 
                      key={item.id} 
                      track={item} 
                      onAddToPlaylist={() => openPlaylistModal(item)} 
                      showEllipsis
                    />
                  ) : (
                    <ArtistCard key={item.id} artist={item} />
                  )
                )}
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={tw`text-white text-lg font-semibold mb-3`}>Picked for you</Text>
            <View style={tw`flex-row items-center bg-surface rounded-lg p-2.5 mb-6 relative`}>
              <Image source={IMAGES.kpop} style={tw`w-20 h-20 rounded`} />
              <View style={tw`flex-1 ml-3`}>
                <Text style={tw`text-white text-xs mb-0.5`}>Playlist</Text>
                <Text style={tw`text-white text-base font-bold`}>K-Pop Gaming</Text>
                <Text style={tw`text-muted text-xs`}>Enjoy fantastic gameplay with k-pop music!</Text>
              </View>
              <TouchableOpacity style={tw`w-8 h-8 bg-primary rounded-full justify-center items-center absolute right-2.5 bottom-2.5`}>
                <Ionicons name="play" size={18} color={tw.color('background')} />
              </TouchableOpacity>
            </View>

            <Text style={tw`text-white text-lg font-semibold mb-3`}>Explore your genres</Text>
            <View style={tw`flex-row justify-between gap-3 mb-6`}>
              <View style={tw`flex-1`}>
                <Image source={IMAGES.cozy} style={tw`w-full h-40 rounded-lg`} />
                <Text style={tw`text-white mt-1.5 text-xs font-dm-sans`}>#cozy</Text>
              </View>
              <View style={tw`flex-1`}>
                <Image source={IMAGES.korean} style={tw`w-full h-40 rounded-lg`} />
                <Text style={tw`text-white mt-1.5 text-xs font-dm-sans`}>#korean indie</Text>
              </View>
              <View style={tw`flex-1`}>
                <Image source={IMAGES.healing} style={tw`w-full h-40 rounded-lg`} />
                <Text style={tw`text-white mt-1.5 text-xs font-dm-sans`}>#healing</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <PlaylistModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        track={selectedTrack}
      />
    </BackgroundScreen>
  );
}