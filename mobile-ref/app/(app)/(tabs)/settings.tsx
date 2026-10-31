import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";

function SettingRow({
    icon,
    title,
    subtitle,
    onPress,
    isLast = false,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    isLast?: boolean;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            className={`flex-row items-center py-4 ${!isLast ? "border-b border-border" : ""
                }`}
        >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-alt">
                <Ionicons name={icon} size={19} color="#3B82F6" />
            </View>

            <View className="ml-3 flex-1">
                <Text className="font-semibold text-text-primary">
                    {title}
                </Text>

                {subtitle && (
                    <Text className="mt-1 text-xs text-text-muted">
                        {subtitle}
                    </Text>
                )}
            </View>

            <Ionicons
                name="chevron-forward"
                size={18}
                color="#94A3B8"
            />
        </TouchableOpacity>
    );
}

export default function Settings() {
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Alert.alert(
            "Sign Out",
            "Are you sure you want to log out of Apex Trade?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        // RootLayoutNav handles the automatic redirect to login
                    },
                },
            ]
        );
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: wp(5),
                    paddingTop: hp(6),
                    paddingBottom: hp(5),
                }}
            >
                <Text className="text-2xl font-bold text-text-primary">
                    Settings
                </Text>

                <Text className="mt-1 text-sm text-text-muted">
                    Manage your Edgeva journal.
                </Text>

                {/* Account */}
                <Text className="mb-2 mt-7 text-xs font-bold uppercase tracking-wider text-text-muted">
                    Account
                </Text>

                <View className="rounded-2xl border border-border bg-surface px-4">
                    <SettingRow
                        icon="person-outline"
                        title="Profile"
                        subtitle="Manage your personal information"
                        onPress={() => router.push("/(app)/settings/profile")}
                    />
                </View>

                {/* Trading */}
                <Text className="mb-2 mt-7 text-xs font-bold uppercase tracking-wider text-text-muted">
                    Trading
                </Text>

                <View className="rounded-2xl border border-border bg-surface px-4">
                    <SettingRow
                        icon="book-outline"
                        title="Trading Plan"
                        subtitle="Manage your rules and setups"
                        onPress={() => router.push("/(app)/playbook")}
                    />
                </View>

                {/* App */}
                <Text className="mb-2 mt-7 text-xs font-bold uppercase tracking-wider text-text-muted">
                    App
                </Text>

                <View className="rounded-2xl border border-border bg-surface px-4">
                    <SettingRow
                        icon="information-circle-outline"
                        title="About Apex Trade"
                        subtitle="Version 1.0.0"
                        onPress={() => router.push("/(app)/settings/about")}
                        isLast
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity
                    onPress={handleLogout}
                    activeOpacity={0.8}
                    className="mt-7 items-center rounded-2xl border border-danger/20 bg-danger/10 py-4"
                >
                    <Text className="font-bold text-danger">
                        Log Out
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}