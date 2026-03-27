import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageCircle, Users } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSocial } from "@/contexts/social-context";
import { useApp } from "@/contexts/app-context";
import Colors from "@/constants/colors";
import HamburgerMenu from "@/components/HamburgerMenu";

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useApp();
  const { conversations } = useSocial();

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.emptyState}>
          <MessageCircle size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptySubtitle}>
            Sign in to message your friends and share bourbon finds
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getOtherParticipantName = (conv: typeof conversations[0]) => {
    const otherIndex = conv.participantIds.findIndex((id) => id !== user.id);
    return conv.participantNames[otherIndex] || "Unknown";
  };

  const getOtherParticipantAvatar = (conv: typeof conversations[0]) => {
    const otherIndex = conv.participantIds.findIndex((id) => id !== user.id);
    return conv.participantAvatars[otherIndex];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? "Just now" : `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days}d ago`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <HamburgerMenu />
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={styles.conversationCard}
              onPress={() => {
                router.push({
                  pathname: "/chat/[id]",
                  params: { id: conversation.id },
                });
              }}
            >
              <View style={styles.conversationLeft}>
                {getOtherParticipantAvatar(conversation) ? (
                  <Image
                    source={{ uri: getOtherParticipantAvatar(conversation) }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Users size={20} color={Colors.textSecondary} />
                  </View>
                )}
                <View style={styles.conversationDetails}>
                  <Text style={styles.conversationName}>
                    {getOtherParticipantName(conversation)}
                  </Text>
                  {conversation.lastMessage && (
                    <Text
                      style={[
                        styles.lastMessage,
                        conversation.unreadCount > 0 && styles.lastMessageUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage.senderId === user.id
                        ? "You: "
                        : ""}
                      {conversation.lastMessage.text}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.conversationRight}>
                {conversation.lastMessage && (
                  <Text style={styles.timestamp}>
                    {formatTimestamp(conversation.lastMessage.timestamp)}
                  </Text>
                )}
                {conversation.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>
                      {conversation.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyMessages}>
            <MessageCircle size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyMessagesText}>No messages yet</Text>
            <Text style={styles.emptyMessagesSubtext}>
              Connect with friends to start chatting about bourbon finds!
            </Text>
          </View>
        )}
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
  },
  conversationCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  conversationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  conversationDetails: {
    flex: 1,
    gap: 6,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  lastMessageUnread: {
    fontWeight: "600" as const,
    color: Colors.text,
  },
  conversationRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: Colors.accent,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceLight,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyMessages: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 48,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 24,
  },
  emptyMessagesText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  emptyMessagesSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
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
