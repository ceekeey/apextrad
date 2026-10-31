import { useAuth } from "@/context/AuthContext"; // Adjust path to your AuthContext
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const SERVER_URI = "https://jornal.rgmrabagardama.com.ng/api";

interface JournalEntry {
    _id: string;
    asset: string;
    type?: string;
    pnl: number;
    entryPrice?: number;
    createdAt?: string;
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <View
            className="flex-1 rounded-2xl border border-border bg-surface p-4"
            style={{ minHeight: hp(12) }}
        >
            <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Ionicons name={icon} size={18} color="#2563EB" />
            </View>

            <Text className="text-xs font-medium text-text-muted">
                {label}
            </Text>

            <Text className="mt-1 text-xl font-bold text-text-primary">
                {value}
            </Text>
        </View>
    );
}

export default function Dashboard() {
    const router = useRouter();
    const { token } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [recentTrades, setRecentTrades] = useState<any[]>([]);

    // Live metrics state
    const [totalPnl, setTotalPnl] = useState("+$0");
    const [rMultiple, setRMultiple] = useState("+0.0R");
    const [winRate, setWinRate] = useState("0%");
    const [totalTradesCount, setTotalTradesCount] = useState("0");

    // Formatted current date string for header
    const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    }).format(new Date());

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            const fetchDashboardData = async () => {
                if (!token) return;

                try {
                    setIsLoading(true);
                    const response = await fetch(`${SERVER_URI}/jornal/all`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    });

                    // Read response as text first to safely check for empty/invalid payloads
                    const responseText = await response.text();

                    if (!responseText || responseText.trim() === "") {
                        throw new Error("Server returned an empty response body.");
                    }

                    let data;
                    try {
                        data = JSON.parse(responseText);
                    } catch (parseError) {
                        // console.log("Raw invalid server response snippet:", responseText.substring(0, 150));
                        throw new Error("Server response was cut off or returned invalid JSON format.");
                    }

                    const items: JournalEntry[] = Array.isArray(data)
                        ? data
                        : data.journals || data.data || [];

                    if (isMounted) {
                        calculateDashboardMetrics(items);
                    }
                } catch (error) {
                    // console.log("Error fetching dashboard data:", error);
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            };

            fetchDashboardData();

            return () => {
                isMounted = false;
            };
        }, [token])
    );

    const calculateDashboardMetrics = (items: JournalEntry[]) => {
        const total = items.length;
        setTotalTradesCount(total.toString());

        if (total === 0) {
            setTotalPnl("+$0");
            setRMultiple("+0.0R");
            setWinRate("0%");
            setRecentTrades([]);
            return;
        }

        let cumulativePnl = 0;
        let wins = 0;

        items.forEach((item) => {
            const pnl = item.pnl || 0;
            cumulativePnl += pnl;
            if (pnl > 0) {
                wins++;
            }
        });

        // 1. Total P&L
        setTotalPnl(`${cumulativePnl >= 0 ? "+" : ""}$${cumulativePnl.toFixed(2)}`);

        // 2. Win Rate
        const calculatedWinRate = Math.round((wins / total) * 100);
        setWinRate(`${calculatedWinRate}%`);

        // 3. R-Multiple Estimation
        const estimatedR = (cumulativePnl / 50).toFixed(1);
        setRMultiple(`${cumulativePnl >= 0 ? "+" : ""}${estimatedR}R`);

        // 4. Map recent trades (taking up to the latest 5 trades)
        const formattedTrades = items.slice(0, 5).map((trade, index) => {
            const pnlVal = trade.pnl || 0;
            const isWin = pnlVal >= 0;
            return {
                id: trade._id || String(index),
                symbol: trade.asset || "EURUSD",
                side: trade.type || "BUY",
                result: isWin ? "WIN" : "LOSS",
                pnl: `${isWin ? "+" : ""}$${pnlVal.toFixed(2)}`,
                r: `${isWin ? "+" : ""}${(pnlVal / 50).toFixed(1)}R`,
            };
        });

        setRecentTrades(formattedTrades);
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: wp(5),
                    paddingTop: hp(6),
                    paddingBottom: hp(4),
                }}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-sm text-text-muted">
                            Good morning,
                        </Text>

                        <Text className="mt-1 text-2xl font-bold text-text-primary">
                            Trader 👋
                        </Text>

                        <Text className="mt-1 text-xs text-text-muted">
                            {formattedDate}
                        </Text>
                    </View>
                </View>

                {/* Performance Metrics */}
                <View className="mt-7">
                    <Text className="text-lg font-bold text-text-primary">
                        Performance Overview
                    </Text>

                    <View className="mt-3 flex-row gap-3">
                        <StatCard
                            label="Total P&L"
                            value={totalPnl}
                            icon="trending-up-outline"
                        />

                        <StatCard
                            label="R Multiple"
                            value={rMultiple}
                            icon="analytics-outline"
                        />
                    </View>

                    <View className="mt-3 flex-row gap-3">
                        <StatCard
                            label="Win Rate"
                            value={winRate}
                            icon="trophy-outline"
                        />

                        <StatCard
                            label="Trades"
                            value={totalTradesCount}
                            icon="swap-horizontal-outline"
                        />
                    </View>
                </View>

                {/* Trading Plan */}
                <View className="mt-7">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-text-primary">
                            Current Trading Plan
                        </Text>

                        <TouchableOpacity
                            onPress={() => router.push("/(app)/playbook")}
                        >
                            <Text className="text-xs font-semibold text-primary">
                                View plan
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-3 rounded-2xl border border-border bg-surface p-4">
                        <View className="flex-row items-center">
                            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Ionicons
                                    name="compass-outline"
                                    size={20}
                                    color="#2563EB"
                                />
                            </View>

                            <View className="ml-3 flex-1">
                                <Text className="font-semibold text-text-primary">
                                    Follow the plan
                                </Text>

                                <Text className="mt-1 text-xs leading-5 text-text-muted">
                                    Wait for your 4H bias before looking for
                                    15M and 5M entries.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Recent Trades */}
                <View className="mt-7">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-text-primary">
                            Recent Trades
                        </Text>

                        <TouchableOpacity
                            onPress={() =>
                                router.push("/(app)/(tabs)/trades")
                            }
                        >
                            <Text className="text-xs font-semibold text-primary">
                                View all
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-3">
                        {isLoading ? (
                            <View className="py-8 items-center justify-center">
                                <ActivityIndicator size="small" color="#2563EB" />
                                <Text className="mt-2 text-xs text-text-muted">Loading trades...</Text>
                            </View>
                        ) : recentTrades.length === 0 ? (
                            <View className="rounded-2xl border border-border bg-surface p-6 items-center">
                                <Text className="text-xs text-text-muted">No trades recorded yet.</Text>
                            </View>
                        ) : (
                            recentTrades.map((trade) => (
                                <TouchableOpacity
                                    key={trade.id}
                                    onPress={() =>
                                        router.push(`/(app)/trade/${trade.id}`)
                                    }
                                    className="mb-3 flex-row items-center rounded-2xl border border-border bg-surface p-4"
                                >
                                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-alt">
                                        <Ionicons
                                            name={
                                                trade.side === "BUY" || trade.side === "LONG"
                                                    ? "arrow-up"
                                                    : "arrow-down"
                                            }
                                            size={18}
                                            color={
                                                trade.side === "BUY" || trade.side === "LONG"
                                                    ? "#16A34A"
                                                    : "#DC2626"
                                            }
                                        />
                                    </View>

                                    <View className="ml-3 flex-1">
                                        <Text className="font-bold text-text-primary">
                                            {trade.symbol}
                                        </Text>

                                        <Text className="mt-1 text-xs text-text-muted">
                                            {trade.side} • {trade.r}
                                        </Text>
                                    </View>

                                    <View className="items-end">
                                        <Text
                                            className={`font-bold ${trade.result === "WIN"
                                                ? "text-success"
                                                : "text-danger"
                                                }`}
                                        >
                                            {trade.pnl}
                                        </Text>

                                        <Text className="mt-1 text-xs text-text-muted">
                                            {trade.result}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}