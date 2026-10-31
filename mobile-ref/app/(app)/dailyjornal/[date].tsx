import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SERVER_URI = "https://jornal.rgmrabagardama.com.ng/api";

export default function DailyJournal() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { token, isLoading: authLoading } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [matchingJournals, setMatchingJournals] = useState<any[]>([]);
    const [dayStats, setDayStats] = useState({ totalTrades: 0, totalPnl: 0 });

    // Safely extract date whether it comes as a string or an array from Expo Router
    const rawDate = params.id || params.date;
    const dateString = Array.isArray(rawDate) ? rawDate[0] : rawDate;

    const fetchDateTrades = useCallback(async () => {
        // console.log("=== fetchDateTrades triggered ===");
        // console.log("Token present:", !!token);
        // console.log("Resolved Date parameter:", dateString);

        if (!token) {
            // console.log("❌ Skipping fetch: No auth token available yet.");
            setIsLoading(false);
            return;
        }

        if (!dateString) {
            // console.log("❌ Skipping fetch: No date parameter provided in route.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const url = `${SERVER_URI}/jornal/all`;

            const journalRes = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const journalJson = await journalRes.json();

            if (journalRes.ok && journalJson.success && Array.isArray(journalJson.data)) {
                const targetDate = dateString.split("T")[0];

                const filtered = journalJson.data.filter((item: any) => {
                    if (!item.date) return false;
                    const itemDate = item.date.split("T")[0];
                    return itemDate === targetDate;
                });

                // console.log("Filtered matching journals count:", filtered.length);
                setMatchingJournals(filtered);

                let pnlTotal = 0;
                filtered.forEach((j: any) => {
                    pnlTotal += j.pnl || 0;
                });

                setDayStats({
                    totalTrades: filtered.length,
                    totalPnl: pnlTotal,
                });
            } else {
                // console.log("❌ API response was not successful or data is not an array:", journalJson);
            }
        } catch (error) {
            // console.log("❌ Catch block error loading date data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [token, dateString]);

    // Trigger when screen receives focus and token/date are ready
    useFocusEffect(
        useCallback(() => {
            // console.log("useFocusEffect fired. authLoading:", authLoading, "token:", !!token, "date:", dateString);
            if (!authLoading && token && dateString) {
                fetchDateTrades();
            } else if (!authLoading) {
                setIsLoading(false);
            }
        }, [authLoading, token, dateString, fetchDateTrades])
    );

    // Handler to navigate to single trade review screen
    const handleSelectTrade = (tradeId: string) => {
        router.push({
            pathname: "/(app)/trade/[id]",
            params: { id: tradeId },
        });
    };

    // Handler to navigate to create/add journal screen passing the date
    const handleAddJournalForDate = () => {
        router.push({
            pathname: "/(app)/create-journal",
            params: { date: dateString },
        });
    };

    if (isLoading || authLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-3 text-xs font-semibold text-text-muted">
                    Loading daily summary...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 55,
                    paddingBottom: 50,
                }}
            >
                {/* Header */}
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.8}
                        className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface"
                    >
                        <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
                    </TouchableOpacity>

                    <View className="ml-3 flex-1">
                        <Text className="text-2xl font-bold text-text-primary">
                            Daily Summary
                        </Text>
                        <Text className="mt-1 text-xs text-text-muted">
                            {dateString ? dateString.split("T")[0] : "Today"}
                        </Text>
                    </View>

                    {/* Add Journal Entry Button */}
                    <TouchableOpacity
                        onPress={handleAddJournalForDate}
                        activeOpacity={0.8}
                        className="mr-2 h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10"
                    >
                        <Ionicons name="add" size={20} color="#3B82F6" />
                    </TouchableOpacity>

                    {/* Manual Refresh Button */}
                    <TouchableOpacity
                        onPress={fetchDateTrades}
                        className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface"
                    >
                        <Ionicons name="refresh-outline" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                {/* Metrics Cards: Trades & PnL Only */}
                <View className="mt-6 flex-row gap-4">
                    <View className="flex-1 items-center justify-center rounded-3xl border border-border bg-surface py-8 shadow-sm">
                        <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Ionicons name="bar-chart-outline" size={20} color="#3B82F6" />
                        </View>
                        <Text className="text-3xl font-black text-text-primary">
                            {dayStats.totalTrades}
                        </Text>
                        <Text className="mt-1 text-xs font-semibold text-text-muted">TRADES TAKEN</Text>
                    </View>

                    <View className="flex-1 items-center justify-center rounded-3xl border border-border bg-surface py-8 shadow-sm">
                        <View className={`mb-2 h-10 w-10 items-center justify-center rounded-full ${dayStats.totalPnl >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                            <Ionicons
                                name={dayStats.totalPnl >= 0 ? "trending-up-outline" : "trending-down-outline"}
                                size={20}
                                color={dayStats.totalPnl >= 0 ? "#10B981" : "#F43F5E"}
                            />
                        </View>
                        <Text className={`text-3xl font-black ${dayStats.totalPnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                            ${dayStats.totalPnl.toFixed(2)}
                        </Text>
                        <Text className="mt-1 text-xs font-semibold text-text-muted">DAY PNL</Text>
                    </View>
                </View>

                {/* Trade History List Header */}
                <View className="mt-8 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                            <Ionicons name="list-outline" size={18} color="#3B82F6" />
                        </View>
                        <View className="ml-3">
                            <Text className="text-base font-bold text-text-primary">Trade History</Text>
                            <Text className="mt-0.5 text-xs text-text-muted">Logs recorded on this date</Text>
                        </View>
                    </View>
                </View>

                {matchingJournals.length === 0 ? (
                    <View className="mt-4 items-center rounded-3xl border border-border bg-surface p-8">
                        <Ionicons name="folder-open-outline" size={32} color="#64748B" />
                        <Text className="mt-2 text-sm font-semibold text-text-secondary">No trades found</Text>
                        <Text className="mt-1 text-center text-xs text-text-muted">
                            You haven't logged any trades for this date.
                        </Text>
                    </View>
                ) : (
                    <View className="mt-4 gap-3">
                        {matchingJournals.map((item: any) => (
                            <TouchableOpacity
                                key={item._id}
                                activeOpacity={0.8}
                                onPress={() => handleSelectTrade(item._id)}
                                className="rounded-2xl border border-border bg-surface p-4"
                            >
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-sm font-bold text-text-primary">{item.asset || "Trade"}</Text>
                                    <View className="flex-row items-center gap-2">
                                        <Text className={`text-sm font-bold ${(item.pnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                            ${item.pnl ? item.pnl.toFixed(2) : "0.00"}
                                        </Text>
                                        <Ionicons name="chevron-forward" size={16} color="#64748B" />
                                    </View>
                                </View>
                                <Text className="mt-1 text-xs text-text-muted">Setup: {item.setup || item.plan?.name || "General"}</Text>
                                {item.notes ? (
                                    <Text className="mt-2 text-xs text-text-secondary" numberOfLines={2}>
                                        {item.notes}
                                    </Text>
                                ) : null}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}