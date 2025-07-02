import { useSpotify } from '@/context/spotifyContextProvider';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const { user, isLoading } = useSpotify();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/(drawer)/(tabs)")
    }
  }, [isLoading, user]);

  return null;
}