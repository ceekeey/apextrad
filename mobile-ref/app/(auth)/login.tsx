import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hapticLight = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const hapticMedium = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const hapticError = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    };

    const hapticSuccess = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    // Comprehensive Input Validation with Toast Alerts
    const handleLogin = async () => {
        // 1. Validate Email Input
        if (!email.trim()) {
            hapticError();
            Toast.show({
                type: "error",
                text1: "Email Required",
                text2: "Please enter your registered email address.",
                position: "top",
            });
            return;
        }

        // Basic email regex format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            hapticError();
            Toast.show({
                type: "error",
                text1: "Invalid Email Format",
                text2: "Please enter a valid email address (e.g., john@example.com).",
                position: "top",
            });
            return;
        }

        // 2. Validate Password Input
        if (!password) {
            hapticError();
            Toast.show({
                type: "error",
                text1: "Password Required",
                text2: "Please enter your password to sign in.",
                position: "top",
            });
            return;
        }

        if (password.length < 6) {
            hapticError();
            Toast.show({
                type: "error",
                text1: "Password Too Short",
                text2: "Your password must be at least 6 characters long.",
                position: "top",
            });
            return;
        }

        // 3. Submit Authentication Request
        hapticMedium();
        setIsSubmitting(true);

        const success = await login(email.trim(), password);

        setIsSubmitting(false);

        if (success) {
            hapticSuccess();
            Toast.show({
                type: "success",
                text1: "Welcome Back! 🚀",
                text2: "Logged in successfully to Apex Trade.",
                position: "top",
            });
            router.replace("/(app)/(tabs)");
        } else {
            hapticError();
            Toast.show({
                type: "error",
                text1: "Authentication Failed",
                text2: "Invalid email or password. Please try again.",
                position: "top",
            });
        }
    };

    const handleRegister = () => {
        hapticLight();
        router.push("/(auth)/register");
    };

    const handleForgotPassword = () => {
        hapticLight();
        Toast.show({
            type: "info",
            text1: "Password Reset",
            text2: "Password reset instructions sent to your email.",
            position: "top",
        });
    };

    const togglePassword = () => {
        hapticLight();
        setShowPassword((prev) => !prev);
    };

    const isFormValid =
        email.trim().length > 0 &&
        password.length >= 6 &&
        !isSubmitting;

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-background"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 py-10">
                    {/* ================= BRAND LOGO / HEADER ================= */}
                    <View className="items-center mb-10">
                        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4 shadow-lg">
                            <Ionicons name="trending-up" size={32} color="#3B82F6" />
                        </View>

                        <Text className="text-2xl font-bold tracking-tight text-text-primary">
                            Apex Trade
                        </Text>
                        <Text className="mt-1 text-xs text-text-muted text-center">
                            Master your mindset. Track your execution.
                        </Text>
                    </View>

                    {/* ================= FORM CONTAINER ================= */}
                    <View className="rounded-3xl border border-border bg-surface p-6 shadow-xl">
                        <Text className="text-lg font-bold text-text-primary mb-6">
                            Welcome Back
                        </Text>

                        {/* Email Field */}
                        <View className="mb-4">
                            <Text className="mb-2 text-xs font-semibold text-text-secondary">
                                EMAIL
                            </Text>
                            <View className="flex-row items-center rounded-2xl border border-border bg-surface-alt px-4 py-3.5">
                                <Ionicons name="mail-outline" size={18} color="#64748B" />
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="john@example.com"
                                    placeholderTextColor="#64748B"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    className="ml-3 flex-1 text-xs text-text-primary"
                                />
                                {email.length > 0 && (
                                    <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
                                )}
                            </View>
                        </View>

                        {/* Password Field */}
                        <View className="mb-2">
                            <Text className="mb-2 text-xs font-semibold text-text-secondary">
                                PASSWORD
                            </Text>
                            <View className="flex-row items-center rounded-2xl border border-border bg-surface-alt px-4 py-3.5">
                                <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor="#64748B"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    className="ml-3 flex-1 text-xs text-text-primary"
                                />
                                <Pressable onPress={togglePassword} hitSlop={10}>
                                    <Text className="text-xs font-semibold text-primary">
                                        {showPassword ? "Hide" : "Show"}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity
                            onPress={handleForgotPassword}
                            activeOpacity={0.7}
                            className="mb-6 mt-2 self-end"
                        >
                            <Text className="text-xs font-semibold text-text-muted">
                                Forgot password?
                            </Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={!isFormValid}
                            activeOpacity={0.85}
                            className={`items-center justify-center rounded-2xl py-4 shadow-md ${isFormValid ? "bg-primary" : "bg-primary/40"
                                }`}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <Text className="text-sm font-bold text-white">
                                    Sign In
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* ================= FOOTER SIGN UP ================= */}
                    <View className="mt-8 flex-row justify-center items-center">
                        <Text className="text-xs text-text-muted">
                            Don't have an account?{" "}
                        </Text>
                        <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
                            <Text className="text-xs font-bold text-primary">
                                Create account
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}