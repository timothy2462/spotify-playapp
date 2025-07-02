export type DrawerParamList = {
    Home: undefined;
    Login: undefined;
  };

  export interface SpotifyItem {
    id: string;
    name: string;
    description?: string;
    images: Array<{ url: string }>;
    type: string;
    artists?: Array<{ name: string; id: string }>;
    followers?: { total: number };
    genres?: string[];
    popularity?: number;
    owner?: { display_name: string };
    release_date?: string;
    album_type?: string;
  }


 export  interface Track {
    id: string;
    name: string;
    uri: string;
    album: { 
      images: { url: string }[];
      name: string;
    };
    artists: { 
      name: string;
      id?: string;
      images?: { url: string }[];
    }[];
    duration_ms?: number;
    preview_url?: string;
  }
  
 export  interface Artist {
    id: string;
    name: string;
    images: { url: string }[];
    followers?: { total: number };
    genres?: string[];
  }
  
 export interface Playlist {
    id: string;
    name: string;
    description?: string;
    isLocal?: boolean;
    tracks: Track[];
    image?: string;
    images?: { url: string }[];
    owner?: {
      display_name: string;
      id: string;
    };
    followers?: { total: number };
    public?: boolean;
  }

  export interface SpotifyContextType {
    user: any;
    accessToken: string | null;
    searchResults: any[];
    login: () => void;
    searchTracks: (query: string) => void;
    logout: () => void;
    isLoading: boolean;
    getArtist: (artistId: string) => Promise<any>;
    getArtistTopTracks: (artistId: string) => Promise<any[]>;
    getArtistAlbums: (artistId: string) => Promise<any[]>;
    getRelatedArtists: (artistId: string) => Promise<any[]>;
    playPreview: (track: any) => Promise<void>;
    stopPlayback: () => Promise<void>;
    handlePlayPreview: (track: any) => void;
    currentTrack: any;
    isPlaying: boolean;
  };

  export interface PlaylistContextType {
    playlists: Playlist[];
    createPlaylist: (name: string, isLocal?: boolean) => Promise<Playlist | null>;
    addToPlaylist: (playlistId: string, track: Track, isLocal?: boolean) => Promise<void>;
    editPlaylist: (playlistId: string, name: string, description?: string) => Promise<void>;
    deletePlaylist: (playlistId: string) => void;
    fetchPlaylists: () => Promise<void>;
    getPlaylistById: (id: string, isLocal?: boolean) => Playlist | undefined;
    removeTrackFromPlaylist: (trackId: string, playlistId: string) => void;
    getPlaylistTracks: (playlistId: string, isLocal?: boolean) => Promise<Track[]>;
    getArtistImage: (artistName: string, artistId?: string) => Promise<string>;
    searchArtists: (query: string) => Promise<Artist[]>;
  }
  