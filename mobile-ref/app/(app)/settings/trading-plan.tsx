import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";

export default function TradingPlanScreen() {
    const router = useRouter();

    const [plans, setPlans] = useState([
        { id: "1", title: "London Breakout", description: "Trade support/resistance sweeps during London open session." },
        { id: "2", title: "Liquidity Sweep", description: "Wait for institutional inducement grab before market reversal." },
        { id: "3", title: "Market Structure Break", description: "Enter on pullback following a valid BOS on 15M timeframe." },
    ]);

    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const addPlan = () => {
        if (!newTitle.trim()) {
            Alert.alert("Title required", "Please enter a trading plan name.");
            return;
        }
        setPlans([...plans, { id: Date.now().toString(), title: newTitle, description: newDesc }]);
        setNewTitle("");
        setNewDesc("");
        setIsAdding(false);
    };

    const deletePlan = (id: string) => {
        Alert.alert("Delete Plan", "Are you sure you want to remove this plan?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => setPlans(plans.filter(p => p.id !== id)) }
        ]);
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: wp(5),
                    paddingTop: hp(6),
                    paddingBottom: hp(10),
                }}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            activeOpacity={0.8}
                            className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface"
                        >
                            <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
                        </TouchableOpacity>
                        <View className="ml-3">
                            <Text className="text-2xl font-bold text-text-primary">Trading Plans</Text>
                            <Text className="mt-0.5 text-xs text-text-muted">Manage your rules & strategies</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => setIsAdding(!isAdding)}
                        className="h-11 w-11 items-center justify-center rounded-2xl bg-primary"
                    >
                        <Ionicons name={isAdding ? "close" : "add"} size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Add Plan Form Toggle */}
                {isAdding && (
                    <View className="mt-6 rounded-3xl border border-border bg-surface p-5">
                        <Text className="text-sm font-bold text-text-primary">New Strategy Setup</Text>

                        <TextInput
                            value={newTitle}
                            onChangeText={setNewTitle}
                            placeholder="Setup Name (e.g., Opening Range Break)"
                            placeholderTextColor="#64748B"
                            className="mt-3 rounded-2xl border border-border bg-background px-4 py-3 text-xs text-text-primary"
                        />

                        <TextInput
                            value={newDesc}
                            onChangeText={setNewDesc}
                            multiline
                            placeholder="Rules and conditions..."
                            placeholderTextColor="#64748B"
                            className="mt-3 min-h-[80px] rounded-2xl border border-border bg-background px-4 py-3 text-xs text-text-primary"
                        />

                        <TouchableOpacity
                            onPress={addPlan}
                            className="mt-4 items-center justify-center rounded-2xl bg-primary py-3"
                        >
                            <Text className="text-xs font-bold text-white">Save Strategy</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Plans List */}
                <View className="mt-6 gap-3">
                    {plans.map((plan) => (
                        <View key={plan.id} className="rounded-3xl border border-border bg-surface p-5">
                            <View className="flex-row items-start justify-between">
                                <View className="flex-1 pr-3">
                                    <View className="flex-row items-center">
                                        <View className="h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mr-2.5">
                                            <Ionicons name="book-outline" size={16} color="#3B82F6" />
                                        </View>
                                        <Text className="text-base font-bold text-text-primary">{plan.title}</Text>
                                    </View>
                                    {plan.description ? (
                                        <Text className="mt-3 text-xs leading-5 text-text-muted">
                                            {plan.description}
                                        </Text>
                                    ) : null}
                                </View>

                                <TouchableOpacity
                                    onPress={() => deletePlan(plan.id)}
                                    className="h-9 w-9 items-center justify-center rounded-xl bg-danger/10 border border-danger/20"
                                >
                                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}