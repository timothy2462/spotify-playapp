import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IMAGES } from '../constants/images';
import { COLORS, FONTS } from '../constants/theme';
import { useSpotify } from '../context/spotifyContextProvider';

type Props = {
  children: ReactNode;
  scroll?: boolean; 
};

export default function BackgroundScreen({ children, scroll = true }: Props) {
  const { currentTrack, isPlaying, togglePlayback } = useSpotify();
  const DEFAULT_CARD = {
    image: IMAGES.doja,
    title: 'No Track Playing',
    artist: 'Start browsing to play a song',
  };
  
  const renderCard = currentTrack
    ? {
        image: { uri: currentTrack.album.images[0]?.url },
        title: currentTrack.name,
        artist: currentTrack.artists.map((a: any) => a.name).join(', '),
      }
    : DEFAULT_CARD;

  const Wrapper = scroll ? ScrollView : View;

  return (
    <View style={styles.wrapper}>
      <Wrapper contentContainerStyle={styles.container}>
        {children}
      </Wrapper>

      <View style={styles.browseCard}>
        <Image source={renderCard.image} style={styles.browseImage} />
        <View style={styles.browseText}>
          <Text style={styles.browseTitle}>{renderCard.title}</Text>
          <Text style={styles.browseArtist}>{renderCard.artist}</Text>
        </View>
        <TouchableOpacity style={styles.featuredAddButton}>
          <Image source={IMAGES.tv} style={styles.connectButton} />
        </TouchableOpacity>
        {currentTrack && (
          <TouchableOpacity onPress={togglePlayback}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={16}
              color={COLORS.white}
              style={styles.browseIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  container: {
    paddingTop: 80, 
    paddingBottom: 130, 
    paddingHorizontal: 16,
  },
  browseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.song,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  browseImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
  },
  browseText: {
    flex: 1,
  },
  browseTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: FONTS.dmSans,
  },
  browseArtist: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: FONTS.dmSans,
  },
  browseIcon: {
    marginRight: 12,
  },
  featuredAddButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButton: {
    width: 20,
    height: 20,
    tintColor: COLORS.white,
    resizeMode: 'contain',
    right: 20,
  },
});