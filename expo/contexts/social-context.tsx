import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import * as Contacts from "expo-contacts";
import { Platform } from "react-native";
import { Friend, FriendRequest, Message, Conversation } from "@/types";
import { useApp } from "./app-context";

const STORAGE_KEYS = {
  FRIENDS: "mapcask_friends",
  FRIEND_REQUESTS: "mapcask_friend_requests",
  MESSAGES: "mapcask_messages",
  CONVERSATIONS: "mapcask_conversations",
};

export const [SocialProvider, useSocial] = createContextHook(() => {
  const { user } = useApp();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contactsPermission, setContactsPermission] = useState<boolean>(false);

  const friendsQuery = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.FRIENDS);
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!user,
  });

  const friendRequestsQuery = useQuery({
    queryKey: ["friendRequests", user?.id],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS);
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!user,
  });

  const messagesQuery = useQuery({
    queryKey: ["messages", user?.id],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!user,
  });

  const conversationsQuery = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (friendsQuery.data) {
      setFriends(friendsQuery.data);
    }
  }, [friendsQuery.data]);

  useEffect(() => {
    if (friendRequestsQuery.data) {
      setFriendRequests(friendRequestsQuery.data);
    }
  }, [friendRequestsQuery.data]);

  useEffect(() => {
    if (messagesQuery.data) {
      setMessages(messagesQuery.data);
    }
  }, [messagesQuery.data]);

  useEffect(() => {
    if (conversationsQuery.data) {
      setConversations(conversationsQuery.data);
    }
  }, [conversationsQuery.data]);

  const requestContactsPermissionMutation = useMutation({
    mutationFn: async () => {
      if (Platform.OS === "web") {
        console.log("Contacts not available on web");
        return false;
      }
      const { status } = await Contacts.requestPermissionsAsync();
      return status === "granted";
    },
    onSuccess: (granted) => {
      setContactsPermission(granted);
    },
  });

  const syncContactsMutation = useMutation({
    mutationFn: async () => {
      if (Platform.OS === "web") {
        console.log("Contacts not available on web");
        return [];
      }
      if (!contactsPermission) {
        const granted = await requestContactsPermissionMutation.mutateAsync();
        if (!granted) {
          throw new Error("Contacts permission denied");
        }
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Emails, Contacts.Fields.Image],
      });
      
      const potentialFriends = data
        .filter((contact) => contact.emails && contact.emails.length > 0)
        .map((contact) => ({
          id: contact.id,
          name: contact.name || "Unknown",
          email: contact.emails?.[0]?.email || "",
          avatar: contact.image?.uri,
          status: "pending" as const,
          addedAt: new Date().toISOString(),
        }));

      return potentialFriends;
    },
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: async (friend: Friend) => {
      if (!user) throw new Error("User not signed in");
      
      const request: FriendRequest = {
        id: Date.now().toString(),
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserEmail: user.email,
        fromUserAvatar: user.avatar,
        toUserId: friend.id,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const updated = [...friendRequests, request];
      await AsyncStorage.setItem(
        STORAGE_KEYS.FRIEND_REQUESTS,
        JSON.stringify(updated)
      );
      return updated;
    },
    onSuccess: (data) => {
      setFriendRequests(data);
    },
  });

  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const request = friendRequests.find((r) => r.id === requestId);
      if (!request) throw new Error("Request not found");

      const updatedRequests = friendRequests.map((r) =>
        r.id === requestId ? { ...r, status: "accepted" as const } : r
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.FRIEND_REQUESTS,
        JSON.stringify(updatedRequests)
      );

      const newFriend: Friend = {
        id: request.fromUserId,
        name: request.fromUserName,
        email: request.fromUserEmail,
        avatar: request.fromUserAvatar,
        status: "accepted",
        addedAt: new Date().toISOString(),
      };

      const updatedFriends = [...friends, newFriend];
      await AsyncStorage.setItem(
        STORAGE_KEYS.FRIENDS,
        JSON.stringify(updatedFriends)
      );

      return { requests: updatedRequests, friends: updatedFriends };
    },
    onSuccess: (data) => {
      setFriendRequests(data.requests);
      setFriends(data.friends);
    },
  });

  const declineFriendRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const updatedRequests = friendRequests.map((r) =>
        r.id === requestId ? { ...r, status: "declined" as const } : r
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.FRIEND_REQUESTS,
        JSON.stringify(updatedRequests)
      );
      return updatedRequests;
    },
    onSuccess: (data) => {
      setFriendRequests(data);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      friendId,
      text,
    }: {
      friendId: string;
      text: string;
    }) => {
      if (!user) throw new Error("User not signed in");

      const friend = friends.find((f) => f.id === friendId);
      if (!friend) throw new Error("Friend not found");

      let conversation = conversations.find((c) =>
        c.participantIds.includes(friendId)
      );

      if (!conversation) {
        conversation = {
          id: Date.now().toString(),
          participantIds: [user.id, friendId],
          participantNames: [user.name, friend.name],
          participantAvatars: [user.avatar, friend.avatar],
          unreadCount: 0,
          updatedAt: new Date().toISOString(),
        };
      }

      const message: Message = {
        id: Date.now().toString(),
        conversationId: conversation.id,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        text,
        timestamp: new Date().toISOString(),
        read: false,
      };

      const updatedMessages = [...messages, message];
      await AsyncStorage.setItem(
        STORAGE_KEYS.MESSAGES,
        JSON.stringify(updatedMessages)
      );

      const updatedConversation = {
        ...conversation,
        lastMessage: message,
        unreadCount: conversation.unreadCount + 1,
        updatedAt: message.timestamp,
      };

      const updatedConversations = conversations.find(
        (c) => c.id === conversation!.id
      )
        ? conversations.map((c) =>
            c.id === conversation!.id ? updatedConversation : c
          )
        : [...conversations, updatedConversation];

      await AsyncStorage.setItem(
        STORAGE_KEYS.CONVERSATIONS,
        JSON.stringify(updatedConversations)
      );

      return { messages: updatedMessages, conversations: updatedConversations };
    },
    onSuccess: (data) => {
      setMessages(data.messages);
      setConversations(data.conversations);
    },
  });

  const markConversationAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const conversationMessages = messages.map((m) =>
        m.conversationId === conversationId ? { ...m, read: true } : m
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.MESSAGES,
        JSON.stringify(conversationMessages)
      );

      const updatedConversations = conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.CONVERSATIONS,
        JSON.stringify(updatedConversations)
      );

      return { messages: conversationMessages, conversations: updatedConversations };
    },
    onSuccess: (data) => {
      setMessages(data.messages);
      setConversations(data.conversations);
    },
  });

  const pendingFriendRequests = useMemo(
    () => friendRequests.filter((r) => r.status === "pending"),
    [friendRequests]
  );

  const acceptedFriends = useMemo(
    () => friends.filter((f) => f.status === "accepted"),
    [friends]
  );

  const totalUnreadCount = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  );

  return {
    friends: acceptedFriends,
    friendRequests: pendingFriendRequests,
    messages,
    conversations: conversations.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ),
    contactsPermission,
    totalUnreadCount,
    requestContactsPermission: () =>
      requestContactsPermissionMutation.mutate(),
    syncContacts: () => syncContactsMutation.mutateAsync(),
    sendFriendRequest: (friend: Friend) =>
      sendFriendRequestMutation.mutate(friend),
    acceptFriendRequest: (requestId: string) =>
      acceptFriendRequestMutation.mutate(requestId),
    declineFriendRequest: (requestId: string) =>
      declineFriendRequestMutation.mutate(requestId),
    sendMessage: (friendId: string, text: string) =>
      sendMessageMutation.mutate({ friendId, text }),
    markConversationAsRead: (conversationId: string) =>
      markConversationAsReadMutation.mutate(conversationId),
    isSyncingContacts: syncContactsMutation.isPending,
    isSendingFriendRequest: sendFriendRequestMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
  };
});

export function useConversationMessages(conversationId: string) {
  const { messages } = useSocial();
  return useMemo(
    () =>
      messages
        .filter((m) => m.conversationId === conversationId)
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
    [messages, conversationId]
  );
}
