import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { fetch as expoFetch } from "expo/fetch";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
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

const SERVER_URI = "https://jornal.rgmrabagardama.com.ng/api";

const getMimeTypeFromUri = (uri: string): string => {
    const lowerUri = uri.toLowerCase();

    if (lowerUri.endsWith(".png")) return "image/png";
    if (lowerUri.endsWith(".jpg") || lowerUri.endsWith(".jpeg")) return "image/jpeg";
    if (lowerUri.endsWith(".webp")) return "image/webp";

    return "application/octet-stream";
};

export default function ProfileSettings() {
    const router = useRouter();
    const { user, token } = useAuth();
    const userData = user as any;

    // Populate inputs from AuthContext user object on load
    const [name, setName] = useState(userData?.name || "");
    const [email, setEmail] = useState(userData?.email || "");
    const [bio, setBio] = useState(userData?.bio || "");

    // Password state fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [avatar, setAvatar] = useState<string | null>(userData?.avatar || null);
    const [isSaving, setIsSaving] = useState(false);

    // Keep fields synchronized if user object updates
    useEffect(() => {
        if (userData) {
            setName(userData.name || "");
            setEmail(userData.email || "");
            setBio(userData.bio || "");
            if (userData.avatar) setAvatar(userData.avatar);
        }
    }, [userData]);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "Please allow access to your photos to change your profile picture.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!token) {
            Alert.alert("Authentication Error", "You must be logged in to update your profile.");
            return;
        }

        try {
            setIsSaving(true);
            const formData = new FormData();

            formData.append("name", name);
            formData.append("email", email);
            formData.append("bio", bio);

            // Append passwords only if the user is attempting to change it
            if (newPassword) {
                if (!currentPassword) {
                    Alert.alert("Validation Error", "Please provide your current password to set a new one.");
                    setIsSaving(false);
                    return;
                }
                formData.append("currentPassword", currentPassword);
                formData.append("newPassword", newPassword);
            }

            const selectedAvatarUri = avatar && avatar.startsWith("file://") ? avatar : null;
            console.log("AVATAR SELECTED:", !!selectedAvatarUri);
            console.log("AVATAR URI:", selectedAvatarUri);

            if (selectedAvatarUri) {
                const file = new File(selectedAvatarUri);
                const uriExtension = selectedAvatarUri.split("?")[0].split(".").pop()?.toLowerCase();
                const mimeType = file.type || getMimeTypeFromUri(selectedAvatarUri);
                const filename = file.name || `profile_avatar.${uriExtension || "jpg"}`;

                console.log("AVATAR FILE DEBUG:", {
                    exists: file.exists,
                    uri: file.uri,
                    filename,
                    mimeType,
                    size: typeof file.size === "number" ? file.size : undefined,
                });

                if (!file.exists) {
                    throw new Error("Selected avatar file does not exist.");
                }

                formData.append("avatar", file as any);
            }

            console.log("PROFILE UPDATE REQUEST:", {
                name,
                email,
                bio,
                hasCurrentPassword: !!currentPassword,
                hasNewPassword: !!newPassword,
                avatarSelected: !!selectedAvatarUri,
            });

            const response = await expoFetch(`${SERVER_URI}/user/profile`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const responseText = await response.text();
            console.log("PROFILE UPDATE STATUS:", response.status);
            console.log("PROFILE UPDATE SERVER RESPONSE:", responseText);

            let data: any = null;

            if (responseText) {
                try {
                    data = JSON.parse(responseText);
                } catch {
                    data = null;
                }
            }

            if (!response.ok) {
                throw new Error(data?.message || data?.error || `Failed to update profile settings (${response.status}).`);
            }

            Alert.alert("Success", data?.message || "Profile updated successfully.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert("Update Failed", error.message || "Something went wrong connecting to the server.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-background"
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: wp(5),
                    paddingTop: hp(6),
                    paddingBottom: hp(5),
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
                    <View className="ml-3">
                        <Text className="text-2xl font-bold text-text-primary">Profile Settings</Text>
                        <Text className="mt-0.5 text-xs text-text-muted">Update your personal information</Text>
                    </View>
                </View>

                {/* Avatar Section */}
                <View className="mt-8 items-center">
                    <TouchableOpacity activeOpacity={0.85} onPress={pickImage} className="relative">
                        <View className="h-28 w-28 overflow-hidden rounded-full border-2 border-primary bg-surface items-center justify-center shadow-xl">
                            {avatar ? (
                                <Image source={{ uri: avatar }} className="h-full w-full" resizeMode="cover" />
                            ) : (
                                <Ionicons name="person" size={48} color="#3B82F6" />
                            )}
                        </View>
                        <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full bg-primary border-2 border-background">
                            <Ionicons name="camera" size={16} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                    <Text className="mt-3 text-xs font-semibold text-text-secondary">Tap to change avatar</Text>
                </View>

                {/* Form Fields */}
                <View className="mt-8">
                    <Text className="text-xs font-semibold text-text-secondary">FULL NAME</Text>
                    <View className="mt-2 flex-row items-center rounded-2xl border border-border bg-surface px-4">
                        <Ionicons name="person-outline" size={18} color="#64748B" />
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#64748B"
                            className="ml-3 flex-1 py-4 text-sm text-text-primary"
                        />
                    </View>

                    <Text className="mt-5 text-xs font-semibold text-text-secondary">EMAIL ADDRESS</Text>
                    <View className="mt-2 flex-row items-center rounded-2xl border border-border bg-surface px-4">
                        <Ionicons name="mail-outline" size={18} color="#64748B" />
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor="#64748B"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="ml-3 flex-1 py-4 text-sm text-text-primary"
                        />
                    </View>

                    <Text className="mt-5 text-xs font-semibold text-text-secondary">TRADING BIO</Text>
                    <TextInput
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        textAlignVertical="top"
                        placeholder="Describe your trading style..."
                        placeholderTextColor="#64748B"
                        className="mt-2 min-h-[100px] rounded-2xl border border-border bg-surface px-4 py-4 text-sm text-text-primary"
                    />

                    {/* Password Update Section Header */}
                    <Text className="mt-8 text-sm font-bold text-text-primary">Change Password</Text>
                    <Text className="mt-0.5 text-xs text-text-muted">Leave blank if you do not want to change your password.</Text>

                    <Text className="mt-4 text-xs font-semibold text-text-secondary">CURRENT PASSWORD</Text>
                    <View className="mt-2 flex-row items-center rounded-2xl border border-border bg-surface px-4">
                        <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
                        <TextInput
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry={!showCurrentPassword}
                            placeholder="Enter current password"
                            placeholderTextColor="#64748B"
                            autoCapitalize="none"
                            className="ml-3 flex-1 py-4 text-sm text-text-primary"
                        />
                        <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                            <Ionicons name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <Text className="mt-5 text-xs font-semibold text-text-secondary">NEW PASSWORD</Text>
                    <View className="mt-2 flex-row items-center rounded-2xl border border-border bg-surface px-4">
                        <Ionicons name="key-outline" size={18} color="#64748B" />
                        <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!showNewPassword}
                            placeholder="Enter new password"
                            placeholderTextColor="#64748B"
                            autoCapitalize="none"
                            className="ml-3 flex-1 py-4 text-sm text-text-primary"
                        />
                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                            <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSave}
                    disabled={isSaving}
                    className="mt-8 flex-row items-center justify-center rounded-2xl bg-primary py-4 shadow-lg"
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                            <Text className="ml-2 text-sm font-bold text-white">Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}