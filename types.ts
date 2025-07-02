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