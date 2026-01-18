import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Send, Users } from "lucide-react-native";
import { useSocial, useConversationMessages } from "@/contexts/social-context";
import { useApp } from "@/contexts/app-context";
import Colors from "@/constants/colors";

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useApp();
  const { conversations, sendMessage, markConversationAsRead } = useSocial();
  const messages = useConversationMessages(id as string);
  const [messageText, setMessageText] = useState<string>("");
  const scrollViewRef = useRef<ScrollView>(null);

  const conversation = conversations.find((c) => c.id === id);

  useEffect(() => {
    if (conversation) {
      markConversationAsRead(conversation.id);
    }
  }, [conversation, markConversationAsRead]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  if (!conversation || !user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Conversation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const otherParticipantIndex = conversation.participantIds.findIndex(
    (pid) => pid !== user.id
  );
  const otherParticipantName =
    conversation.participantNames[otherParticipantIndex] || "Unknown";
  const otherParticipantAvatar =
    conversation.participantAvatars[otherParticipantIndex];
  const otherParticipantId = conversation.participantIds[otherParticipantIndex];

  const handleSend = () => {
    if (messageText.trim()) {
      sendMessage(otherParticipantId, messageText.trim());
      setMessageText("");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.chatHeader}>
        {otherParticipantAvatar ? (
          <Image
            source={{ uri: otherParticipantAvatar }}
            style={styles.headerAvatar}
          />
        ) : (
          <View style={styles.headerAvatarPlaceholder}>
            <Users size={20} color={Colors.textSecondary} />
          </View>
        )}
        <Text style={styles.chatHeaderTitle}>{otherParticipantName}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message, index) => {
            const isMyMessage = message.senderId === user.id;
            const showAvatar =
              index === 0 ||
              messages[index - 1].senderId !== message.senderId;

            return (
              <View
                key={message.id}
                style={[
                  styles.messageRow,
                  isMyMessage ? styles.myMessageRow : styles.theirMessageRow,
                ]}
              >
                {!isMyMessage && (
                  <View style={styles.avatarContainer}>
                    {showAvatar ? (
                      otherParticipantAvatar ? (
                        <Image
                          source={{ uri: otherParticipantAvatar }}
                          style={styles.messageAvatar}
                        />
                      ) : (
                        <View style={styles.messageAvatarPlaceholder}>
                          <Users size={12} color={Colors.textSecondary} />
                        </View>
                      )
                    ) : (
                      <View style={styles.avatarSpacer} />
                    )}
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    isMyMessage
                      ? styles.myMessageBubble
                      : styles.theirMessageBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isMyMessage
                        ? styles.myMessageText
                        : styles.theirMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      isMyMessage
                        ? styles.myMessageTime
                        : styles.theirMessageTime,
                    ]}
                  >
                    {formatTimestamp(message.timestamp)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Send size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 8,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  theirMessageRow: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatarSpacer: {
    width: 32,
    height: 32,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
  },
  messageAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
  },
  myMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: Colors.text,
  },
  theirMessageText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 2,
  },
  myMessageTime: {
    color: Colors.textSecondary,
    textAlign: "right",
  },
  theirMessageTime: {
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
