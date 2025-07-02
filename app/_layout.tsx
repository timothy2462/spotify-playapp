import { PlaylistProvider } from "@/context/playlistContextProvider";
import { SpotifyProvider, useSpotify } from "@/context/spotifyContextProvider";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import Toast, { BaseToast, BaseToastProps, ErrorToast } from "react-native-toast-message";
import LoginScreen from "./login";

type ToastConfigProps = BaseToastProps & {
  props: {
    text1?: string;
    text2?: string;
  };
};

const toastConfig = {
  error: (props: ToastConfigProps) => (
    <ErrorToast
      {...props}
      style={{ 
        borderLeftColor: '#FF3B30',
        height: 'auto',
      }}
      text1Style={{ 
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#D32F2F',
      }}
      text2Style={{ 
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#D32F2F',
      }}
    />
  ),
  success: (props: ToastConfigProps) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#4CAF50',
        height: 'auto',
      }}
      text1Style={{ 
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#2E7D32',
      }}
      text2Style={{ 
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#2E7D32',
      }}
    />
  ),
  info: (props: ToastConfigProps) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#2196F3',
        height: 'auto',
      }}
      text1Style={{ 
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#1565C0',
      }}
      text2Style={{ 
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#1565C0',
      }}
    />
  ),
};

function LayoutContent() {
  const { user, isLoading } = useSpotify();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Gotham-Bold": require("../assets/fonts/Gotham/Gotham-Bold.ttf"),
    "Poppins-Regular": require("../assets/fonts/poppins/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/poppins/Poppins-SemiBold.ttf"),
    "DMSans-Regular": require("../assets/fonts/dm-sans/DMSans-Regular.ttf"),
    "DMSans-Bold": require("../assets/fonts/dm-sans/DMSans-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <SpotifyProvider>
      <PlaylistProvider>
        <LayoutContent />
        <Toast config={toastConfig} />
      </PlaylistProvider>
    </SpotifyProvider>
  );
}