import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from "expo-image-picker";
import { useRouter, useFocusEffect } from "expo-router"; // Added useFocusEffect
import { useRef, useState, useCallback, useEffect } from "react"; // Added useCallback, removed useEffect if unused elsewhere
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Toast from "react-native-toast-message";

const SERVER_URI = "https://jornal.rgmrabagardama.com.ng/api";

type PlaybookItem = {
    id: string;
    name: string;
    rules: string[];
    examples: number;
    description?: string;
    image?: string;
    icon?: keyof typeof Ionicons.glyphMap;
};

const defaultIcons: (keyof typeof Ionicons.glyphMap)[] = [
    "analytics-outline",
    "trending-up-outline",
    "git-branch-outline",
    "flash-outline",
    "layers-outline",
];

export default function Playbook() {
    const router = useRouter();
    const { token } = useAuth();

    const [plans, setPlans] = useState<PlaybookItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); // Added submission lock state
    const [modalVisible, setModalVisible] = useState(false);
    const [search, setSearch] = useState("");

    const [planName, setPlanName] = useState("");
    const [description, setDescription] = useState("");
    const [ruleInput, setRuleInput] = useState("");
    const [rulesList, setRulesList] = useState<string[]>([]);
    const [imageUri, setImageUri] = useState("");

    const fabScale = useRef(new Animated.Value(0)).current;

    // Fetch plans from backend database with deep logging
    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            // console.log("🚀 [Playbook] Fetching plans from:", `${SERVER_URI}/plans/allplans`);
            // console.log("🔑 [Playbook] Token present:", token ? "Yes" : "No");

            const response = await fetch(`${SERVER_URI}/plans/allplans`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // 1. Grab the response text first instead of doing .json() directly
            const responseText = await response.text();

            // 2. Log the first 150 characters to see if it's HTML ("<!DOCTYPE...") or JSON
            // console.log("📥 [Playbook] Raw response preview:", responseText.substring(0, 150));

            // 3. Check if response is HTML or not OK
            if (!response.ok || responseText.trim().startsWith("<")) {
                throw new Error(`Server returned HTML/Error status ${response.status}: Check Render deployment status.`);
            }

            // 4. Safely parse JSON if it passed the check
            const data = JSON.parse(responseText);

            if (data.success && Array.isArray(data.plans)) {
                const formattedPlans = data.plans.map((item: any, index: number) => ({
                    id: item._id || item.id,
                    name: item.name,
                    description: item.description,
                    rules: item.rules || [],
                    examples: item.image ? 1 : 0,
                    image: item.image,
                    icon: defaultIcons[index % defaultIcons.length],
                }));
                setPlans(formattedPlans);
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: data.message || "Failed to load playbook strategies.",
                });
            }
        } catch (error) {
            // console.error("❌ [Playbook] Fetch exception error:", error);
            Toast.show({
                type: "error",
                text1: "Connection Error",
                text2: "Server might be waking up or offline.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Refetch plans every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchPlans();
        }, [token])
    );

    // Keep your FAB animation inside a separate useEffect so it only runs once on mount
    useEffect(() => {
        Animated.spring(fabScale, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
        }).start();
    }, []);

    const filteredPlans = plans.filter((plan) =>
        plan.name.toLowerCase().includes(search.toLowerCase().trim())
    );

    const resetForm = () => {
        setPlanName("");
        setDescription("");
        setRuleInput("");
        setRulesList([]);
        setImageUri("");
    };

    const closeModal = () => {
        if (isSubmitting) return; // Prevent closing while submitting
        setModalVisible(false);
        resetForm();
    };

    const addRuleToList = () => {
        if (!ruleInput.trim()) return;
        setRulesList([...rulesList, ruleInput.trim()]);
        setRuleInput("");
    };

    const removeRule = (index: number) => {
        setRulesList(rulesList.filter((_, i) => i !== index));
    };

    const pickImageFromGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Permission to access the media library is required!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhotoWithCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Permission to access the camera is required!");
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    // Send new plan to backend database with Base64 image conversion
    const addPlan = async () => {
        if (isSubmitting) return; // Prevent duplicate execution attempts

        if (!planName.trim()) {
            Toast.show({ type: "error", text1: "Validation Error", text2: "Plan name is required." });
            return;
        }

        try {
            setIsSubmitting(true);
            // console.log("📤 [Playbook] Creating new plan:", planName);

            let imagePayload = undefined;

            if (imageUri) {
                // 1. Read the local image file as a Base64 string using legacy FileSystem
                const base64Data = await FileSystem.readAsStringAsync(imageUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                // 2. Extract file extension to determine mimeType (default to jpeg if missing)
                const uriParts = imageUri.split(".");
                const fileExtension = uriParts[uriParts.length - 1] || "jpeg";
                const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

                // 3. Format into the object structure your backend demands
                imagePayload = {
                    data: base64Data,
                    mimeType: mimeType,
                };
            }

            const response = await fetch(`${SERVER_URI}/plans/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: planName.trim(),
                    description: description.trim(),
                    rules: rulesList.length > 0 ? rulesList : ["Follow risk management"],
                    image: imagePayload,
                }),
            });

            const data = await response.json();
            // console.log("📥 [Playbook] Creation response:", JSON.stringify(data, null, 2));

            if (response.ok && data.success) {
                Toast.show({ type: "success", text1: "Strategy added successfully!" });
                fetchPlans(); // Refresh list from DB
                closeModal();
            } else {
                Toast.show({ type: "error", text1: "Failed to save strategy", text2: data.message || "Unknown error occurred" });
            }
        } catch (error) {
            // console.error("❌ [Playbook] Add plan exception error:", error);
            Toast.show({ type: "error", text1: "Error", text2: "Network request failed." });
        } finally {
            setIsSubmitting(false); // Re-enable button whether it succeeds or fails
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-3 text-xs text-text-muted">Loading your playbook...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <FlatList
                data={filteredPlans}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <AnimatedPlanCard
                        item={item}
                        index={index}
                        onPress={() => router.push(`/(app)/playbook/${item.id}`)}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: wp(5),
                    paddingTop: 55,
                    paddingBottom: 120,
                }}
                ListHeaderComponent={
                    <>
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1">
                                <Text className="text-3xl font-bold text-text-primary">Playbook</Text>
                                <Text className="mt-1 text-sm leading-5 text-text-muted">
                                    Build, refine and follow your trading strategies.
                                </Text>
                            </View>
                            <View className="ml-3 h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                                <Ionicons name="book-outline" size={21} color="#FFFFFF" />
                            </View>
                        </View>

                        {/* Search Input */}
                        <View className="mt-6 flex-row items-center rounded-2xl border border-border bg-surface px-4">
                            <Ionicons name="search-outline" size={19} color="#64748B" />
                            <TextInput
                                value={search}
                                onChangeText={setSearch}
                                placeholder="Search your strategies..."
                                placeholderTextColor="#64748B"
                                className="ml-3 flex-1 py-4 text-sm text-text-primary"
                            />
                        </View>

                        <View className="mt-7 flex-row items-end justify-between">
                            <View>
                                <Text className="text-lg font-bold text-text-primary">My Strategies</Text>
                                <Text className="mt-1 text-xs text-text-muted">
                                    {plans.length} {plans.length === 1 ? "strategy" : "strategies"} in your playbook
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                activeOpacity={0.8}
                                className="flex-row items-center"
                            >
                                <Ionicons name="add-circle-outline" size={17} color="#FFFFFF" />
                                <Text className="ml-1 text-xs font-semibold text-primary">Add plan</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <View className="mt-5 items-center rounded-3xl border border-border bg-surface px-6 py-12">
                        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-surface-alt">
                            <Ionicons name="book-outline" size={28} color="#64748B" />
                        </View>
                        <Text className="mt-5 text-base font-bold text-text-primary">No strategies found</Text>
                        <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
                            Create your first trading plan and start building your playbook.
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => setModalVisible(true)}
                            className="mt-5 rounded-2xl bg-primary px-5 py-3"
                        >
                            <Text className="text-sm font-bold text-white">Create Strategy</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Floating Action Button */}
            <Animated.View style={{ transform: [{ scale: fabScale }] }} className="absolute bottom-6 right-5">
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setModalVisible(true)}
                    className="h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg"
                >
                    <Ionicons name="add" size={30} color="#FFFFFF" />
                </TouchableOpacity>
            </Animated.View>

            {/* Add Strategy Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1 justify-end bg-black/60"
                >
                    <View className="max-h-[85%] rounded-t-3xl border-t border-border bg-surface p-6">
                        <View className="flex-row items-center justify-between pb-4">
                            <Text className="text-xl font-bold text-text-primary">New Strategy</Text>
                            <TouchableOpacity onPress={closeModal} disabled={isSubmitting}>
                                <Ionicons name="close" size={24} color={isSubmitting ? "#334155" : "#64748B"} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="my-2">
                            <Text className="mb-2 text-xs font-semibold text-text-muted">Strategy Name</Text>
                            <TextInput
                                value={planName}
                                onChangeText={setPlanName}
                                placeholder="e.g., Opening Range Breakout"
                                placeholderTextColor="#64748B"
                                editable={!isSubmitting}
                                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-text-primary"
                            />

                            <Text className="mb-2 mt-4 text-xs font-semibold text-text-muted">Description</Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Brief overview of how this strategy works..."
                                placeholderTextColor="#64748B"
                                multiline
                                numberOfLines={3}
                                editable={!isSubmitting}
                                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-text-primary"
                                style={{ textAlignVertical: 'top' }}
                            />

                            <Text className="mb-2 mt-4 text-xs font-semibold text-text-muted">Execution Rules</Text>
                            <View className="flex-row items-center">
                                <TextInput
                                    value={ruleInput}
                                    onChangeText={setRuleInput}
                                    placeholder="Add rule (e.g., Wait for 5m candle close)"
                                    placeholderTextColor="#64748B"
                                    editable={!isSubmitting}
                                    className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-text-primary"
                                />
                                <TouchableOpacity
                                    onPress={addRuleToList}
                                    disabled={isSubmitting}
                                    className="ml-2 rounded-2xl bg-primary p-3"
                                >
                                    <Ionicons name="add" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>

                            {rulesList.map((rule, idx) => (
                                <View key={idx} className="mt-2 flex-row items-center justify-between rounded-xl bg-background px-3 py-2 border border-border">
                                    <Text className="flex-1 text-xs text-text-primary">{idx + 1}. {rule}</Text>
                                    <TouchableOpacity onPress={() => removeRule(idx)} disabled={isSubmitting}>
                                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <Text className="mb-2 mt-4 text-xs font-semibold text-text-muted">Setup Example Image (Optional)</Text>
                            {imageUri ? (
                                <View className="relative mt-1 h-40 w-full overflow-hidden rounded-2xl border border-border">
                                    <Image source={{ uri: imageUri }} className="h-full w-full" />
                                    <TouchableOpacity
                                        onPress={() => setImageUri("")}
                                        disabled={isSubmitting}
                                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5"
                                    >
                                        <Ionicons name="close" size={16} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View className="flex-row space-x-3 mt-1">
                                    <TouchableOpacity
                                        onPress={pickImageFromGallery}
                                        disabled={isSubmitting}
                                        className="flex-1 flex-row items-center justify-center rounded-2xl border border-border bg-background py-3"
                                    >
                                        <Ionicons name="image-outline" size={18} color="#3B82F6" />
                                        <Text className="ml-2 text-xs font-semibold text-text-primary">Gallery</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={takePhotoWithCamera}
                                        disabled={isSubmitting}
                                        className="flex-1 flex-row items-center justify-center rounded-2xl border border-border bg-background py-3"
                                    >
                                        <Ionicons name="camera-outline" size={18} color="#3B82F6" />
                                        <Text className="ml-2 text-xs font-semibold text-text-primary">Camera</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>

                        {/* Save Button with Spinner and Disabled State */}
                        <TouchableOpacity
                            onPress={addPlan}
                            disabled={isSubmitting}
                            activeOpacity={0.85}
                            className={`mt-4 rounded-2xl bg-primary py-4 items-center justify-center flex-row ${isSubmitting ? "opacity-70" : ""
                                }`}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text className="text-sm font-bold text-white">Save Strategy</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

/* -----------------------------------------
   Animated Strategy Card
------------------------------------------ */

function AnimatedPlanCard({
    item,
    index,
    onPress,
}: {
    item: PlaybookItem;
    index: number;
    onPress: () => void;
}) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(15)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 350,
                delay: index * 70,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 350,
                delay: index * 70,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const rulesCount = Array.isArray(item.rules) ? item.rules.length : Number(item.rules) || 0;

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                className="mb-3 rounded-3xl border border-border bg-surface p-4"
            >
                <View className="flex-row items-center">
                    {/* Icon */}
                    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                        <Ionicons
                            name={item.icon || "book-outline"}
                            size={22}
                            color="#FFFFFF"
                        />
                    </View>

                    {/* Content */}
                    <View className="ml-3 flex-1">
                        <Text className="text-base font-bold text-text-primary">
                            {item.name}
                        </Text>
                        <Text numberOfLines={1} className="mt-1 text-xs text-text-muted">
                            {item.description || "Trading strategy and execution rules"}
                        </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={17} color="#64748B" />
                </View>

                {/* Divider */}
                <View className="my-4 h-px bg-border" />

                {/* Stats */}
                <View className="flex-row">
                    <View className="flex-1 flex-row items-center">
                        <Ionicons name="checkmark-circle-outline" size={16} color="#64748B" />
                        <Text className="ml-2 text-xs text-text-muted">
                            {rulesCount} {rulesCount === 1 ? "Rule" : "Rules"}
                        </Text>
                    </View>

                    <View className="flex-1 flex-row items-center">
                        <Ionicons name="images-outline" size={16} color="#64748B" />
                        <Text className="ml-2 text-xs text-text-muted">
                            {item.examples} {item.examples === 1 ? "Example" : "Examples"}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}