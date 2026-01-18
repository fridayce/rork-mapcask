import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, LogOut, Trophy, MapPin, Camera, Edit2, Save, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useApp, useUserFinds } from "@/contexts/app-context";
import Colors from "@/constants/colors";
import HamburgerMenu from "@/components/HamburgerMenu";

export default function ProfileScreen() {
  const { user, signIn, signOut, updateProfile, isSigningIn, isSigningOut, isUpdatingProfile } = useApp();
  const userFinds = useUserFinds();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editCity, setEditCity] = useState<string>("");
  const [editState, setEditState] = useState<string>("");

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.authContainer}>
          <View style={styles.authHeader}>
            <User size={64} color={Colors.primary} />
            <Text style={styles.authTitle}>Join the Hunt</Text>
            <Text style={styles.authSubtitle}>
              Sign in to share your bourbon finds and connect with fellow
              hunters
            </Text>
          </View>

          <View style={styles.authForm}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={Colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.signInButton,
                (!name || !email || isSigningIn) && styles.signInButtonDisabled,
              ]}
              onPress={() => signIn({ name, email })}
              disabled={!name || !email || isSigningIn}
            >
              {isSigningIn ? (
                <ActivityIndicator size="small" color={Colors.text} />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <HamburgerMenu />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerActions}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  updateProfile({
                    city: editCity || undefined,
                    state: editState || undefined,
                  });
                  setIsEditing(false);
                }}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <ActivityIndicator size="small" color={Colors.accent} />
                ) : (
                  <Save size={20} color={Colors.accent} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  setIsEditing(false);
                  setEditCity(user?.city || "");
                  setEditState(user?.state || "");
                }}
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                setEditCity(user?.city || "");
                setEditState(user?.state || "");
                setIsEditing(true);
              }}
            >
              <Edit2 size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => signOut()}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <ActivityIndicator size="small" color={Colors.textSecondary} />
            ) : (
              <LogOut size={20} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={48} color={Colors.textSecondary} />
            </View>
          )}

          <TouchableOpacity
            style={styles.cameraButton}
            onPress={async () => {
              const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!permissionResult.granted) {
                if (Platform.OS === 'web') {
                  alert('Permission to access gallery is required!');
                } else {
                  Alert.alert('Permission Required', 'Permission to access gallery is required!');
                }
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                updateProfile({ avatar: result.assets[0].uri });
              }
            }}
          >
            <Camera size={20} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          {(user.city || user.state || isEditing) && (
            <View style={styles.locationContainer}>
              {isEditing ? (
                <View style={styles.editLocationForm}>
                  <TextInput
                    style={styles.editInput}
                    placeholder="City"
                    placeholderTextColor={Colors.textSecondary}
                    value={editCity}
                    onChangeText={setEditCity}
                  />
                  <TextInput
                    style={styles.editInput}
                    placeholder="State"
                    placeholderTextColor={Colors.textSecondary}
                    value={editState}
                    onChangeText={setEditState}
                    autoCapitalize="characters"
                    maxLength={2}
                  />
                </View>
              ) : (
                user.city || user.state ? (
                  <View style={styles.locationInfo}>
                    <MapPin size={14} color={Colors.textSecondary} />
                    <Text style={styles.locationText}>
                      {[user.city, user.state].filter(Boolean).join(", ")}
                    </Text>
                  </View>
                ) : null
              )}
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Trophy size={24} color={Colors.accent} />
              <Text style={styles.statValue}>{userFinds.length}</Text>
              <Text style={styles.statLabel}>Finds</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MapPin size={24} color={Colors.accent} />
              <Text style={styles.statValue}>
                {new Date(user.joinedAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Finds</Text>

          {userFinds.length > 0 ? (
            <View style={styles.findsGrid}>
              {userFinds.map((find) => (
                <View key={find.id} style={styles.findCard}>
                  <Image
                    source={{ uri: find.photos[0] }}
                    style={styles.findImage}
                    resizeMode="cover"
                  />
                  <View style={styles.findInfo}>
                    <Text style={styles.findName} numberOfLines={1}>
                      {find.bourbonName}
                    </Text>
                    {find.price ? (
                      <Text style={styles.findPrice}>
                        ${find.price.toFixed(2)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyFinds}>
              <Trophy size={32} color={Colors.textSecondary} />
              <Text style={styles.emptyFindsText}>
                No finds yet. Start hunting!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 40,
  },
  authHeader: {
    alignItems: "center",
    gap: 16,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  authSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  authForm: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  signInButtonDisabled: {
    opacity: 0.5,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceLight,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButton: {
    position: "absolute" as const,
    top: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  locationContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 4,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  editLocationForm: {
    width: "100%",
    gap: 12,
    paddingHorizontal: 16,
  },
  editInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 8,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
    marginTop: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: "100%",
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "uppercase" as const,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  findsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  findCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  findImage: {
    width: "100%",
    height: 120,
    backgroundColor: Colors.surfaceLight,
  },
  findInfo: {
    padding: 12,
    gap: 4,
  },
  findName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  findPrice: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.accent,
  },
  emptyFinds: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyFindsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
