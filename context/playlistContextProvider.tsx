import { Artist, Playlist, PlaylistContextType, Track } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSpotify } from './spotifyContextProvider';


const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user } = useSpotify();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [localPlaylists, setLocalPlaylists] = useState<Playlist[]>([]);
  const [artistImageCache, setArtistImageCache] = useState<Record<string, string>>({});

  const fetchPlaylists = async () => {
    if (!accessToken || !user) {
      setPlaylists([...localPlaylists]);
      return;
    }
    
    try {
      const res = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists?limit=50`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const remote = data.items.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        tracks: [],
        image: p.images?.[0]?.url,
        images: p.images,
        isLocal: false,
        owner: p.owner,
        followers: p.followers,
        public: p.public,
      }));
      
      setPlaylists([...localPlaylists, ...remote]);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setPlaylists([...localPlaylists]); 
    }
  };

  const getArtistImage = async (artistName: string, artistId?: string): Promise<string> => {
    // Check cache first
    const cacheKey = artistId || artistName;
    if (artistImageCache[cacheKey]) {
      return artistImageCache[cacheKey];
    }

    if (!accessToken) {
      return 'https://via.placeholder.com/300x300/1DB954/ffffff?text=' + encodeURIComponent(artistName.charAt(0));
    }

    try {
      let searchQuery = artistId ? `artist:${artistId}` : `artist:${encodeURIComponent(artistName)}`;
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${searchQuery}&type=artist&limit=1`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) throw new Error('Failed to search artists');

      const data = await res.json();
      const artist = data.artists.items[0];
      
      if (artist && artist.images && artist.images.length > 0) {
        const imageUrl = artist.images[0].url;
        setArtistImageCache(prev => ({
          ...prev,
          [cacheKey]: imageUrl
        }));
        return imageUrl;
      }
    } catch (error) {
      console.error('Failed to fetch artist image:', error);
    }

    const placeholder = 'https://via.placeholder.com/300x300/1DB954/ffffff?text=' + encodeURIComponent(artistName.charAt(0));
    setArtistImageCache(prev => ({
      ...prev,
      [cacheKey]: placeholder
    }));
    return placeholder;
  };

  const searchArtists = async (query: string): Promise<Artist[]> => {
    if (!accessToken || !query.trim()) return [];

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=20`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) throw new Error('Failed to search artists');

      const data = await res.json();
      return data.artists.items.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        images: artist.images,
        followers: artist.followers,
        genres: artist.genres,
      }));
    } catch (error) {
      console.error('Failed to search artists:', error);
      return [];
    }
  };

  const getPlaylistTracks = async (playlistId: string, isLocal = false): Promise<Track[]> => {
    if (isLocal) {
      const localPlaylist = localPlaylists.find(p => p.id === playlistId);
      return localPlaylist?.tracks || [];
    }

    if (!accessToken) return [];
    
    try {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!res.ok) throw new Error('Failed to fetch tracks');
      
      const data = await res.json();
      return data.items
        .filter((item: any) => item.track && item.track.id) // Filter out null tracks
        .map((item: any) => ({
          id: item.track.id,
          name: item.track.name,
          uri: item.track.uri,
          album: item.track.album,
          artists: item.track.artists,
          duration_ms: item.track.duration_ms,
          preview_url: item.track.preview_url,
        }));
    } catch (error) {
      console.error('Failed to fetch playlist tracks:', error);
      return [];
    }
  };

  const createPlaylist = async (name: string, isLocal = false): Promise<Playlist | null> => {
    if (isLocal || !accessToken || !user) {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name,
        description: 'Created locally',
        isLocal: true,
        tracks: [],
        image: 'https://via.placeholder.com/300x300/1DB954/ffffff?text=' + encodeURIComponent(name.charAt(0)),
      };
      
      setLocalPlaylists((prev) => [newPlaylist, ...prev]);
      return newPlaylist;
    }
    
    try {
      const res = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: 'Created from Spotify Clone App',
          public: false,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to create playlist');
      
      const data = await res.json();
      await fetchPlaylists();
      return data;
    } catch (err) {
      console.error('Create playlist failed:', err);
      // Fallback to local playlist if Spotify creation fails
      return await createPlaylist(name, true);
    }
  };

  const addToPlaylist = async (playlistId: string, track: Track, isLocal = false): Promise<void> => {
    if (isLocal) {
      setLocalPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId 
            ? { ...p, tracks: [...p.tracks.filter(t => t.id !== track.id), track] }
            : p
        )
      );
      return;
    }

    if (!accessToken) return;
    
    try {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [track.uri] }),
      });
      
      if (!res.ok) throw new Error('Failed to add track to playlist');
      
      console.log('Track added to Spotify playlist successfully');
    } catch (err) {
      console.error('Add to playlist failed:', err);
      throw err;
    }
  };

  const editPlaylist = async (playlistId: string, name: string, description = '') => {
    if (!accessToken) return;
    try {
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });
      await fetchPlaylists();
    } catch (err) {
      console.error('Edit playlist failed:', err);
    }
  };

  const deletePlaylist = (playlistId: string) => {
    setLocalPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  };

  const removeTrackFromPlaylist = (trackId: string, playlistId: string) => {
    setLocalPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) }
          : p
      )
    );
  };

  const getPlaylistById = (id: string, isLocal = false): Playlist | undefined => {
    return playlists.find((p) => p.id === id && Boolean(p.isLocal) === isLocal);
  };

  useEffect(() => {
    setPlaylists((prev) => {
      const remoteOnly = prev.filter((p) => !p.isLocal);
      return [...localPlaylists, ...remoteOnly];
    });
  }, [localPlaylists]);

  useEffect(() => {
    if (accessToken && user) {
      fetchPlaylists();
    } else {
      setPlaylists([...localPlaylists]);
    }
  }, [accessToken, user]);

  const value = {
    playlists,
    createPlaylist,
    addToPlaylist,
    editPlaylist,
    deletePlaylist,
    fetchPlaylists,
    getPlaylistById,
    removeTrackFromPlaylist,
    getPlaylistTracks,
    getArtistImage,
    searchArtists,
  };

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) throw new Error('usePlaylist must be used within PlaylistProvider');
  return context;
};