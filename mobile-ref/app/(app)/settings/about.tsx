import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";

type LegalType = "privacy" | "terms" | null;

export default function AboutScreen() {
    const router = useRouter();

    const [legalModal, setLegalModal] = useState<LegalType>(null);
    const [imageModal, setImageModal] = useState(false);

    const openWebsite = async () => {
        const url = "https://ceekeeydev.vercel.app/";

        try {
            await Linking.openURL(url);
        } catch (error) {
            console.log("Unable to open website:", error);
        }
    };

    const openWhatsApp = async () => {
        const url = "https://wa.me/2349134585734";

        try {
            await Linking.openURL(url);
        } catch (error) {
            console.log("Unable to open WhatsApp:", error);
        }
    };

    const openTelegram = async () => {
        const url = "https://t.me/xozuzi";

        try {
            await Linking.openURL(url);
        } catch (error) {
            console.log("Unable to open Telegram:", error);
        }
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
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.8}
                        className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface"
                    >
                        <Ionicons
                            name="arrow-back"
                            size={20}
                            color="#F8FAFC"
                        />
                    </TouchableOpacity>

                    <View className="ml-3">
                        <Text className="text-2xl font-bold text-text-primary">
                            About Apex Trade
                        </Text>

                        <Text className="mt-0.5 text-xs text-text-muted">
                            Personal Trading Journal
                        </Text>
                    </View>
                </View>

                {/* Developer / App Card */}
                <View className="mt-8 items-center rounded-3xl border border-border bg-surface p-7 shadow-xl">
                    {/* Developer Image */}
                    <Pressable
                        onPress={() => setImageModal(true)}
                        className="h-28 w-28 overflow-hidden rounded-full border-2 border-primary/40 bg-surface-alt"
                    >
                        <Image
                            source={require("./../../../../assets/images/ceo.png")}
                            className="h-full w-full"
                            resizeMode="cover"
                        />
                    </Pressable>

                    <Text className="mt-5 text-xl font-extrabold text-text-primary">
                        Apex Trade
                    </Text>

                    <Text className="mt-1 text-xs font-medium uppercase tracking-widest text-primary">
                        Personal Trading Journal
                    </Text>

                    <Text className="mt-4 text-center text-sm leading-6 text-text-secondary">
                        Apex Trade is a personal trading journal built to help
                        me document my trades, review my setups, track
                        performance, and become more disciplined with my
                        trading process.
                    </Text>

                    <Text className="mt-3 text-center text-xs leading-5 text-text-muted">
                        Built and maintained by Ceekeey — a developer and
                        trader focused on combining technology with structured
                        trading analysis.
                    </Text>

                    {/* Version */}
                    <View className="mt-5 flex-row items-center rounded-full border border-border bg-surface-alt px-4 py-2">
                        <Ionicons
                            name="code-slash-outline"
                            size={13}
                            color="#64748B"
                        />

                        <Text className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                            Version 1.0.0
                        </Text>
                    </View>

                    {/* Image Hint */}
                    <View className="mt-4 flex-row items-center">
                        <Ionicons
                            name="expand-outline"
                            size={13}
                            color="#64748B"
                        />

                        <Text className="ml-1.5 text-[10px] text-text-disabled">
                            Tap the image to view it larger
                        </Text>
                    </View>
                </View>

                {/* Website / Legal */}
                <View className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface">
                    <AboutRow
                        icon="globe-outline"
                        title="Developer Website"
                        subtitle="ceekeeydev.vercel.app"
                        onPress={openWebsite}
                    />

                    <AboutRow
                        icon="shield-checkmark-outline"
                        title="Privacy Policy"
                        subtitle="How Apex Trade handles your data"
                        onPress={() => setLegalModal("privacy")}
                    />

                    <AboutRow
                        icon="document-text-outline"
                        title="Terms of Service"
                        subtitle="Usage guidelines and important terms"
                        onPress={() => setLegalModal("terms")}
                        isLast
                    />
                </View>

                {/* Feedback & Contact */}
                <View className="mt-6 rounded-3xl border border-border bg-surface p-5">
                    <View className="flex-row items-center">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <Ionicons
                                name="chatbubbles-outline"
                                size={19}
                                color="#3B82F6"
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-bold text-text-primary">
                                Send Your Feedback
                            </Text>

                            <Text className="mt-1 text-xs leading-5 text-text-muted">
                                Have a suggestion, found a bug, or want to
                                share feedback? Get in touch.
                            </Text>
                        </View>
                    </View>

                    {/* WhatsApp */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={openWhatsApp}
                        className="mt-5 flex-row items-center rounded-2xl border border-border bg-surface-alt p-4"
                    >
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                            <Ionicons
                                name="logo-whatsapp"
                                size={21}
                                color="#22C55E"
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-semibold text-text-primary">
                                WhatsApp
                            </Text>

                            <Text className="mt-0.5 text-xs text-text-muted">
                                +234 913 458 5734
                            </Text>
                        </View>

                        <Ionicons
                            name="open-outline"
                            size={16}
                            color="#64748B"
                        />
                    </TouchableOpacity>

                    {/* Telegram */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={openTelegram}
                        className="mt-3 flex-row items-center rounded-2xl border border-border bg-surface-alt p-4"
                    >
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
                            <Ionicons
                                name="paper-plane-outline"
                                size={20}
                                color="#38BDF8"
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-semibold text-text-primary">
                                Telegram
                            </Text>

                            <Text className="mt-0.5 text-xs text-text-muted">
                                @xozuzi
                            </Text>
                        </View>

                        <Ionicons
                            name="open-outline"
                            size={16}
                            color="#64748B"
                        />
                    </TouchableOpacity>
                </View>

                {/* Trading Disclaimer */}
                <View className="mt-6 rounded-3xl border border-warning/20 bg-warning/5 p-5">
                    <View className="flex-row items-center">
                        <View className="h-9 w-9 items-center justify-center rounded-xl bg-warning/10">
                            <Ionicons
                                name="warning-outline"
                                size={18}
                                color="#F59E0B"
                            />
                        </View>

                        <Text className="ml-3 text-sm font-bold text-text-primary">
                            Trading Disclaimer
                        </Text>
                    </View>

                    <Text className="mt-3 text-xs leading-5 text-text-secondary">
                        Apex Trade is a personal journaling and trading
                        analysis tool. It does not provide financial advice,
                        investment recommendations, or guarantees of profit.
                        Trading financial markets involves significant risk.
                    </Text>
                </View>

                {/* Footer */}
                <View className="mt-8 items-center">
                    <Text className="text-[10px] font-semibold uppercase tracking-widest text-text-disabled">
                        © 2026 Ceekeey. All rights reserved.
                    </Text>

                    <Text className="mt-2 text-center text-[10px] text-text-disabled">
                        Built for personal trading discipline.
                    </Text>
                </View>
            </ScrollView>

            {/* Developer Image Modal */}
            <Modal
                visible={imageModal}
                transparent
                animationType="fade"
                onRequestClose={() => setImageModal(false)}
            >
                <Pressable
                    onPress={() => setImageModal(false)}
                    className="flex-1 items-center justify-center bg-black/90 px-5"
                >
                    <Pressable
                        onPress={(event) => event.stopPropagation()}
                        className="w-full max-w-md overflow-hidden rounded-3xl bg-surface"
                    >
                        <Image
                            source={require("./../../../../assets/images/ceo.png")}
                            className="h-[420px] w-full"
                            resizeMode="contain"
                        />

                        <TouchableOpacity
                            onPress={() => setImageModal(false)}
                            activeOpacity={0.8}
                            className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-black/60"
                        >
                            <Ionicons
                                name="close"
                                size={22}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Legal Modal */}
            <LegalModal
                visible={legalModal !== null}
                type={legalModal}
                onClose={() => setLegalModal(null)}
            />
        </View>
    );
}

