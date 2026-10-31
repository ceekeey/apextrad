import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function Splash() {
  const router = useRouter();

  // Animation shared values
  const opacityValue = useSharedValue(0);
  const scaleValue = useSharedValue(0.85);

  useEffect(() => {
    // Smooth fade and spring scale entry
    opacityValue.value = withTiming(1, { duration: 800 });
    scaleValue.value = withSpring(1, { damping: 12, stiffness: 90 });

    // Navigate to onboarding after 3 seconds
    const navigationTimer = setTimeout(() => {
      router.replace("/(auth)/onboarding");
    }, 3000);

    return () => clearTimeout(navigationTimer);
  }, []);

  // Animated style for the main branding container
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      {/* Subtle Ambient Background Glow */}
      <View className="absolute h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      {/* Main Content (Centered perfectly) */}
      <Animated.View style={containerStyle} className="items-center justify-center z-10">

        {/* Outer Ring Logo Presentation */}
        <View className="relative items-center justify-center mb-6">
          {/* Outer Decorative Ring */}
          <View className="h-28 w-28 rounded-full border border-primary/30 items-center justify-center animate-pulse">
            {/* Inner Core Card Icon */}
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border shadow-2xl">
              <Ionicons name="trending-up" size={28} color="#3B82F6" />
            </View>
          </View>

          {/* Floating Element Outside the Ring */}
          <View className="absolute -top-3 bg-primary/20 px-2 py-0.5 rounded-full border border-primary/40">
            <Text className="text-[9px] font-bold text-primary tracking-widest uppercase">
              PRO
            </Text>
          </View>
        </View>

        {/* Brand Name */}
        <Text className="text-3xl font-extrabold tracking-tight text-text-primary text-center">
          Apex Trade
        </Text>

        {/* Tagline */}
        <Text className="mt-2 text-xs font-semibold text-text-muted tracking-widest uppercase text-center">
          Master your mindset • Track execution
        </Text>
      </Animated.View>

      {/* Footer Version */}
      <View className="absolute bottom-10 items-center">
        <Text className="text-[10px] font-semibold tracking-widest uppercase text-text-disabled">
          Secure Trading Protocol
        </Text>
      </View>
    </View>
  );
}