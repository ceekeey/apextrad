import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";

const SERVER_URI = "https://jornal.rgmrabagardama.com.ng/api";

interface JournalEntry {
    _id: string;
    pnl: number;
    result?: string;
    createdAt?: string;
    [key: string]: any;
}

const MONTHS = [
    { label: "All Time", value: "ALL" },
    { label: "Jan", value: "01" },
    { label: "Feb", value: "02" },
    { label: "Mar", value: "03" },
    { label: "Apr", value: "04" },
    { label: "May", value: "05" },
    { label: "Jun", value: "06" },
    { label: "Jul", value: "07" },
    { label: "Aug", value: "08" },
    { label: "Sep", value: "09" },
    { label: "Oct", value: "10" },
    { label: "Nov", value: "11" },
    { label: "Dec", value: "12" },
];

function Metric({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <View className="flex-1 rounded-2xl border border-border bg-surface p-4">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Ionicons name={icon} size={18} color="#2563EB" />
            </View>
            <Text className="mt-3 text-xs text-text-muted">{label}</Text>
            <Text className="mt-1 text-xl font-bold text-text-primary">{value}</Text>
        </View>
    );
}

export default function Analytics() {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const [allJournals, setAllJournals] = useState<JournalEntry[]>([]);
    const [selectedMonth, setSelectedMonth] = useState("ALL");

    // Analytics calculated states
    const [winRate, setWinRate] = useState("0%");
    const [profitFactor, setProfitFactor] = useState("0.00");
    const [totalTrades, setTotalTrades] = useState("0");
    const [winningCount, setWinningCount] = useState(0);
    const [losingCount, setLosingCount] = useState(0);
    const [bestTrade, setBestTrade] = useState("0.0R");

    // Fetch initial data
    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            const fetchAnalyticsData = async () => {
                if (!token) return;

                try {
                    setIsLoading(true);
                    const response = await fetch(`${SERVER_URI}/jornal/all`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const data = await response.json();
                    const items: JournalEntry[] = Array.isArray(data)
                        ? data
                        : data.journals || data.data || [];

                    if (isMounted) {
                        setAllJournals(items);
                        applyFilterAndCompute(items, selectedMonth);
                    }
                } catch (error) {
                    Toast.show({ type: "error", text1: "Error", text2: "Could not fetch journal analytics." });
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            };

            fetchAnalyticsData();

            return () => {
                isMounted = false;
            };
        }, [token])
    );

    // Filter items based on selected month and compute metrics
    const applyFilterAndCompute = (items: JournalEntry[], monthCode: string) => {
        let filtered = items;

        if (monthCode !== "ALL") {
            filtered = items.filter((item) => {
                const dateString = item.createdAt || item.date;
                if (!dateString) return false;
                const itemMonth = new Date(dateString).getMonth() + 1; // 1 - 12
                const paddedMonth = itemMonth < 10 ? `0${itemMonth}` : `${itemMonth}`;
                return paddedMonth === monthCode;
            });
        }

        computeMetrics(filtered);
    };

    const handleMonthChange = (monthCode: string) => {
        setSelectedMonth(monthCode);
        applyFilterAndCompute(allJournals, monthCode);
    };

    const computeMetrics = (items: JournalEntry[]) => {
        const total = items.length;
        if (total === 0) {
            setWinRate("0%");
            setProfitFactor("0.00");
            setTotalTrades("0");
            setWinningCount(0);
            setLosingCount(0);
            setBestTrade("0.0R");
            return;
        }

        let wins = 0;
        let losses = 0;
        let grossProfit = 0;
        let grossLoss = 0;
        let maxPnl = -Infinity;

        items.forEach((item) => {
            const pnl = item.pnl || 0;
            if (pnl > 0) {
                wins++;
                grossProfit += pnl;
            } else if (pnl < 0) {
                losses++;
                grossLoss += Math.abs(pnl);
            }

            if (pnl > maxPnl) {
                maxPnl = pnl;
            }
        });

        const calculatedWinRate = Math.round((wins / total) * 100);
        setWinRate(`${calculatedWinRate}%`);

        const pFactor = grossLoss === 0
            ? (grossProfit > 0 ? grossProfit.toFixed(2) : "0.00")
            : (grossProfit / grossLoss).toFixed(2);
        setProfitFactor(pFactor);

        setTotalTrades(total.toString());
        setWinningCount(wins);
        setLosingCount(losses);
        setBestTrade(maxPnl === -Infinity ? "0.0R" : `+${maxPnl.toFixed(1)}R`);
    };

    // Export Filtered Data as CSV File
    const exportToCsv = async () => {
        let currentFiltered = allJournals;
        if (selectedMonth !== "ALL") {
            currentFiltered = allJournals.filter((item) => {
                const dateString = item.createdAt || item.date;
                if (!dateString) return false;
                const itemMonth = new Date(dateString).getMonth() + 1;
                const paddedMonth = itemMonth < 10 ? `0${itemMonth}` : `${itemMonth}`;
                return paddedMonth === selectedMonth;
            });
        }

        if (currentFiltered.length === 0) {
            Toast.show({ type: "info", text1: "No Data", text2: "No trades available to export for this selection." });
            return;
        }

        try {
            setIsExporting(true);

            // Construct CSV header & rows
            let csvContent = "ID,PnL,Result,Date\n";
            currentFiltered.forEach((trade) => {
                const id = trade._id || "";
                const pnl = trade.pnl ?? 0;
                const result = trade.result || (pnl > 0 ? "Win" : pnl < 0 ? "Loss" : "Break-even");
                const date = trade.createdAt ? new Date(trade.createdAt).toISOString() : "";
                csvContent += `"${id}",${pnl},"${result}","${date}"\n`;
            });

            // Dynamically evaluate current year
            const currentYear = new Date().getFullYear();
            const fileName = `Trading_Journal_${selectedMonth === "ALL" ? "All_Time" : selectedMonth}_${currentYear}.csv`;
            const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            if (!(await Sharing.isAvailableAsync())) {
                Toast.show({ type: "error", text1: "Error", text2: "Sharing is not available on this device." });
                return;
            }

            await Sharing.shareAsync(fileUri, {
                mimeType: "text/csv",
                dialogTitle: "Export Trading Journal CSV",
                UTI: "public.comma-separated-values-text",
            });

        } catch (error) {
            Toast.show({ type: "error", text1: "Export Failed", text2: "Could not generate or export file." });
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="mt-3 text-xs text-text-muted">Loading analytics...</Text>
            </View>
        );
    }

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
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-text-primary">Analytics</Text>
                        <Text className="mt-1 text-sm text-text-muted">Understand your trading performance.</Text>
                    </View>

                    {/* Export Button */}
                    <TouchableOpacity
                        onPress={exportToCsv}
                        disabled={isExporting}
                        className="flex-row items-center rounded-2xl bg-primary/10 px-4 py-2.5 border border-border"
                    >
                        {isExporting ? (
                            <ActivityIndicator size="small" color="#2563EB" />
                        ) : (
                            <>
                                <Ionicons name="download-outline" size={16} color="#2563EB" />
                                <Text className="ml-1.5 text-xs font-bold text-primary">Export CSV</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Month Filter Selector Bar */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-6 flex-row"
                >
                    {MONTHS.map((m) => {
                        const isSelected = selectedMonth === m.value;
                        return (
                            <TouchableOpacity
                                key={m.value}
                                onPress={() => handleMonthChange(m.value)}
                                className={`mr-2 rounded-2xl px-4 py-2.5 border ${isSelected
                                    ? "bg-primary border-primary"
                                    : "bg-surface border-border"
                                    }`}
                            >
                                <Text className={`text-xs font-bold ${isSelected ? "text-white" : "text-text-secondary"}`}>
                                    {m.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Metrics Cards */}
                <View className="mt-6 flex-row gap-3">
                    <Metric label="Win Rate" value={winRate} icon="trophy-outline" />
                    <Metric label="Profit Factor" value={profitFactor} icon="trending-up-outline" />
                </View>

                <View className="mt-3 flex-row gap-3">
                    <Metric label="Best Trade" value={bestTrade} icon="analytics-outline" />
                    <Metric label="Total Trades" value={totalTrades} icon="swap-horizontal-outline" />
                </View>

                {/* Performance */}
                <View className="mt-7 rounded-2xl border border-border bg-surface p-5">
                    <Text className="text-lg font-bold text-text-primary">Performance</Text>
                    <View className="mt-6 items-center justify-center">
                        <View className="h-36 w-36 items-center justify-center rounded-full border-8 border-primary">
                            <Text className="text-3xl font-bold text-text-primary">{winRate}</Text>
                            <Text className="text-xs text-text-muted">Win Rate</Text>
                        </View>
                    </View>
                </View>

                {/* Breakdown */}
                <View className="mt-5 rounded-2xl border border-border bg-surface p-5">
                    <Text className="text-lg font-bold text-text-primary">Trade Breakdown</Text>
                    <View className="mt-5">
                        <View className="mb-4 flex-row justify-between">
                            <Text className="text-sm text-text-muted">Winning Trades</Text>
                            <Text className="font-bold text-success">{winningCount}</Text>
                        </View>
                        <View className="mb-4 flex-row justify-between">
                            <Text className="text-sm text-text-muted">Losing Trades</Text>
                            <Text className="font-bold text-danger">{losingCount}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-text-muted">Best Trade</Text>
                            <Text className="font-bold text-text-primary">{bestTrade}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}