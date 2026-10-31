import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

const SERVER_URI = "https://jornal.rgmrabagardama.com.ng/api";

const PAIRS = [
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "USDCHF",
    "AUDUSD",
    "USDCAD",
    "XAUUSD",
    "ETHUSD",
];

const MOODS = [
    { label: "Focused", value: "FOCUSED", icon: "eye-outline" as const },
    { label: "Confident", value: "CONFIDENT", icon: "flash-outline" as const },
    { label: "Calm", value: "CALM", icon: "leaf-outline" as const },
    { label: "Uncertain", value: "UNCERTAIN", icon: "help-circle-outline" as const },
    { label: "Fearful", value: "FEARFUL", icon: "alert-circle-outline" as const },
    { label: "Greedy", value: "GREEDY", icon: "trending-up-outline" as const },
];

type ScreenshotType = "4H" | "15M" | "5M";

interface TradingPlan {
    id: string;
    name: string;
}

const formatDisplayUri = (img: any): string | null => {
    if (!img) return null;

    if (typeof img === "object" && img.data) {
        const mime = img.mimeType || "image/jpeg";
        return img.data.startsWith("data:") ? img.data : `data:${mime};base64,${img.data}`;
    }

    if (typeof img === "string") {
        if (img.startsWith("http") || img.startsWith("data:") || img.startsWith("file:")) {
            return img;
        }
        return `data:image/jpeg;base64,${img}`;
    }

    return null;
};