/* -------------------------------------------------------------------------- */
/* About Row                                                                  */
/* -------------------------------------------------------------------------- */

function AboutRow({
    icon,
    title,
    subtitle,
    onPress,
    isLast = false,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
    isLast?: boolean;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            className={`flex-row items-center p-4 ${!isLast ? "border-b border-border" : ""
                }`}
        >
            <View className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-alt">
                <Ionicons
                    name={icon}
                    size={18}
                    color="#3B82F6"
                />
            </View>

            <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-text-primary">
                    {title}
                </Text>

                <Text className="mt-0.5 text-xs text-text-muted">
                    {subtitle}
                </Text>
            </View>

            <Ionicons
                name="chevron-forward"
                size={16}
                color="#64748B"
            />
        </TouchableOpacity>
    );
}

/* -------------------------------------------------------------------------- */
/* Legal Modal                                                                */
/* -------------------------------------------------------------------------- */

function LegalModal({
    visible,
    type,
    onClose,
}: {
    visible: boolean;
    type: LegalType;
    onClose: () => void;
}) {
    if (!type) return null;

    const isPrivacy = type === "privacy";

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/70">
                <View
                    className="rounded-t-[32px] border border-border bg-surface"
                    style={{
                        maxHeight: hp(85),
                    }}
                >
                    {/* Modal Header */}
                    <View className="flex-row items-center justify-between border-b border-border px-6 py-5">
                        <View className="flex-1 pr-4">
                            <Text className="text-xl font-bold text-text-primary">
                                {isPrivacy
                                    ? "Privacy Policy"
                                    : "Terms of Service"}
                            </Text>

                            <Text className="mt-1 text-xs text-text-muted">
                                Last updated: September 2026
                            </Text>
                        </View>

                        <Pressable
                            onPress={onClose}
                            className="h-10 w-10 items-center justify-center rounded-xl bg-surface-alt"
                        >
                            <Ionicons
                                name="close"
                                size={21}
                                color="#94A3B8"
                            />
                        </Pressable>
                    </View>

                    {/* Modal Content */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: wp(6),
                            paddingTop: hp(2),
                            paddingBottom: hp(5),
                        }}
                    >
                        {isPrivacy ? (
                            <PrivacyPolicy />
                        ) : (
                            <TermsOfService />
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

/* -------------------------------------------------------------------------- */
/* Privacy Policy                                                             */
/* -------------------------------------------------------------------------- */

function PrivacyPolicy() {
    return (
        <View>
            <LegalSection
                title="1. Overview"
                text="Apex Trade is a personal trading journal designed to help you record and review your trading activity. This privacy policy explains what information may be stored when you use the application."
            />

            <LegalSection
                title="2. Information You Provide"
                text="Depending on how you use Apex Trade, the application may store information such as trading journal entries, selected trading instruments, trade direction, entry and exit information, notes, screenshots, trading plans, and performance information."
            />

            <LegalSection
                title="3. Account Information"
                text="If the application requires an account, authentication information may be processed to provide access to your account and synchronize your journal data with the application's backend services."
            />

            <LegalSection
                title="4. Images and Screenshots"
                text="If you choose to upload trading screenshots, Apex Trade may request access to your camera or photo library. Access is only requested when required for the relevant feature."
            />

            <LegalSection
                title="5. Data Security"
                text="Reasonable technical measures are used to protect information handled by the application. However, no internet-connected service can guarantee absolute security."
            />

            <LegalSection
                title="6. Third-Party Services"
                text="Apex Trade may communicate with third-party infrastructure and services required to operate the application, such as authentication, hosting, analytics, or backend services."
            />

            <LegalSection
                title="7. Your Control"
                text="You should avoid entering highly sensitive information that is unrelated to the purpose of the application. If you have questions about your stored information, contact the developer through the official website."
            />

            <LegalSection
                title="8. Contact"
                text="For privacy-related questions or requests, visit the developer website at ceekeeydev.vercel.app."
            />
        </View>
    );
}

/* -------------------------------------------------------------------------- */
/* Terms of Service                                                           */
/* -------------------------------------------------------------------------- */

function TermsOfService() {
    return (
        <View>
            <LegalSection
                title="1. Acceptance"
                text="By using Apex Trade, you agree to use the application responsibly and in accordance with these terms."
            />

            <LegalSection
                title="2. Purpose of the Application"
                text="Apex Trade is a personal trading journal and analysis tool. It is designed to help users document trades, review setups, organize plans, and analyze their own trading activity."
            />

            <LegalSection
                title="3. No Financial Advice"
                text="Apex Trade does not provide financial, investment, legal, or tax advice. Information displayed by the application should not be interpreted as a recommendation to buy, sell, or hold any financial instrument."
            />

            <LegalSection
                title="4. Trading Risk"
                text="Trading financial markets involves substantial risk and may result in the loss of capital. You are solely responsible for your trading decisions and should only trade according to your own risk tolerance and financial circumstances."
            />

            <LegalSection
                title="5. User Responsibility"
                text="You are responsible for the accuracy of information you enter into your journal and for keeping your account credentials secure."
            />

            <LegalSection
                title="6. Availability"
                text="The application is provided on an ongoing basis, but features, services, or availability may change without prior notice. Technical interruptions may occasionally occur."
            />

            <LegalSection
                title="7. Acceptable Use"
                text="You agree not to misuse the application, attempt unauthorized access, interfere with its operation, or use it for unlawful activities."
            />

            <LegalSection
                title="8. Changes"
                text="These terms may be updated as Apex Trade evolves. Continued use of the application after changes are published constitutes acceptance of the updated terms."
            />

            <LegalSection
                title="9. Contact"
                text="For questions about Apex Trade or these terms, visit ceekeeydev.vercel.app."
            />
        </View>
    );
}

/* -------------------------------------------------------------------------- */
/* Legal Section                                                              */
/* -------------------------------------------------------------------------- */

function LegalSection({
    title,
    text,
}: {
    title: string;
    text: string;
}) {
    return (
        <View className="mb-6">
            <Text className="text-sm font-bold text-text-primary">
                {title}
            </Text>

            <Text className="mt-2 text-xs leading-5 text-text-secondary">
                {text}
            </Text>
        </View>
    );
}