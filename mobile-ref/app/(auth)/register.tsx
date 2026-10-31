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

export default function Register() {
    const router = useRouter();
    const { register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // Comprehensive Registration Input Validation with Toast Alerts
    const handleRegister = async () => {
        // 1. Validate Name
        if (!name.trim()) {
            hapticError();
            Toast.show({
                type: "error",
                text1: "Name Required",
                text2: "Please enter your full name.",
                position: "top",
            });
            return;
        }

        // 2. Validate Email
        if (!email.trim()) {
            hapticError();
            Toast.show({
                type: "error",
                text1: "Email Required",
                text2: "Please enter your email address.",
                position: "top",
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            hapticError();
            Toast.show({
                type: "error",
                text1: "Invalid Email Format",
                text2: "Please enter a valid email (e.g., john@example.com).",
                position: "top",
            });
            return;
        }

        // 3. Validate Password Length
        if (!password) {
            hapticError();
            Toast.show({
                type: "error",
                text1: "Password Required",
                text2: "Please enter a password.",
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

        // 4. Validate Passwords Match
        if (password !== confirmPassword) {
            hapticError();
            Toast.show({
                type: "error",
                text1: "Passwords Don't Match",
                text2: "Please make sure both passwords match.",
                position: "top",
            });
            return;
        }

        // 5. Submit Registration Request
        hapticMedium();
        setIsSubmitting(true);

        const success = await register(name.trim(), email.trim(), password);

        setIsSubmitting(false);

        if (success) {
            hapticSuccess();
            Toast.show({
                type: "success",
                text1: "Welcome to Apex! 🚀",
                text2: "Account created successfully.",
                position: "top",
            });
            router.replace("/(app)/(tabs)");
        } else {
            hapticError();
            Toast.show({
                type: "error",
                text1: "Registration Failed",
                text2: "This email might already be in use.",
                position: "top",
            });
        }
    };

    const handleLogin = () => {
        hapticLight();
        router.push("/(auth)/login");
    };

    const togglePassword = () => {
        hapticLight();
        setShowPassword((prev) => !prev);
    };

    const toggleConfirmPassword = () => {
        hapticLight();
        setShowConfirmPassword((prev) => !prev);
    };

    const isFormValid =
        name.trim().length > 0 &&
        email.trim().length > 0 &&
        password.length >= 6 &&
        confirmPassword === password &&
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
                    <View className="items-center mb-8">
                        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4 shadow-lg">
                            <Ionicons name="shield-checkmark" size={30} color="#3B82F6" />
                        </View>

                        <Text className="text-2xl font-bold tracking-tight text-text-primary">
                            Create Apex Account
                        </Text>
                        <Text className="mt-1 text-xs text-text-muted text-center">
                            Start tracking your trades and building your edge.
                        </Text>
                    </View>

                    {/* ================= FORM CONTAINER ================= */}
                    <View className="rounded-3xl border border-border bg-surface p-6 shadow-xl">
                        {/* Full Name */}
                        <View className="mb-4">
                            <Text className="mb-2 text-xs font-semibold text-text-secondary">
                                FULL NAME
                            </Text>
                            <View className="flex-row items-center rounded-2xl border border-border bg-surface-alt px-4 py-3.5">
                                <Ionicons name="person-outline" size={18} color="#64748B" />
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="John Doe"
                                    placeholderTextColor="#64748B"
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    className="ml-3 flex-1 text-xs text-text-primary"
                                />
                                {name.length > 0 && (
                                    <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
                                )}
                            </View>
                        </View>

                        {/* Email */}
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

                        {/* Password */}
                        <View className="mb-4">
                            <Text className="mb-2 text-xs font-semibold text-text-secondary">
                                PASSWORD
                            </Text>
                            <View className="flex-row items-center rounded-2xl border border-border bg-surface-alt px-4 py-3.5">
                                <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="At least 6 characters"
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

                        {/* Confirm Password */}
                        <View className="mb-6">
                            <Text className="mb-2 text-xs font-semibold text-text-secondary">
                                CONFIRM PASSWORD
                            </Text>
                            <View className="flex-row items-center rounded-2xl border border-border bg-surface-alt px-4 py-3.5">
                                <Ionicons name="shield-checkmark-outline" size={18} color="#64748B" />
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Repeat your password"
                                    placeholderTextColor="#64748B"
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    className="ml-3 flex-1 text-xs text-text-primary"
                                />
                                <Pressable onPress={toggleConfirmPassword} hitSlop={10}>
                                    <Text className="text-xs font-semibold text-primary">
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={!isFormValid}
                            activeOpacity={0.85}
                            className={`items-center justify-center rounded-2xl py-4 shadow-md ${isFormValid ? "bg-primary" : "bg-primary/40"
                                }`}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <Text className="text-sm font-bold text-white">
                                    Create Account
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* ================= FOOTER SIGN IN ================= */}
                    <View className="mt-8 flex-row justify-center items-center">
                        <Text className="text-xs text-text-muted">
                            Already have an account?{" "}
                        </Text>
                        <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
                            <Text className="text-xs font-bold text-primary">
                                Sign in
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}