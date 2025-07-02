import { registerRootComponent } from 'expo';
import ExpoRouterApp from 'expo-router/entry';
import TrackPlayer from 'react-native-track-player';
import trackPlayerService from './services/TrackPlayer';

// Register TrackPlayer service
TrackPlayer.registerPlaybackService(() => trackPlayerService);

// Register Expo Router entry
registerRootComponent(ExpoRouterApp);