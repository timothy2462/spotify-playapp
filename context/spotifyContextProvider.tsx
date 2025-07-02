
import { SpotifyContextType } from '@/types';
import * as AuthSession from 'expo-auth-session';
import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { CLIENT_ID, SCOPES } from '../constants/Config';
import { deleteToken, getToken, saveToken } from '../utils/storage';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const SpotifyProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const soundRef = useRef<Audio.Sound | null>(null);

 
  const redirectUri = __DEV__ 
    ? 'exp://192.168.1.222:8081/--/redirect'
    : 'spotifyplaylist://redirect';

  // console.log('Redirect URI:', redirectUri); 

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      usePKCE: true,
      responseType: AuthSession.ResponseType.Code,
    },
    discovery
  );

  useEffect(() => {
    const restoreToken = async () => {
      try {
        const savedToken = await getToken();
        if (!savedToken) {
          setIsLoading(false);
          return;
        }

        const res = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (!res.ok) throw new Error('Invalid or expired token');

        const userData = await res.json();
        setAccessToken(savedToken);
        setUser(userData);
      } catch (error) {
        console.warn('Failed to restore session:', error);
        await deleteToken();
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreToken();
  }, []);

  useEffect(() => {
    const fetchTokenAndUser = async () => {
      if (
        response?.type === 'success' &&
        request?.codeVerifier &&
        response.params?.code
      ) {
        try {
          setIsLoading(true);
          
          const tokenResult = await AuthSession.exchangeCodeAsync(
            {
              clientId: CLIENT_ID,
              code: response.params.code,
              redirectUri,
              extraParams: { code_verifier: request.codeVerifier },
            },
            discovery
          );
          
          const token = tokenResult.accessToken;
          await saveToken(token);
          setAccessToken(token);

          const res = await fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) throw new Error('Failed to fetch user data');

          const userData = await res.json();
          setUser(userData);
        } catch (err) {
          console.error('Authentication failed:', err);
          await deleteToken();
          setAccessToken(null);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === 'error') {
        console.error('Auth error:', response.error);
        setIsLoading(false);
      } else if (response?.type === 'cancel') {
        console.log('Auth cancelled');
        setIsLoading(false);
      }
    };

    fetchTokenAndUser();
  }, [response]);

  const searchTracks = async (query: string) => {
    if (!query || !accessToken) return;
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist&limit=10`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const json = await res.json();

      const tracks = json.tracks?.items || [];
      const artists = json.artists?.items || [];

      const merged = [
        ...tracks.map((t: any) => ({ ...t, type: 'track' })),
        ...artists.map((a: any) => ({ ...a, type: 'artist' })),
      ];

      setSearchResults(merged);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const getArtist = async (artistId: string) => {
    if (!accessToken) return null;
    try {
      const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return await res.json();
    } catch (error) {
      console.error('Failed to fetch artist:', error);
      return null;
    }
  };

  const getRelatedArtists = async (artistId: string) => {
    if (!accessToken) return [];
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      return data.artists || [];
    } catch (error) {
      console.error('Failed to fetch related artists:', error);
      return [];
    }
  };

  const getArtistTopTracks = async (artistId: string) => {
    if (!accessToken) return [];
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      return data.tracks || [];
    } catch (error) {
      console.error('Failed to fetch top tracks:', error);
      return [];
    }
  };

  const getArtistAlbums = async (artistId: string) => {
    if (!accessToken) return [];
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US&limit=6`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      return data.items || [];
    } catch (error) {
      console.error('Failed to fetch albums:', error);
      return [];
    }
  };

  const playPreview = async (track: any) => {
    if (!track.preview_url) {
      alert('No preview available for this track');
      return;
    }

    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.preview_url },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play preview:', error);
    }
  };

  const stopPlayback = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };

  const handlePlayPreview = async (track: any) => {
    await playPreview(track);
  };

  const logout = async () => {
    await deleteToken();
    setUser(null);
    setAccessToken(null);
    setSearchResults([]);
    await stopPlayback();
  };

  const value = {
    user,
    accessToken,
    searchResults,
    login: () => promptAsync(),
    searchTracks,
    logout,
    isLoading,
    getArtist,
    getArtistTopTracks,
    getArtistAlbums,
    getRelatedArtists,
    playPreview,
    stopPlayback,
    handlePlayPreview,
    currentTrack,
    isPlaying,
  };

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) throw new Error('useSpotify must be used within SpotifyProvider');
  return context;
};