export default function DailyJournal() {
    const router = useRouter();
    const { date, id: journalId } = useLocalSearchParams<{ date?: string; id?: string }>();
    const { token } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pair, setPair] = useState("");
    const [planId, setPlanId] = useState("");
    const [planName, setPlanName] = useState("");
    const [plansList, setPlansList] = useState<TradingPlan[]>([]);

    const [beforeMood, setBeforeMood] = useState("CALM");
    const [afterMood, setAfterMood] = useState("CALM");

    const [entry, setEntry] = useState("");
    const [stopLoss, setStopLoss] = useState("");
    const [takeProfit, setTakeProfit] = useState("");
    const [risk, setRisk] = useState("");
    const [result, setResult] = useState("Win");

    const [notes, setNotes] = useState("");
    const [lesson, setLesson] = useState("");

    const [pairModal, setPairModal] = useState(false);
    const [planModal, setPlanModal] = useState(false);

    const [screenshots, setScreenshots] = useState<
        Record<ScreenshotType, string | null>
    >({
        "4H": null,
        "15M": null,
        "5M": null,
    });

    const [imagePickerVisible, setImagePickerVisible] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState<ScreenshotType | null>(null);

    const setDefaultPlans = () => {
        setPlansList([
            { id: "fallback_1", name: "London Breakout" },
            { id: "fallback_2", name: "Liquidity Sweep" },
            { id: "fallback_3", name: "Market Structure Break" },
            { id: "fallback_4", name: "Supply & Demand" },
        ]);
    };

    const fetchPlans = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(`${SERVER_URI}/plans/allplans`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const resultJson = await response.json();

            if (response.ok && resultJson.success && Array.isArray(resultJson.plans)) {
                const formattedPlans: TradingPlan[] = resultJson.plans
                    .map((p: any) => ({
                        id: p._id || p.id,
                        name: p.name || p.title,
                    }))
                    .filter((p: TradingPlan) => p.id && p.name);

                setPlansList(formattedPlans);
            } else {
                setDefaultPlans();
            }
        } catch (error) {
            console.log("Error fetching plans:", error);
            setDefaultPlans();
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            fetchPlans();
        }, [fetchPlans])
    );

    const openImagePicker = (timeframe: ScreenshotType) => {
        setSelectedTimeframe(timeframe);
        setImagePickerVisible(true);
    };

    const closeImagePicker = () => {
        setImagePickerVisible(false);
        setSelectedTimeframe(null);
    };

    const selectImage = async (source: "camera" | "gallery") => {
        if (!selectedTimeframe) return;

        try {
            let pickerResult: ImagePicker.ImagePickerResult;

            const pickerOptions: ImagePicker.ImagePickerOptions = {
                mediaTypes: ["images"],
                allowsEditing: true,
                quality: 0.4,
                base64: true,
            };

            if (source === "camera") {
                const permission = await ImagePicker.requestCameraPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert("Camera Permission", "Please allow camera access.");
                    return;
                }
                pickerResult = await ImagePicker.launchCameraAsync(pickerOptions);
            } else {
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert("Gallery Permission", "Please allow gallery access.");
                    return;
                }
                pickerResult = await ImagePicker.launchImageLibraryAsync(pickerOptions);
            }

            if (pickerResult.canceled) return;

            const asset = pickerResult.assets?.[0];
            if (!asset) return;

            const base64Data = asset.base64
                ? `data:image/jpeg;base64,${asset.base64}`
                : asset.uri;

            setScreenshots((previous) => ({
                ...previous,
                [selectedTimeframe]: base64Data,
            }));

            closeImagePicker();
        } catch (error) {
            console.error("Image selection error:", error);
            Alert.alert("Error", "Could not pick image.");
        }
    };

    const removeScreenshot = (timeframe: ScreenshotType) => {
        setScreenshots((prev) => ({ ...prev, [timeframe]: null }));
    };

    const handleDeleteJournal = () => {
        if (!journalId) return;

        Alert.alert(
            "Delete Journal",
            "Are you sure you want to delete this journal entry? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsDeleting(true);
                            const response = await fetch(`${SERVER_URI}/jornal/delete/${journalId}`, {
                                method: "DELETE",
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });

                            const resData = await response.json();

                            if (response.ok && resData.success) {
                                Alert.alert("Success", "Journal entry deleted successfully.", [
                                    { text: "OK", onPress: () => router.back() },
                                ]);
                            } else {
                                Alert.alert("Error", resData.message || "Failed to delete journal entry.");
                            }
                        } catch (error) {
                            console.error("Error deleting journal:", error);
                            Alert.alert("Error", "Server error while attempting to delete entry.");
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    const saveJournal = async () => {
        if (!pair) {
            Alert.alert("Required Field", "Please select a trading pair.");
            return;
        }

        if (!entry) {
            Alert.alert("Required Field", "Please enter an entry price.");
            return;
        }

        try {
            setIsLoading(true);

            const prepareImagePayload = (imageUri: string | null) => {
                if (!imageUri) return { data: null, mimeType: null };
                const cleanBase64 = imageUri.includes(",") ? imageUri.split(",")[1] : imageUri;
                return {
                    data: cleanBase64,
                    mimeType: "image/jpeg",
                };
            };

            const payload = {
                asset: pair,
                type: "LONG",
                pnl: result === "Win" ? 100 : result === "Loss" ? -50 : 0,
                entryPrice: parseFloat(entry) || 0,
                stopLoss: parseFloat(stopLoss) || 0,
                takeProfit: parseFloat(takeProfit) || 0,
                exitPrice: parseFloat(takeProfit) || parseFloat(entry) || 0,
                lotSize: 1.0,
                risk: parseFloat(risk) || 0,
                result: result,
                setup: planName || "General",
                emotion: beforeMood.toUpperCase(),
                afterEmotion: afterMood.toUpperCase(),
                notes: notes + (lesson ? `\nLesson: ${lesson}` : ""),
                plan: planId && !planId.startsWith("fallback_") ? planId : null,
                highTimeFrameImage: prepareImagePayload(screenshots["4H"]),
                mediumTimeFrameImage: prepareImagePayload(screenshots["15M"]),
                lowTimeFrameImage: prepareImagePayload(screenshots["5M"]),
                date: typeof date === "string" ? date : new Date().toISOString(),
            };

            const response = await fetch(`${SERVER_URI}/jornal/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const resultJson = await response.json();

            if (response.ok && resultJson.success) {
                Alert.alert("Success", "Journal created successfully!", [
                    { text: "OK", onPress: () => router.back() },
                ]);
            } else {
                Alert.alert("Validation Error", resultJson.message || "Failed to create journal entry.");
            }
        } catch (error) {
            console.log("Error creating journal:", error);
            Alert.alert("Error", "Server error or request payload was too large.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-background"
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 55,
                    paddingBottom: 50,
                }}
            >
                {/* Header Navigation */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            activeOpacity={0.8}
                            className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface"
                        >
                            <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
                        </TouchableOpacity>

                        <View className="ml-3 flex-1">
                            <Text className="text-2xl font-bold text-text-primary">
                                {journalId ? "Edit Journal" : "Add Journal"}
                            </Text>
                            <Text className="mt-1 text-xs text-text-muted">
                                {typeof date === "string" ? date : "Today"} • Review your trading day
                            </Text>
                        </View>
                    </View>

                    {/* Delete Icon Button when journalId is present */}
                    {journalId && (
                        <TouchableOpacity
                            onPress={handleDeleteJournal}
                            disabled={isDeleting}
                            activeOpacity={0.8}
                            className="h-11 w-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 ml-2"
                        >
                            {isDeleting ? (
                                <ActivityIndicator color="#EF4444" size="small" />
                            ) : (
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <SectionHeader icon="bar-chart-outline" title="Market" subtitle="What did you trade?" />

                <View className="mt-3">
                    <FieldLabel text="TRADING PAIR" />
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setPairModal(true)}
                        className="mt-2 flex-row items-center rounded-2xl border border-border bg-surface px-4 py-4"
                    >
                        <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                            <Ionicons name="swap-horizontal-outline" size={18} color="#3B82F6" />
                        </View>
                        <Text className={`ml-3 flex-1 text-sm ${pair ? "font-semibold text-text-primary" : "text-text-muted"}`}>
                            {pair || "Select trading pair"}
                        </Text>
                        <Ionicons name="chevron-down" size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <SectionHeader icon="map-outline" title="Trading Plan" subtitle="Which setup did you follow?" />

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPlanModal(true)}
                    className="mt-3 flex-row items-center rounded-2xl border border-border bg-surface px-4 py-4"
                >
                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                        <Ionicons name="book-outline" size={18} color="#3B82F6" />
                    </View>
                    <Text className={`ml-3 flex-1 text-sm ${planName ? "font-semibold text-text-primary" : "text-text-muted"}`}>
                        {planName || "Select your trading plan"}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#64748B" />
                </TouchableOpacity>

                <SectionHeader icon="time-outline" title="Before the Trade" subtitle="Capture your mindset before entering." />
                <Text className="mt-4 text-xs font-semibold text-text-secondary">HOW WERE YOU FEELING?</Text>

                <View className="mt-3 flex-row flex-wrap gap-2">
                    {MOODS.map((item) => (
                        <MoodButton
                            key={item.label}
                            label={item.label}
                            icon={item.icon}
                            selected={beforeMood === item.value}
                            onPress={() => setBeforeMood(item.value)}
                        />
                    ))}
                </View>

                <SectionHeader icon="options-outline" title="Trade Setup" subtitle="Record the important execution levels." />

                <View className="mt-3 flex-row gap-3">
                    <InputField label="ENTRY" value={entry} onChangeText={setEntry} placeholder="0.00000" icon="enter-outline" keyboardType="decimal-pad" />
                    <InputField label="STOP LOSS" value={stopLoss} onChangeText={setStopLoss} placeholder="0.00000" icon="close-circle-outline" keyboardType="decimal-pad" />
                </View>

                <View className="mt-3 flex-row gap-3">
                    <InputField label="TAKE PROFIT" value={takeProfit} onChangeText={setTakeProfit} placeholder="0.00000" icon="flag-outline" keyboardType="decimal-pad" />
                    <InputField label="RISK (%)" value={risk} onChangeText={setRisk} placeholder="1" icon="shield-checkmark-outline" keyboardType="decimal-pad" />
                </View>

                <SectionHeader icon="images-outline" title="Chart Analysis" subtitle="Save your analysis across timeframes." />

                <View className="mt-3">
                    {(["4H", "15M", "5M"] as ScreenshotType[]).map((tf) => {
                        const meta: Record<ScreenshotType, { title: string; desc: string }> = {
                            "4H": { title: "Higher Timeframe", desc: "Market structure & overall bias" },
                            "15M": { title: "Medium Timeframe", desc: "Setup & confirmation" },
                            "5M": { title: "Lower Timeframe", desc: "Entry & execution" },
                        };
                        return (
                            <ChartScreenshot
                                key={tf}
                                timeframe={tf}
                                title={meta[tf].title}
                                description={meta[tf].desc}
                                image={screenshots[tf]}
                                onPick={() => openImagePicker(tf)}
                                onRemove={() => removeScreenshot(tf)}
                            />
                        );
                    })}
                </View>

                <SectionHeader icon="checkmark-done-outline" title="After the Trade" subtitle="Review what happened." />
                <Text className="mt-4 text-xs font-semibold text-text-secondary">HOW DID YOU FEEL AFTER?</Text>

                <View className="mt-3 flex-row flex-wrap gap-2">
                    {MOODS.map((item) => (
                        <MoodButton
                            key={item.label}
                            label={item.label}
                            icon={item.icon}
                            selected={afterMood === item.value}
                            onPress={() => setAfterMood(item.value)}
                        />
                    ))}
                </View>

                <Text className="mt-5 text-xs font-semibold text-text-secondary">RESULT</Text>

                <View className="mt-3 flex-row gap-2">
                    {["Win", "Loss", "Break Even"].map((item) => {
                        const selected = result === item;
                        return (
                            <TouchableOpacity
                                key={item}
                                activeOpacity={0.8}
                                onPress={() => setResult(item)}
                                className={`flex-1 items-center rounded-2xl border px-3 py-3 ${selected ? "border-primary bg-primary/10" : "border-border bg-surface"}`}
                            >
                                <Text className={`text-xs font-semibold ${selected ? "text-primary" : "text-text-secondary"}`}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <SectionHeader icon="document-text-outline" title="Journal Notes" subtitle="Write down what you learned." />
                <FieldLabel text="TRADE NOTES" />

                <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    textAlignVertical="top"
                    placeholder="What happened during this trade?"
                    placeholderTextColor="#64748B"
                    className="mt-2 min-h-[120px] rounded-2xl border border-border bg-surface px-4 py-4 text-sm leading-5 text-text-primary"
                />

                <FieldLabel text="LESSON / TAKEAWAY" />

                <TextInput
                    value={lesson}
                    onChangeText={setLesson}
                    multiline
                    textAlignVertical="top"
                    placeholder="What will you repeat or improve next time?"
                    placeholderTextColor="#64748B"
                    className="mt-2 min-h-[120px] rounded-2xl border border-border bg-surface px-4 py-4 text-sm leading-5 text-text-primary"
                />

                <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={isLoading}
                    onPress={saveJournal}
                    className="mt-7 flex-row items-center justify-center rounded-2xl bg-primary py-4 shadow-lg"
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                            <Text className="ml-2 text-sm font-bold text-white">Save Journal</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <SelectionModal
                visible={pairModal}
                title="Select Trading Pair"
                items={PAIRS}
                selected={pair}
                onSelect={(value) => {
                    setPair(value);
                    setPairModal(false);
                }}
                onClose={() => setPairModal(false)}
            />

            <PlanSelectionModal
                visible={planModal}
                title="Select Trading Plan"
                plans={plansList}
                selectedName={planName}
                onSelect={(selectedPlan) => {
                    setPlanId(selectedPlan.id);
                    setPlanName(selectedPlan.name);
                    setPlanModal(false);
                }}
                onClose={() => setPlanModal(false)}
            />

            <ImagePickerModal
                visible={imagePickerVisible}
                timeframe={selectedTimeframe}
                onCamera={() => selectImage("camera")}
                onGallery={() => selectImage("gallery")}
                onClose={closeImagePicker}
            />
        </KeyboardAvoidingView>
    );
}

function SectionHeader({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }) {
    return (
        <View className="mt-8">
            <View className="flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <Ionicons name={icon} size={18} color="#3B82F6" />
                </View>
                <View className="ml-3">
                    <Text className="text-base font-bold text-text-primary">{title}</Text>
                    <Text className="mt-0.5 text-xs text-text-muted">{subtitle}</Text>
                </View>
            </View>
        </View>
    );
}

function FieldLabel({ text }: { text: string }) {
    return <Text className="mt-5 text-xs font-semibold text-text-secondary">{text}</Text>;
}

function MoodButton({ label, icon, selected, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; selected: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className={`flex-row items-center rounded-2xl border px-4 py-3 ${selected ? "border-primary bg-primary/10" : "border-border bg-surface"}`}
        >
            <Ionicons name={icon} size={16} color={selected ? "#3B82F6" : "#64748B"} />
            <Text className={`ml-2 text-xs font-semibold ${selected ? "text-primary" : "text-text-secondary"}`}>{label}</Text>
        </TouchableOpacity>
    );
}

function InputField({ label, value, onChangeText, placeholder, icon, keyboardType = "default" }: any) {
    return (
        <View className="flex-1">
            <Text className="text-xs font-semibold text-text-secondary">{label}</Text>
            <View className="mt-2 flex-row items-center rounded-2xl border border-border bg-surface px-3">
                <Ionicons name={icon} size={16} color="#64748B" />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#64748B"
                    keyboardType={keyboardType}
                    className="ml-2 flex-1 py-4 text-xs text-text-primary"
                />
            </View>
        </View>
    );
}

function ChartScreenshot({ timeframe, title, description, image, onPick, onRemove }: any) {
    const formattedUri = formatDisplayUri(image);

    return (
        <View className="mb-3 overflow-hidden rounded-3xl border border-border bg-surface">
            {formattedUri ? (
                <View className="relative">
                    <TouchableOpacity activeOpacity={0.9} onPress={onPick}>
                        <Image
                            source={{ uri: formattedUri }}
                            className="h-52 w-full"
                            resizeMode="cover"
                        />
                        <View className="p-4">
                            <Text className="text-sm font-bold text-text-primary">{title}</Text>
                            <Text className="mt-1 text-xs text-text-muted">{description}</Text>
                            <View className="mt-3 flex-row items-center">
                                <Ionicons name="refresh-outline" size={14} color="#3B82F6" />
                                <Text className="ml-1 text-xs font-semibold text-primary">Tap to replace</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View className="absolute left-3 top-3 rounded-xl border border-white/10 bg-black/70 px-3 py-2">
                        <Text className="text-xs font-bold text-white">{timeframe}</Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onRemove}
                        className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/70"
                    >
                        <Ionicons name="trash-outline" size={17} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity activeOpacity={0.8} onPress={onPick} className="flex-row items-center p-4">
                    <View className="h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                        <Text className="text-sm font-bold text-primary">{timeframe}</Text>
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-sm font-bold text-text-primary">{title}</Text>
                        <Text className="mt-1 text-xs text-text-muted">{description}</Text>
                    </View>
                    <View className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-alt">
                        <Ionicons name="add" size={20} color="#3B82F6" />
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}

function ImagePickerModal({ visible, timeframe, onCamera, onGallery, onClose }: any) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/70">
                <View className="rounded-t-[32px] border-t border-border bg-background px-5 pb-8 pt-4">
                    <View className="mb-5 items-center">
                        <View className="h-1.5 w-12 rounded-full bg-surface-alt" />
                    </View>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-text-primary">Add Chart Screenshot</Text>
                            <Text className="mt-1 text-xs text-text-muted">{timeframe ? `Add your ${timeframe} chart` : "Choose source"}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface">
                            <Ionicons name="close" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                    <View className="mt-6 flex-row gap-3">
                        <TouchableOpacity activeOpacity={0.8} onPress={onCamera} className="flex-1 items-center rounded-3xl border border-border bg-surface p-5">
                            <View className="h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                                <Ionicons name="camera-outline" size={28} color="#3B82F6" />
                            </View>
                            <Text className="mt-4 text-sm font-bold text-text-primary">Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={onGallery} className="flex-1 items-center rounded-3xl border border-border bg-surface p-5">
                            <View className="h-16 w-16 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
                                <Ionicons name="images-outline" size={28} color="#14B8A6" />
                            </View>
                            <Text className="mt-4 text-sm font-bold text-text-primary">Gallery</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity activeOpacity={0.8} onPress={onClose} className="mt-4 items-center rounded-2xl border border-border bg-surface py-4">
                        <Text className="text-sm font-semibold text-text-secondary">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function SelectionModal({ visible, title, items, selected, onSelect, onClose }: any) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/60">
                <View className="max-h-[70%] rounded-t-[32px] border-t border-border bg-background px-5 pb-8 pt-4">
                    <View className="mb-5 items-center">
                        <View className="h-1.5 w-12 rounded-full bg-surface-alt" />
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-text-primary">{title}</Text>
                        <TouchableOpacity onPress={onClose} className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface">
                            <Ionicons name="close" size={19} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} className="mt-5">
                        {items.map((item: string) => {
                            const isSelected = selected === item;
                            return (
                                <TouchableOpacity
                                    key={item}
                                    activeOpacity={0.8}
                                    onPress={() => onSelect(item)}
                                    className={`mb-2 flex-row items-center rounded-2xl border p-4 ${isSelected ? "border-primary bg-primary/10" : "border-border bg-surface"}`}
                                >
                                    <Text className={`flex-1 text-sm font-semibold ${isSelected ? "text-primary" : "text-text-primary"}`}>{item}</Text>
                                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function PlanSelectionModal({ visible, title, plans, selectedName, onSelect, onClose }: any) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/60">
                <View className="max-h-[70%] rounded-t-[32px] border-t border-border bg-background px-5 pb-8 pt-4">
                    <View className="mb-5 items-center">
                        <View className="h-1.5 w-12 rounded-full bg-surface-alt" />
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-text-primary">{title}</Text>
                        <TouchableOpacity onPress={onClose} className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface">
                            <Ionicons name="close" size={19} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} className="mt-5">
                        {plans.map((item: TradingPlan) => {
                            const isSelected = selectedName === item.name;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.8}
                                    onPress={() => onSelect(item)}
                                    className={`mb-2 flex-row items-center rounded-2xl border p-4 ${isSelected ? "border-primary bg-primary/10" : "border-border bg-surface"}`}
                                >
                                    <Text className={`flex-1 text-sm font-semibold ${isSelected ? "text-primary" : "text-text-primary"}`}>{item.name}</Text>
                                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}