import { NetworkOverlay } from "@/components/NetworkOverlay";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "./global.css";

function RootLayoutNav() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if the current active route is in onboarding or (auth) screens (login / register)
    const currentSegment = segments[0];
    const isAuthOrOnboarding = currentSegment === "(auth)" || currentSegment === "onboarding";

    if (token && isAuthOrOnboarding) {
      // User is logged in but on onboarding/login/register -> redirect to Home
      router.replace("/(app)/(tabs)");
    } else if (!token && currentSegment === "(app)") {
      // User is logged out but trying to access main app screens -> redirect to Login
      router.replace("/(auth)/login");
    }
  }, [token, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0F172A]">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#0F172A",
        },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootLayoutNav />
        <NetworkOverlay />
      </SafeAreaProvider>
      <Toast />
    </AuthProvider>
  );
}