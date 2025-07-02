import { COLORS, FONTS } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Artist = {
  id: string;
  name: string;
  images?: { url: string }[];
  followers?: { total: number };
  genres?: string[];
};

type ArtistCardProps = {
  artist: Artist;
  variant?: 'default' | 'compact';
};

export default function ArtistCard({ 
  artist, 
  variant = 'default' 
}: ArtistCardProps) {
  const router = useRouter();
//{console.log(artist.id)}
  const handlePress = () => {
    if (artist.id) {
      router.push(`/artist/${artist.id}`);
    }
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handlePress}>
        <Image 
          source={{ uri: artist.images?.[0]?.url }} 
          style={styles.compactImage} 
        />
        <Text style={styles.compactName} numberOfLines={1}>
          {artist.name}
        </Text>
        {artist.genres && artist.genres.length > 0 && (
          <Text style={styles.compactGenre} numberOfLines={1}>
            {artist.genres[0]}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image 
        source={{ uri: artist.images?.[0]?.url }} 
        style={styles.image} 
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{artist.name}</Text>
        <Text style={styles.type}>Artist</Text>
        {artist.followers?.total && (
          <Text style={styles.followers}>
            {Intl.NumberFormat().format(artist.followers.total)} followers
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
  },
  compactCard: {
    width: 120,
    marginRight: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  compactImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.dmSansBold,
    marginBottom: 4,
  },
  compactName: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.dmSansBold,
    textAlign: 'center',
  },
  type: {
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.dmSans,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  followers: {
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.dmSans,
  },
  compactGenre: {
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.dmSans,
    textAlign: 'center',
  },
});