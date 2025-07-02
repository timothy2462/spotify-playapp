import ArtistScreen from '@/screens/ArtistScreen';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function ArtistRoute() {
  const { id } = useLocalSearchParams();

  if (!id || typeof id !== 'string') return null;

  return (
    <>
      <Stack.Screen options={{ title: 'Artist', headerShown: false }} />
      <ArtistScreen artistId={id} />
    </>
  );
}