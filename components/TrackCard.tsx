import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useSpotify } from '../context/spotifyContextProvider';
import PlaylistModal from './PlaylistModal';

type Track = {
  id: string;
  name: string;
  popularity?: number;
  preview_url?: string;
  album: {
    images: { url: string }[];
  };
  artists: { name: string }[];
};

type TrackCardProps = {
  track: Track;
  showNumber?: boolean;
  number?: number;
  subtitle?: string;
  showEllipsis?: boolean;
};

export default function TrackCard({
  track,
  showNumber = false,
  number,
  subtitle,
  showEllipsis = false,
}: TrackCardProps) {
  const { handlePlayPreview } = useSpotify();
  const [showModal, setShowModal] = useState(false);

  const handlePress = () => {
    if (!track.preview_url) {
      Alert.alert('Preview Unavailable', 'This track does not have a preview.');
      return;
    }
    handlePlayPreview(track);
  };

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
        {showNumber && <Text style={styles.trackNumber}>{number}</Text>}
        <Image
          source={{ uri: track.album.images?.[0]?.url || 'https://via.placeholder.com/50' }}
          style={styles.image}
        />
        <View style={styles.trackInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {track.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle || track.artists.map(a => a.name).join(', ')}
          </Text>
        </View>
        {showEllipsis && (
          <TouchableOpacity onPress={() => setShowModal(true)} style={styles.trackEllipsis}>
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {showEllipsis && (
        <PlaylistModal visible={showModal} onClose={() => setShowModal(false)} track={track} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
  },
  trackNumber: {
    color: COLORS.gray,
    width: 24,
    marginRight: 12,
    fontSize: 14,
    fontFamily: FONTS.dmSans,
    textAlign: 'right',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 4,
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.dmSansBold,
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: FONTS.dmSans,
  },
  trackEllipsis: {
    padding: 8,
    marginLeft: 'auto',
  },
});