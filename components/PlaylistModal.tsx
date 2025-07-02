import { usePlaylist } from '@/context/playlistContextProvider';
import tw from '@/lib';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface Props {
  visible: boolean;
  onClose: () => void;
  track: any;
}

const { height: screenHeight } = Dimensions.get('window');

export default function PlaylistModal({ visible, onClose, track }: Props) {
  const { playlists, fetchPlaylists, createPlaylist, addToPlaylist } = usePlaylist();
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const slideAnim = useState(new Animated.Value(screenHeight))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      fetchPlaylists();
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      slideAnim.setValue(screenHeight);
      fadeAnim.setValue(0);
      setShowCreateForm(false);
      setNewName('');
    }
  }, [visible]);

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleAdd = async (playlistId: string, isLocal: boolean, playlistName: string) => {
    if (!track) return;
    
    setAddingToPlaylist(playlistId);
    
    try {
      const trackData = {
        id: track.id,
        name: track.name,
        uri: track.uri,
        album: track.album,
        artists: track.artists,
      };
      
      await addToPlaylist(playlistId, trackData, isLocal);
      
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Song Added!',
        text2: `"${track.name}" added to "${playlistName}"`,
        position: 'bottom',
        visibilityTime: 3000,
      });
      
      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 500);
      
    } catch (error) {
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add track to playlist. Please try again.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      console.error('Error adding to playlist:', error);
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newName.trim() || !track) return;
    setLoading(true);
    
    try {
      const newPlaylist = await createPlaylist(newName.trim(), true);
      if (newPlaylist?.id) {
        const trackData = {
          id: track.id,
          name: track.name,
          uri: track.uri,
          album: track.album,
          artists: track.artists,
        };
        await addToPlaylist(newPlaylist.id, trackData, true);
        
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Playlist Created!',
          text2: `"${newName.trim()}" created and "${track.name}" added`,
          position: 'top',
          visibilityTime: 3000,
        });
        
        // Close modal after short delay
        setTimeout(() => {
          handleClose();
        }, 500);
      }
    } catch (error) {
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create playlist. Please try again.',
        position: 'top',
        visibilityTime: 4000,
      });
      console.error('Error creating playlist:', error);
    } finally {
      setLoading(false);
      setNewName('');
      setShowCreateForm(false);
    }
  };

  const renderPlaylistItem = ({ item }: { item: any }) => {
    const isAdding = addingToPlaylist === item.id;
    
    return (
      <TouchableOpacity
        onPress={() => handleAdd(item.id, !!item.isLocal, item.name)}
        disabled={isAdding || !!addingToPlaylist}
        style={tw`py-4 px-4 bg-neutral-800 rounded-xl mb-3 flex-row items-center justify-between ${
          isAdding ? 'opacity-70' : ''
        }`}
        activeOpacity={0.7}
      >
        <View style={tw`flex-1`}>
          <Text style={tw`text-white text-base font-medium`} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={tw`flex-row items-center mt-1`}>
            <View style={tw`${item.isLocal ? 'bg-blue-600' : 'bg-green-600'} px-2 py-0.5 rounded-full mr-2`}>
              <Text style={tw`text-white text-xs font-medium`}>
                {item.isLocal ? 'Local' : 'Spotify'}
              </Text>
            </View>
            <Text style={tw`text-neutral-400 text-xs`}>
              {item.tracks?.length || 0} {(item.tracks?.length || 0) === 1 ? 'song' : 'songs'}
            </Text>
          </View>
        </View>
        
        {isAdding && (
          <ActivityIndicator size="small" color="#10b981" style={tw`ml-3`} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View 
        style={[
          tw`flex-1 bg-black/50`,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity 
          style={tw`flex-1`} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        <Animated.View 
          style={[
            tw`bg-neutral-900 rounded-t-3xl max-h-4/5`,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Handle bar */}
          <View style={tw`w-12 h-1 bg-neutral-600 rounded-full self-center mt-3 mb-4`} />
          
          <View style={tw`px-6 pb-6`}>
            <Text style={tw`text-white text-2xl font-bold mb-6`}>Add to Playlist</Text>
            
            {/* Track info */}
            {track && (
              <View style={tw`mb-6 p-4 bg-neutral-800 rounded-2xl border border-neutral-700`}>
                <Text style={tw`text-white font-semibold text-base`} numberOfLines={1}>
                  {track.name}
                </Text>
                <Text style={tw`text-neutral-300 text-sm mt-1`} numberOfLines={1}>
                  {track.artists?.map((artist: any) => artist.name).join(', ')}
                </Text>
                {track.album?.name && (
                  <Text style={tw`text-neutral-400 text-xs mt-1`} numberOfLines={1}>
                    {track.album.name}
                  </Text>
                )}
              </View>
            )}

            {/* Playlists list */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-white text-lg font-semibold mb-4`}>
                Your Playlists ({playlists.length})
              </Text>
              
              <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                style={tw`max-h-64`}
                showsVerticalScrollIndicator={false}
                renderItem={renderPlaylistItem}
                ListEmptyComponent={
                  <View style={tw`py-8 items-center`}>
                    <Text style={tw`text-neutral-400 text-center text-base mb-2`}>
                      No playlists found
                    </Text>
                    <Text style={tw`text-neutral-500 text-center text-sm`}>
                      Create your first playlist below
                    </Text>
                  </View>
                }
              />
            </View>

            {/* Create new playlist section */}
            <View style={tw`border-t border-neutral-700 pt-6`}>
              {!showCreateForm ? (
                <TouchableOpacity
                  onPress={() => setShowCreateForm(true)}
                  style={tw`bg-green-600 py-4 rounded-xl flex-row items-center justify-center`}
                  activeOpacity={0.8}
                >
                  <Text style={tw`text-white text-center text-base font-semibold mr-2`}>
                    + Create New Playlist
                  </Text>
                </TouchableOpacity>
              ) : (
                <View>
                  <Text style={tw`text-white text-lg font-semibold mb-4`}>
                    Create New Playlist
                  </Text>
                  
                  <TextInput
                    placeholder="Enter playlist name..."
                    placeholderTextColor="#6b7280"
                    value={newName}
                    onChangeText={setNewName}
                    style={tw`bg-neutral-800 text-white p-4 rounded-xl mb-4 border border-neutral-700`}
                    autoFocus
                    maxLength={50}
                  />

                  <View style={tw`flex-row gap-3`}>
                    <TouchableOpacity
                      onPress={() => {
                        setShowCreateForm(false);
                        setNewName('');
                      }}
                      style={tw`flex-1 bg-neutral-700 py-3 rounded-xl`}
                      activeOpacity={0.7}
                    >
                      <Text style={tw`text-white text-center text-base font-medium`}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={handleCreateAndAdd}
                      disabled={loading || !newName.trim()}
                      style={tw`flex-1 ${
                        loading || !newName.trim() ? 'bg-neutral-600' : 'bg-green-600'
                      } py-3 rounded-xl flex-row items-center justify-center`}
                      activeOpacity={0.8}
                    >
                      {loading && (
                        <ActivityIndicator size="small" color="white" style={tw`mr-2`} />
                      )}
                      <Text style={tw`text-white text-center text-base font-semibold`}>
                        {loading ? 'Creating...' : 'Create & Add'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}