import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    FlatList,
    Image,
    ListRenderItemInfo,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

const STORAGE_KEY = "hasCompletedOnboarding";

const onboardingData = [
    {
        id: "1",
        image: require("../../../assets/images/onboarding/1.jpg"),
        title: "Journal every trade",
        description:
            "Record trades, learn from outcomes, and improve your edge.",
    },
    {
        id: "2",
        image: require("../../../assets/images/onboarding/2.jpg"),
        title: "Track market performance",
        description:
            "See which markets and setups work best for you.",
    },
    {
        id: "3",
        image: require("../../../assets/images/onboarding/3.jpg"),
        title: "Refine your style",
        description:
            "Capture setups, notes and ideas that define your strategy.",
    },
    {
        id: "4",
        image: require("../../../assets/images/onboarding/4.jpg"),
        title: "Get started",
        description:
            "Start logging and reviewing trades to build consistency.",
    },
];

export default function Onboarding() {
    const { width, height } = useWindowDimensions();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Inside Onboarding component:
    const { token, isLoading } = useAuth();

    useEffect(() => {
        const checkInitialRoute = async () => {
            if (isLoading) return;

            if (token) {
                router.replace("/(app)/(tabs)");
                return;
            }

            const hasCompleted = await AsyncStorage.getItem("hasCompletedOnboarding");
            if (hasCompleted === "true") {
                router.replace("/(auth)/login");
            }
        };

        checkInitialRoute();
    }, [token, isLoading]);

    const [activeIndex, setActiveIndex] = useState(0);
    const flatRef = useRef<FlatList<(typeof onboardingData)[0]> | null>(null);
    const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

    // Keep track of activeIndex in a ref so the interval closure always sees the latest value
    const activeIndexRef = useRef(activeIndex);
    activeIndexRef.current = activeIndex;

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;

    const onViewRef = useRef(({ viewableItems }: any) => {
        if (viewableItems?.length > 0) {
            setActiveIndex(viewableItems[0].index ?? 0);
        }
    }).current;

    const completeAndExit = useCallback(async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, "true");
        } catch {
            // Ignore storage errors
        }
        router.replace("/(auth)/login");
    }, [router]);

    const handleNext = useCallback(() => {
        const nextIndex = activeIndexRef.current + 1;
        if (nextIndex < onboardingData.length) {
            flatRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
            setActiveIndex(nextIndex);
        } else {
            completeAndExit();
        }
    }, [completeAndExit]);

    const handleSkip = useCallback(() => {
        completeAndExit();
    }, [completeAndExit]);

    // Start or restart the auto-scroll timer cleanly
    const startAutoScroll = useCallback(() => {
        if (autoScrollTimer.current) {
            clearInterval(autoScrollTimer.current);
        }

        autoScrollTimer.current = setInterval(() => {
            const currentIndex = activeIndexRef.current;
            if (currentIndex < onboardingData.length - 1) {
                const nextIndex = currentIndex + 1;
                flatRef.current?.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });
                setActiveIndex(nextIndex);
            } else {
                // Loop back to start
                flatRef.current?.scrollToIndex({
                    index: 0,
                    animated: true,
                });
                setActiveIndex(0);
            }
        }, 4000);
    }, []);

    // Pause timer temporarily when user interacts manually, then resume
    const resetTimer = useCallback(() => {
        if (autoScrollTimer.current) {
            clearInterval(autoScrollTimer.current);
        }
        // Restart timer after a short break (e.g., 6 seconds of inactivity)
        const resumeTimer = setTimeout(() => {
            startAutoScroll();
        }, 6000);

        return () => clearTimeout(resumeTimer);
    }, [startAutoScroll]);

    // Initialize auto-scroll on mount and clean up on unmount
    useEffect(() => {
        startAutoScroll();
        return () => {
            if (autoScrollTimer.current) {
                clearInterval(autoScrollTimer.current);
            }
        };
    }, [startAutoScroll]);

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<(typeof onboardingData)[0]>) => {
            return (
                <View style={{ width, height, backgroundColor: "#070A10" }}>
                    {/* FULL-SCREEN IMAGE */}
                    <View
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                    >
                        <Image
                            source={item.image}
                            resizeMode="cover"
                            accessibilityLabel={item.title}
                            style={{ width: "100%", height: "100%" }}
                        />
                    </View>

                    {/* DARK GRADIENT OVERLAY */}
                    <LinearGradient
                        colors={[
                            "rgba(7, 10, 16, 0.10)",
                            "rgba(7, 10, 16, 0.25)",
                            "rgba(7, 10, 16, 0.82)",
                            "#070A10",
                        ]}
                        locations={[0, 0.35, 0.72, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                    />

                    {/* SKIP BUTTON */}
                    <View
                        style={{
                            position: "absolute",
                            top: insets.top + hp("1.5%"),
                            right: wp("6%"),
                        }}
                    >
                        <TouchableOpacity
                            onPress={handleSkip}
                            accessibilityRole="button"
                            accessibilityLabel="Skip onboarding"
                            hitSlop={12}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={{
                                    color: "rgba(255,255,255,0.85)",
                                    fontSize: wp("3.7%"),
                                    fontWeight: "600",
                                }}
                            >
                                Skip
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* CONTENT WITH REANIMATED FADE/SLIDE */}
                    <Animated.View
                        entering={FadeInDown.duration(400).springify()}
                        style={{
                            position: "absolute",
                            left: wp("7%"),
                            right: wp("7%"),
                            bottom: hp("24%"),
                        }}
                    >
                        <Text
                            style={{
                                color: "#FFFFFF",
                                fontSize: wp("8%"),
                                lineHeight: wp("9.5%"),
                                fontWeight: "800",
                                textAlign: "center",
                            }}
                        >
                            {item.title}
                        </Text>

                        <Text
                            style={{
                                color: "rgba(255,255,255,0.72)",
                                fontSize: wp("4%"),
                                lineHeight: wp("6%"),
                                textAlign: "center",
                                marginTop: hp("1.5%"),
                                paddingHorizontal: wp("3%"),
                            }}
                        >
                            {item.description}
                        </Text>
                    </Animated.View>
                </View>
            );
        },
        [width, height, insets.top, handleSkip]
    );

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#070A10" }}
            edges={["top", "bottom"]}
        >
            <View style={{ flex: 1 }} onTouchStart={resetTimer}>
                {/* SLIDES */}
                <FlatList
                    ref={flatRef}
                    data={onboardingData}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    renderItem={renderItem}
                    onViewableItemsChanged={onViewRef}
                    viewabilityConfig={viewabilityConfig}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                    onScrollToIndexFailed={(info) => {
                        setTimeout(() => {
                            flatRef.current?.scrollToOffset({
                                offset: info.averageItemLength * info.index,
                                animated: true,
                            });
                        }, 100);
                    }}
                />

                {/* BOTTOM CONTROLS */}
                <View
                    style={{
                        position: "absolute",
                        left: wp("6%"),
                        right: wp("6%"),
                        bottom: Math.max(insets.bottom, hp("1.5%")),
                    }}
                >
                    {/* PAGINATION DOTS */}
                    <View
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: hp("2.5%"),
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: wp("2%"),
                            }}
                        >
                            {onboardingData.map((_, index) => {
                                const active = activeIndex === index;
                                return (
                                    <View
                                        key={index}
                                        style={{
                                            width: active ? wp("8%") : wp("2.5%"),
                                            height: wp("2%"),
                                            borderRadius: wp("2%"),
                                            backgroundColor: active
                                                ? "#7C3AED"
                                                : "rgba(255,255,255,0.25)",
                                        }}
                                    />
                                );
                            })}
                        </View>
                    </View>

                    {/* NEXT BUTTON */}
                    <TouchableOpacity
                        onPress={() => {
                            resetTimer();
                            handleNext();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={
                            activeIndex === onboardingData.length - 1
                                ? "Get started"
                                : "Next onboarding slide"
                        }
                        activeOpacity={0.85}
                        style={{
                            width: "100%",
                            height: hp("6.5%"),
                            minHeight: 50,
                            borderRadius: wp("3.5%"),
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#7C3AED",
                        }}
                    >
                        <Text
                            style={{
                                color: "#FFFFFF",
                                fontSize: wp("4%"),
                                fontWeight: "700",
                            }}
                        >
                            {activeIndex === onboardingData.length - 1
                                ? "Get Started"
                                : "Next"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}