import tw from '@/lib';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { IMAGES } from '../constants/images';
import { useSpotify } from '../context/spotifyContextProvider';

export default function LoginScreen() {
  const { login } = useSpotify();
  const router = useRouter();

  return (
    <View style={tw`flex-1 bg-background items-center justify-center px-4`}>
      <Image source={IMAGES.logo} style={tw`w-25 h-25 mb-10`} />

      <Text style={tw`text-white text-3xl font-gotham-bold mb-1`}>Millions of songs</Text>
      <Text style={tw`text-white text-3xl font-gotham-bold mb-8`}>Free on Spotify.</Text>

      <TouchableOpacity 
        style={tw`bg-primary rounded-full py-3 px-8 mb-5 w-full`}
        // onPress={() => router.push('/signup')}
      >
        <Text style={tw`text-background text-xl font-poppins-semibold text-center`}>
          Sign up free
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={tw`flex-row items-center bg-surface py-3 px-4 rounded-full w-full mb-4 border border-white`}>
        <Image source={IMAGES.phone} style={tw`w-6 h-6 mr-3`} />
        <Text style={tw`text-white text-lg font-poppins-semibold`}>
          Continue with phone number
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={tw`flex-row items-center bg-surface py-3 px-4 rounded-full w-full mb-4 border border-white`}>
        <Image source={IMAGES.googleicon} style={tw`w-6 h-6 mr-3`} />
        <Text style={tw`text-white text-lg font-poppins-semibold`}>
          Continue with Google
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={tw`flex-row items-center bg-surface py-3 px-4 rounded-full w-full mb-4 border border-white`}>
        <Image source={IMAGES.facebookicon} style={tw`w-6 h-6 mr-3`} />
        <Text style={tw`text-white text-lg font-poppins-semibold`}>
          Continue with Facebook
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={tw`bg-background py-4 rounded-full items-center w-full mt-2.5 border border-white`}
        onPress={login}
      >
        <Text style={tw`text-white text-xl font-poppins-semibold`}>
          Log in
        </Text>
      </TouchableOpacity>
    </View>
  );
}