


import ArtistCard from '@/components/ArtistCard';
import { useSpotify } from '@/context/spotifyContextProvider';
import tw from '@/lib';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

type ArtistScreenProps = {
  artistId: string;
};

export default function ArtistScreen({ artistId }: ArtistScreenProps) {
  const { 
    accessToken, 
    getArtist, 
    getArtistTopTracks, 
    getArtistAlbums, 
    getRelatedArtists 
  } = useSpotify();
  const router = useRouter();

  const [artist, setArtist] = useState<any>(null);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [relatedArtists, setRelatedArtists] = useState<any[]>([]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchArtistData = async () => {
      try {
        const [artistRes, tracksRes, albumsRes, relatedRes] = await Promise.all([
          getArtist(artistId),
          getArtistTopTracks(artistId),
          getArtistAlbums(artistId),
          getRelatedArtists(artistId),
        ]);
    
        setArtist(artistRes);
        setTopTracks(tracksRes || []);
        setAlbums(albumsRes || []);
        setRelatedArtists(relatedRes || []);
      } catch (err) {
        console.error('Error loading artist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId, accessToken]);

  const handleShareTrack = async (track: any) => {
    try {
      // Generate a hardcoded share link (you can customize this URL structure)
      const shareUrl = `https://your-music-app.com/track/${track.id}`;
      
      const artistNames = track.artists?.map((artist: any) => artist.name).join(', ') || 'Unknown Artist';
      
      const shareMessage = `🎵 Check out "${track.name}" by ${artistNames}\n\nListen now: ${shareUrl}`;
      
      const result = await Share.share({
        message: shareMessage,
        url: shareUrl, 
        title: `${track.name} - ${artistNames}`,
      }, {
        dialogTitle: `Share "${track.name}"`,
        excludedActivityTypes: [
          
        ],
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared via:', result.activityType);
        } else {
          console.log('Track shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Share dialog was dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing track:', error);
     
    }
  };

  const TrackCardWithShare = ({ track, number }: { track: any; number: number }) => {
    const artistNames = track.artists?.map((artist: any) => artist.name).join(', ') || 'Unknown Artist';
    const popularity = Math.round((track.popularity / 100) * 1000000);

    return (
      <View style={tw`flex-row items-center px-4 py-2`}>
        <Text style={tw`text-gray-400 text-base font-semibold w-6 text-center mr-3`}>
          {number}
        </Text>
        
        <View style={tw`flex-1 flex-row items-center`}>
          {track.album?.images?.[0]?.url && (
            <Image 
              source={{ uri: track.album.images[0].url }} 
              style={tw`w-12 h-12 rounded mr-3`} 
            />
          )}
          
          <View style={tw`flex-1`}>
            <Text 
              style={tw`text-white text-base font-medium mb-1`} 
              numberOfLines={1}
            >
              {track.name}
            </Text>
            <Text 
              style={tw`text-gray-400 text-sm`} 
              numberOfLines={1}
            >
              {Intl.NumberFormat().format(popularity)}
            </Text>
          </View>
        </View>

        <View style={tw`flex-row items-center gap-3`}>
          <TouchableOpacity
            onPress={() => handleShareTrack(track)}
            style={tw`p-2`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="share-outline" 
              size={20} 
              color={tw.color('gray-400')} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const displayedTracks = showAllTracks ? topTracks : topTracks.slice(0, 5);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-background`}>
        <ActivityIndicator color={tw.color('primary')} size="large" />
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-background`}>
        <Text style={tw`text-white`}>Artist not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-background`} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <View style={tw`w-full h-70 relative`}>
        <Image 
          source={{ uri: artist.images?.[0]?.url }} 
          style={tw`w-full h-full`} 
        />
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={tw`absolute top-10 left-4 z-10 bg-black/50 p-1.5 rounded-full`}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={tw`absolute bottom-5 left-4 text-white text-2xl font-dm-sans-bold`}>
          {artist.name}
        </Text>
      </View>

      {/* Details under image */}
      <View style={tw`flex-row items-center gap-3 mt-4 px-4`}>
        <Text style={tw`text-gray-400 text-sm flex-1`}>
          {Intl.NumberFormat().format(artist.followers?.total || 0)} monthly listeners
        </Text>
      </View>

      {/* Playback buttons */}
      <View style={tw`flex-row items-center justify-between mt-6 px-4`}>
        <TouchableOpacity style={tw`border border-gray-400 px-6 py-2 rounded-full`}>
          <Text style={tw`text-white font-bold text-sm`}>Follow</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={tw`p-2 ml-4`}>
          <Ionicons name="ellipsis-horizontal" size={20} color={tw.color('gray-400')} />
        </TouchableOpacity>
        
        <TouchableOpacity style={tw`p-2 ml-auto mr-4`}>
          <Ionicons name="shuffle" size={30} color={tw.color('gray-400')} />
        </TouchableOpacity>
        
        <TouchableOpacity style={tw`bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-primary`}>
          <Ionicons name="play" size={30} color={tw.color('background')} />
        </TouchableOpacity>
      </View>

      {/* Popular tracks */}
      <Text style={tw`text-white text-lg font-semibold mt-8 mb-3 px-4`}>
        Popular
      </Text>
      {displayedTracks.map((track, index) => (
        <TrackCardWithShare 
          key={track.id} 
          track={track} 
          number={index + 1}
        />
      ))}

      {topTracks.length > 5 && (
        <TouchableOpacity 
          style={tw`items-center justify-center py-3 mx-4 mt-2 mb-4 border border-white rounded-full`}
          onPress={() => setShowAllTracks(!showAllTracks)}
        >
          <Text style={tw`text-white text-sm font-semibold`}>
            {showAllTracks ? 'See less' : 'See more'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Releases Section */}
      {albums.length > 0 && (
        <>
          <Text style={tw`text-white text-lg font-semibold mt-8 mb-3 px-4`}>
            Releases
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`px-4 gap-4 pb-2`}
          >
            {albums.map(album => (
              <TouchableOpacity 
                key={album.id} 
                style={tw`w-35 mr-4`}
              >
                <Image 
                  source={{ uri: album.images?.[0]?.url }} 
                  style={tw`w-35 h-35 rounded mb-2`} 
                />
                <Text 
                  style={tw`text-white text-sm font-dm-sans-bold mb-1`} 
                  numberOfLines={1}
                >
                  {album.name}
                </Text>
                <Text style={tw`text-gray-400 text-xs font-dm-sans`}>
                  {new Date(album.release_date).getFullYear()} • {album.album_type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* You may also like */}
      {relatedArtists.length > 0 ? (
        <>
          <Text style={tw`text-white text-lg font-semibold mt-8 mb-3 px-4`}>
            Fans Also Like
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`pl-4 pb-6`}
          >
            {relatedArtists.slice(0, 10).map(related => (
              <View key={related.id} style={tw`mr-4`}>
                <ArtistCard artist={related} variant="compact" />
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <Text style={tw`text-white text-lg font-semibold mt-8 mb-3 px-4`}>
          No similar artists found
        </Text>
      )}
    </ScrollView>
  );
}