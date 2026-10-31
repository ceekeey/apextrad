import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Toast from "react-native-toast-message";

const SERVER_URI = "https://jornal.rgmrabagardama.com.ng/api";

const icons: (keyof typeof Ionicons.glyphMap)[] = [
    "analytics-outline",
    "trending-up-outline",
    "git-branch-outline",
    "flash-outline",
    "layers-outline",
];

export default function SetupDetails() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { token } = useAuth();

    const [setup, setSetup] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false); // Added deletion state

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    // Fetch single trading plan details from backend
    useEffect(() => {
        const fetchPlanDetails = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${SERVER_URI}/plans/plan/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();

                if (data.success) {
                    setSetup(data.plan);
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: data.message || "Failed to load strategy details.",
                    });
                }
            } catch (error) {
                Toast.show({
                    type: "error",
                    text1: "Connection Error",
                    text2: "Could not reach the server.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchPlanDetails();
        }
    }, [id, token]);

    // Animate content appearance when loaded
    useEffect(() => {
        if (!isLoading) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isLoading]);

    // Delete strategy function
    const handleDeletePlan = () => {
        Alert.alert(
            "Delete Strategy",
            "Are you sure you want to delete this strategy? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsDeleting(true);
                            const response = await fetch(`${SERVER_URI}/plans/delete/${id}`, {
                                method: "DELETE",
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    Accept: "application/json",
                                },
                            });
                            const result = await response.json();

                            if (response.ok && result.success) {
                                Toast.show({
                                    type: "success",
                                    text1: "Deleted",
                                    text2: "Trading plan deleted successfully.",
                                });
                                router.back();
                            } else {
                                Toast.show({
                                    type: "error",
                                    text1: "Delete Failed",
                                    text2: result.message || "Could not delete strategy.",
                                });
                            }
                        } catch (error) {
                            Toast.show({
                                type: "error",
                                text1: "Network Error",
                                text2: "Failed to connect to server.",
                            });
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-3 text-xs text-text-muted">Loading strategy...</Text>
            </View>
        );
    }

    if (!setup) {
        return (
            <View className="flex-1 items-center justify-center bg-background px-6">
                <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                <Text className="mt-3 text-base font-bold text-text-primary">Strategy not found</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-5 rounded-2xl bg-primary px-6 py-3"
                >
                    <Text className="text-xs font-bold text-white">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const rulesCount = setup.rules?.length || 0;
    const setupIcon = icons[Math.floor(Math.random() * icons.length)];
    const hasImage = setup.image?.data && setup.image?.mimeType;

    return (
        <View className="flex-1 bg-background">
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: wp(5),
                    paddingTop: 55,
                    paddingBottom: 40,
                }}
                style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.back()}
                        className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface"
                    >
                        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Delete Icon Button */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleDeletePlan}
                        disabled={isDeleting}
                        className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-danger/10"
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color="#DC2626" />
                        ) : (
                            <Ionicons name="trash-outline" size={20} color="#DC2626" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Strategy Hero */}
                <View className="mt-7 items-center">
                    <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-primary/10">
                        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary">
                            <Ionicons name={setupIcon} size={27} color="#FFFFFF" />
                        </View>
                    </View>

                    <Text className="mt-5 text-center text-2xl font-bold text-text-primary">
                        {setup.name}
                    </Text>

                    <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
                        {setup.description || `Your trading rules and execution plan for ${setup.name}.`}
                    </Text>
                </View>

                {/* Stats */}
                <View className="mt-7 flex-row gap-3">
                    <StatCard
                        icon="checkmark-circle-outline"
                        value={rulesCount}
                        label={rulesCount === 1 ? "Rule" : "Rules"}
                    />
                    <StatCard
                        icon="images-outline"
                        value={hasImage ? 1 : 0}
                        label="Images Saved"
                    />
                </View>

                {/* About */}
                <SectionTitle icon="information-circle-outline" title="About this strategy" />
                <View className="mt-3 rounded-3xl border border-border bg-surface p-5">
                    <Text className="text-sm leading-6 text-text-secondary">
                        {setup.description || "This strategy contains your rules, execution conditions and examples."}
                    </Text>
                </View>

                {/* Setup Example Image (Rendered if available) */}
                {hasImage && (
                    <>
                        <SectionTitle icon="image-outline" title="Setup Example" />
                        <View className="mt-3 overflow-hidden rounded-3xl border border-border bg-surface p-2">
                            <Image
                                source={{ uri: `data:${setup.image.mimeType};base64,${setup.image.data}` }}
                                className="h-52 w-full rounded-2xl"
                                resizeMode="cover"
                            />
                        </View>
                    </>
                )}

                {/* Rules */}
                <SectionTitle icon="list-outline" title="Trading Rules" />
                <View className="mt-3 overflow-hidden rounded-3xl border border-border bg-surface">
                    {rulesCount > 0 ? (
                        setup.rules.map((ruleText: string, index: number) => (
                            <RuleRow
                                key={index}
                                number={index + 1}
                                text={ruleText}
                                isLast={index === rulesCount - 1}
                            />
                        ))
                    ) : (
                        <View className="items-center px-5 py-8">
                            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-surface-alt">
                                <Ionicons name="list-outline" size={22} color="#64748B" />
                            </View>
                            <Text className="mt-3 text-sm font-semibold text-text-primary">
                                No rules added yet
                            </Text>
                            <Text className="mt-1 text-center text-xs leading-5 text-text-muted">
                                Add your trading rules to make this strategy actionable.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Execution Checklist */}
                <SectionTitle icon="flash-outline" title="Before You Trade" />
                <View className="mt-3 rounded-3xl border border-border bg-surface p-5">
                    <ChecklistItem text="Market conditions match the strategy" />
                    <ChecklistItem text="Entry setup is clearly confirmed" />
                    <ChecklistItem text="Risk is defined before entry" />
                    <ChecklistItem text="Trade follows the strategy rules" />
                </View>
            </Animated.ScrollView>
        </View>
    );
}

function StatCard({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: number; label: string }) {
    return (
        <View className="flex-1 rounded-3xl border border-border bg-surface p-4">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Ionicons name={icon} size={19} color="#FFFFFF" />
            </View>
            <Text className="mt-4 text-2xl font-bold text-text-primary">{value}</Text>
            <Text className="mt-1 text-xs text-text-muted">{label}</Text>
        </View>
    );
}

function SectionTitle({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
    return (
        <View className="mt-7 flex-row items-center">
            <Ionicons name={icon} size={18} color="#FFFFFF" />
            <Text className="ml-2 text-base font-bold text-text-primary">{title}</Text>
        </View>
    );
}

function RuleRow({ number, text, isLast }: { number: number; text: string; isLast: boolean }) {
    return (
        <View className={`flex-row px-5 py-4 ${!isLast ? "border-b border-border" : ""}`}>
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Text className="text-xs font-bold text-primary">{number}</Text>
            </View>
            <Text className="ml-3 flex-1 text-sm leading-5 text-text-secondary">{text}</Text>
            <Ionicons name="checkmark-circle-outline" size={18} color="#64748B" />
        </View>
    );
}

function ChecklistItem({ text }: { text: string }) {
    return (
        <View className="mb-4 flex-row items-center last:mb-0">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-success/10">
                <Ionicons name="checkmark" size={15} color="#FFFFFF" />
            </View>
            <Text className="ml-3 flex-1 text-sm text-text-secondary">{text}</Text>
        </View>
    );
}