import BackgroundScreen from '@/components/BackgroundScreen';
import { IMAGES } from '@/constants/images';
import { COLORS, FONTS } from '@/constants/theme';
import { useSpotify } from '@/context/spotifyContextProvider';
import tw from '@/lib';
import { SpotifyItem } from '@/types';
import { formatFollowers, getImageUrl, safeFetch, truncateText } from '@/utils/helpers';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type RootDrawerParamList = {
  '(tabs)': undefined;
};


const categories = ['All', 'Music', 'Podcasts', 'Made for you', 'New releases', 'Pop', 'Hip-Hop', 'Rock'];

const HomeScreen = () => {
  const { user, accessToken } = useSpotify();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [userPlaylists, setUserPlaylists] = useState<SpotifyItem[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyItem[]>([]);
  const [newReleases, setNewReleases] = useState<SpotifyItem[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyItem[]>([]);
  const [allNewReleases, setAllNewReleases] = useState<SpotifyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failedSections, setFailedSections] = useState<string[]>([]);
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };


  // Fetch extended new releases (50 items for fallback data)
  const fetchAllNewReleases = async () => {
    if (!accessToken) return;
    
    try {
      const data = await safeFetch('https://api.spotify.com/v1/browse/new-releases?limit=50', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const releases = data.albums?.items || [];
      setAllNewReleases(releases);
      return releases;
    } catch (error) {
      console.error('Failed to fetch all new releases:', error);
      return [];
    }
  };

  // Fetch user's playlists
  const fetchUserPlaylists = async () => {
    if (!accessToken) return;
    
    try {
      const data = await safeFetch('https://api.spotify.com/v1/me/playlists?limit=6', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUserPlaylists(data.items || []);
    } catch (error) {
      console.error('Failed to fetch user playlists:', error);
      setFailedSections(prev => [...prev, 'userPlaylists']);
    }
  };

  const fetchRecentlyPlayed = async (fallbackData: SpotifyItem[]) => {
    if (!accessToken) return;
    
    try {
      const data = await safeFetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      const uniqueItems = data.items?.reduce((acc: SpotifyItem[], item: any) => {
        const track = item.track;
        const existing = acc.find(a => a.id === track.id);
        if (!existing) {
          acc.push({
            id: track.id,
            name: track.name,
            images: track.album?.images || [],
            type: 'track',
            artists: track.artists || [],
          });
        }
        return acc;
      }, []).slice(0, 5) || [];
      
      setRecentlyPlayed(uniqueItems);
    } catch (error) {
      console.error('Failed to fetch recently played:', error);
      setFailedSections(prev => [...prev, 'recentlyPlayed']);
      const fallbackTracks = fallbackData.slice(0, 5).map(album => ({
        ...album,
        type: 'track',
        artists: album.artists || []
      }));
      setRecentlyPlayed(fallbackTracks);
    }
  };



  // Fetch new releases
  const fetchNewReleases = async () => {
    if (!accessToken) return;
    
    try {
      const data = await safeFetch('https://api.spotify.com/v1/browse/new-releases?limit=5', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setNewReleases(data.albums?.items || []);
    } catch (error) {
      console.error('Failed to fetch new releases:', error);
      setFailedSections(prev => [...prev, 'newReleases']);
    }
  };

  // Fetch user's top artists with fallback
  const fetchTopArtists = async (fallbackData: SpotifyItem[]) => {
    if (!accessToken) return;
    
    try {
      const data = await safeFetch('https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=5', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTopArtists(data.items || []);
    } catch (error) {
      console.error('Failed to fetch top artists:', error);
      setFailedSections(prev => [...prev, 'topArtists']);
      // Use fallback data (extract artists from albums)
      const fallbackArtists = fallbackData.slice(13, 18).map(album => ({
        id: album.artists?.[0]?.id || album.id,
        name: album.artists?.[0]?.name || album.name,
        images: album.images,
        type: 'artist',
        followers: { total: Math.floor(Math.random() * 1000000) + 100000 }, // Mock followers
        genres: ['Pop', 'Rock', 'Hip-Hop']
      }));
      setTopArtists(fallbackArtists);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!accessToken) return;
      
      setIsLoading(true);
      setFailedSections([]);
      
      const fallbackData = await fetchAllNewReleases();
      
      // Fetch data with delays to avoid rate limiting
      const fetchWithDelay = async (fetchFn: () => Promise<void>, delay: number) => {
        await new Promise(resolve => setTimeout(resolve, delay));
        await fetchFn();
      };

      try {
        await Promise.allSettled([
          fetchUserPlaylists(),
          fetchWithDelay(() => fetchRecentlyPlayed(fallbackData), 100),
          fetchWithDelay(fetchNewReleases, 300),
          fetchWithDelay(() => fetchTopArtists(fallbackData), 400),
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      
      setIsLoading(false);
    };

    fetchAllData();
  }, [accessToken]);

 

  // Section component for horizontal scrolling
  const HorizontalSection = ({ title, data, renderItem, showSeeAll = true, isFallback = false }: any) => (
    <View style={tw`mb-6`}>
      <View style={tw`flex-row justify-between items-center mb-3 px-4`}>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-white text-xl font-bold`}>{title}</Text>
      
        </View>
        {showSeeAll && (
          <TouchableOpacity>
            <Text style={tw`text-gray-400 text-sm font-medium`}>See all</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-4`}
        ItemSeparatorComponent={() => <View style={tw`w-4`} />}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );

  if (isLoading) {
    return (
      <BackgroundScreen>
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </BackgroundScreen>
    );
  }

  return (
    <BackgroundScreen>
      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {/* Header with categories */}
        <View style={tw`mb-4 px-4`}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`items-center pr-4`}
          >
            <TouchableOpacity 
              onPress={openDrawer}
              style={tw`mr-4`}
            >
              <Image 
                source={user?.images?.[0]?.url ? { uri: user.images[0].url } : IMAGES.defaultAvatar} 
                style={tw`w-10 h-10 rounded-full`}
              />
            </TouchableOpacity>

            {categories.map(cat => {
              const isActive = cat === activeCategory;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    tw`mr-2 py-1.5 px-3 rounded-full`,
                    isActive ? tw`bg-primary` : tw`bg-surface`,
                  ]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text
                    style={[
                      tw`text-sm font-dm-sans`,
                      isActive ? tw`text-background` : tw`text-white`,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

       

        {/* Quick access playlists grid */}
        {userPlaylists.length > 0 && (
          <View style={tw`px-4 mb-6`}>
            <View style={tw`flex-row flex-wrap justify-between`}>
              {userPlaylists.slice(0, 6).map(playlist => (
                <TouchableOpacity 
                  key={playlist.id} 
                  style={[tw`w-[48%] bg-surface mb-3 rounded-lg p-0.5 flex-row items-center`, { maxWidth: '48%' }]}
                >
                  <Image 
                    source={getImageUrl(playlist.images, IMAGES.defaultAvatar)} 
                    style={tw`w-14 h-14 mr-2 rounded`} 
                  />
                  <Text 
                    style={[tw`text-white text-sm flex-shrink`, { fontFamily: FONTS.dmSans }]}
                    numberOfLines={2}
                  >
                    {truncateText(playlist.name, 20)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        
        {/* Recommended stations */}
        {newReleases.length > 0 && (
          <HorizontalSection
            title="Recommended Stations"
            data={newReleases}
            renderItem={({ item }: { item: SpotifyItem }) => (
              <TouchableOpacity style={tw`w-32`}
              >
                <Image 
                  source={getImageUrl(item.images, IMAGES.trending1)} 
                  style={tw`w-32 h-32 rounded-lg mb-2`} 
                />
                <Text 
                  style={tw`text-white text-sm font-semibold`}
                  numberOfLines={1}
                >
                  {truncateText(item.name, 15)}
                </Text>
                {item.artists && item.artists.length > 0 && (
                  <Text 
                    style={tw`text-gray-400 text-xs mt-1`}
                    numberOfLines={1}
                  >
                    {item.artists[0]?.name}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        )}

      
         {/* Popular Artists */}
        {topArtists.length > 0 && (
          <HorizontalSection
            title="Popular artists"
            data={topArtists}
            isFallback={failedSections.includes('topArtists')}
            renderItem={({ item }: { item: SpotifyItem }) => (
              <TouchableOpacity style={tw`w-32 items-center`}
              onPress={()=>{
                   router.push(`/artist/${item.id}`);
              }}
              >
                <Image 
                  source={getImageUrl(item.images, IMAGES.defaultAvatar)} 
                  style={tw`w-32 h-32 rounded-full mb-2`} 
                />
                <Text 
                  style={tw`text-white text-sm font-semibold text-center`}
                  numberOfLines={1}
                >
                  {truncateText(item.name, 15)}
                </Text>
                {item.followers && (
                  <Text 
                    style={tw`text-gray-400 text-xs mt-1 text-center`}
                    numberOfLines={1}
                  >
                    {formatFollowers(item.followers.total)} followers
                  </Text>
                )}
              
              </TouchableOpacity>
            )}
          />
        )}

  {/* Recently Played Section */}
        {recentlyPlayed.length > 0 && (
          <HorizontalSection
            title="Recently played"
            data={recentlyPlayed}
            isFallback={failedSections.includes('recentlyPlayed')}
            renderItem={({ item }: { item: SpotifyItem }) => (
              <TouchableOpacity style={tw`w-32`}
              >
                <Image 
                  source={getImageUrl(item.images, IMAGES.defaultAvatar)} 
                  style={tw`w-32 h-32 rounded-lg mb-2`} 
                />
                <Text 
                  style={tw`text-white text-sm font-semibold`}
                  numberOfLines={1}
                >
                  {truncateText(item.name, 15)}
                </Text>
                {item.artists && item.artists.length > 0 && (
                  <Text 
                    style={tw`text-gray-400 text-xs mt-1`}
                    numberOfLines={1}
                  >
                    {item.artists[0]?.name}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        )}



         {newReleases.length > 0 && (
          <HorizontalSection
            title="New releases for you"
            data={newReleases}
            renderItem={({ item }: { item: SpotifyItem }) => (
              <TouchableOpacity style={tw`w-32`}
              >
                <Image 
                  source={getImageUrl(item.images, IMAGES.trending1)} 
                  style={tw`w-32 h-32 rounded-lg mb-2`} 
                />
                <Text 
                  style={tw`text-white text-sm font-semibold`}
                  numberOfLines={1}
                >
                  {truncateText(item.name, 15)}
                </Text>
                {item.artists && item.artists.length > 0 && (
                  <Text 
                    style={tw`text-gray-400 text-xs mt-1`}
                    numberOfLines={1}
                  >
                    {item.artists[0]?.name}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>
    </BackgroundScreen>
  );
};

export default HomeScreen;
