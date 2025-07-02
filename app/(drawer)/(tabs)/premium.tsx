import tw from "@/lib";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Dimensions,
    ImageBackground,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface PremiumBenefit {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  benefits: string[];
  buttonColor: string;
  buttonText: string;
  popular?: boolean;
}

const premiumBenefits: PremiumBenefit[] = [
  { icon: "musical-notes", text: "Ad-free music listening" },
  { icon: "download", text: "Download to listen offline" },
  { icon: "shuffle", text: "Play songs in any order" },
  { icon: "repeat", text: "Unlimited skips" },
  { icon: "headset", text: "High quality audio" },
  {
    icon: "phone-portrait",
    text: "Listen everywhere - mobile, tablet & computer",
  },
];

const plans: Plan[] = [
  {
    id: "individual",
    name: "Individual",
    price: "₦900",
    period: "month",
    benefits: [
      "1 Premium account",
      "Cancel anytime",
      "Subscribe or one-time payment",
    ],
    buttonColor: "bg-blue-500",
    buttonText: "Get Premium Individual",
  },
  {
    id: "student",
    name: "Student",
    price: "₦450",
    period: "month",
    benefits: [
      "1 Premium account",
      "Discount for eligible students",
      "Cancel anytime",
      "Subscribe or one-time payment",
    ],
    buttonColor: "bg-spotify-green",
    buttonText: "Get Premium Student",
    popular: true,
  },
  {
    id: "duo",
    name: "Duo",
    price: "₦1,200",
    period: "month",
    benefits: [
      "2 Premium accounts",
      "Cancel anytime",
      "Subscribe or one-time payment",
    ],
    buttonColor: "bg-purple-500",
    buttonText: "Get Premium Duo",
  },
  {
    id: "family",
    name: "Family",
    price: "₦1,400",
    period: "month",
    benefits: [
      "6 Premium accounts",
      "Control content marked as explicit",
      "Cancel anytime",
      "Subscribe or one-time payment",
    ],
    buttonColor: "bg-pink-500",
    buttonText: "Get Premium Family",
  },
];

export default function PremiumScreen() {
  const handlePlanSelect = (planId: string) => {
    console.log(`Selected plan: ${planId}`);
  };

  const renderBenefit = (benefit: PremiumBenefit, index: number) => (
    <View key={index} style={tw`flex-row items-center py-3`}>
      <View
        style={tw`w-10 h-10  rounded-full items-center justify-center mr-4`}
      >
        <Ionicons name={benefit.icon} size={20} color="white" />
      </View>
      <Text style={tw`text-white text-base font-poppins flex-1`}>
        {benefit.text}
      </Text>
    </View>
  );

  const renderPlan = (plan: Plan) => (
    <View key={plan.id} style={tw`bg-surface rounded-xl p-6 mb-4 relative`}>
      {plan.popular && (
        <View
          style={tw`absolute -top-2 left-6 bg-spotify-green px-3 py-1 rounded-full`}
        >
          <Text style={tw`text-white text-xs font-poppins-semibold`}>
            Most Popular
          </Text>
        </View>
      )}

      <Text style={tw`text-white text-xl font-poppins-semibold mb-2`}>
        {plan.name}
      </Text>

      <View style={tw`flex-row items-baseline mb-4`}>
        <Text style={tw`text-white text-2xl font-gotham-bold`}>
          {plan.price}
        </Text>
        <Text style={tw`text-muted text-base font-poppins ml-1`}>
          / {plan.period}
        </Text>
      </View>

      <View style={tw`mb-6`}>
        {plan.benefits.map((benefit, index) => (
          <View key={index} style={tw`flex-row items-center mb-2`}>
            <Ionicons
              name="checkmark"
              size={18}
              color="#1DB954"
              style={tw`mr-3`}
            />
            <Text style={tw`text-white text-sm font-poppins flex-1`}>
              {benefit}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={tw`${plan.buttonColor} py-4 rounded-full items-center`}
        onPress={() => handlePlanSelect(plan.id)}
      >
        <Text style={tw`text-white text-base font-poppins-semibold`}>
          {plan.buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-background`}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require("@/assets/images/spotify_premium.jpg")}
          style={tw`h-80 justify-center items-center relative`}
          resizeMode="cover"
        >
          <View style={tw`absolute inset-0 bg-black bg-opacity-40`} />

          <View style={tw`items-center px-6 z-10`}>
            <View style={tw`bg-spotify-green px-3 py-1 rounded-full mb-4`}>
              <Text
                style={tw`text-white text-xs font-poppins-semibold uppercase tracking-wide`}
              >
                Premium
              </Text>
            </View>

            <Text
              style={tw`text-white text-3xl font-gotham-bold text-center mb-4`}
            >
              Listen without limits
            </Text>

            <Text
              style={tw`text-white text-lg font-poppins text-center mb-6 leading-6`}
            >
              Try 1 month of Premium Individual for ₦0 with Spotify
            </Text>

            <TouchableOpacity style={tw`bg-white py-4 px-8 rounded-full`}>
              <Text style={tw`text-black text-base font-poppins-semibold`}>
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View style={tw`px-6`}>
          <View style={tw`mt-8 mb-8`}>
            <Text style={tw`text-white text-2xl font-gotham-bold mb-6`}>
              Why join Premium?
            </Text>

            <View style={tw`bg-surface rounded-xl p-6`}>
              {premiumBenefits.map((benefit, index) =>
                renderBenefit(benefit, index)
              )}
            </View>
          </View>

          <View style={tw`mb-8`}>
            <Text style={tw`text-white text-2xl font-gotham-bold mb-6`}>
              Available Plans
            </Text>

            {plans.map(renderPlan)}
          </View>

          <View style={tw`mb-8`}>
            <Text
              style={tw`text-muted text-xs font-poppins text-center leading-4`}
            >
              Individual plan only. ₦900/month after. Terms apply.{"\n"}
              Free Premium only for users who haven't tried Premium before.
              {"\n"}
              Offer expires December 31, 2025.
            </Text>
          </View>

          <View style={tw`h-20`} />
        </View>
      </ScrollView>
    </View>
  );
}
