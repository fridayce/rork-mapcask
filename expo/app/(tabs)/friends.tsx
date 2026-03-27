import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users, UserPlus, Check, X, AlertCircle } from "lucide-react-native";
import { useSocial } from "@/contexts/social-context";
import { useApp } from "@/contexts/app-context";
import Colors from "@/constants/colors";
import { Friend } from "@/types";
import HamburgerMenu from "@/components/HamburgerMenu";

export default function FriendsScreen() {
  const { user } = useApp();
  const {
    friends,
    friendRequests,
    syncContacts,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    isSyncingContacts,
    requestContactsPermission,
  } = useSocial();
  const [potentialFriends, setPotentialFriends] = useState<Friend[]>([]);
  const [showingContacts, setShowingContacts] = useState<boolean>(false);

  const handleSyncContacts = async () => {
    try {
      if (Platform.OS === "web") {
        alert("Contact sync is only available on mobile devices");
        return;
      }
      await requestContactsPermission();
      const contacts = await syncContacts();
      setPotentialFriends(contacts);
      setShowingContacts(true);
      console.log("Synced contacts:", contacts.length);
    } catch (error) {
      console.error("Error syncing contacts:", error);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.emptyState}>
          <Users size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptySubtitle}>
            Sign in to connect with friends and fellow bourbon hunters
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <HamburgerMenu />
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSyncContacts}
          disabled={isSyncingContacts}
        >
          {isSyncingContacts ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <UserPlus size={20} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {friendRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Friend Requests</Text>
            {friendRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  {request.fromUserAvatar ? (
                    <Image
                      source={{ uri: request.fromUserAvatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Users size={20} color={Colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.requestDetails}>
                    <Text style={styles.requestName}>
                      {request.fromUserName}
                    </Text>
                    <Text style={styles.requestEmail}>
                      {request.fromUserEmail}
                    </Text>
                  </View>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptFriendRequest(request.id)}
                  >
                    <Check size={18} color={Colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => declineFriendRequest(request.id)}
                  >
                    <X size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {showingContacts && potentialFriends.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Find Friends</Text>
              <TouchableOpacity onPress={() => setShowingContacts(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.infoCard}>
              <AlertCircle size={16} color={Colors.accent} />
              <Text style={styles.infoText}>
                These contacts may be using MapCask. Send them a friend request!
              </Text>
            </View>
            {potentialFriends.slice(0, 10).map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactInfo}>
                  {contact.avatar ? (
                    <Image source={{ uri: contact.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Users size={20} color={Colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactEmail}>{contact.email}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    sendFriendRequest(contact);
                    setPotentialFriends((prev) =>
                      prev.filter((c) => c.id !== contact.id)
                    );
                  }}
                >
                  <UserPlus size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            My Friends {friends.length > 0 && `(${friends.length})`}
          </Text>

          {friends.length > 0 ? (
            friends.map((friend) => (
              <View key={friend.id} style={styles.friendCard}>
                {friend.avatar ? (
                  <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Users size={20} color={Colors.textSecondary} />
                  </View>
                )}
                <View style={styles.friendDetails}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendEmail}>{friend.email}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyFriends}>
              <Users size={32} color={Colors.textSecondary} />
              <Text style={styles.emptyFriendsText}>
                {Platform.OS === "web"
                  ? "No friends yet. Friend requests coming soon!"
                  : "No friends yet. Sync your contacts to find friends!"}
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
  syncButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  requestCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  requestDetails: {
    flex: 1,
    gap: 4,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  requestEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  declineButton: {
    backgroundColor: Colors.surfaceLight,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  contactDetails: {
    flex: 1,
    gap: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  contactEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  addButton: {
    padding: 8,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  friendDetails: {
    flex: 1,
    gap: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  friendEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceLight,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyFriends: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyFriendsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
