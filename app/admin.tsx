import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "@/contexts/app-context";
import { useSocial } from "@/contexts/social-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, Users, MapPin, Bold, MessageSquare, Download } from "lucide-react-native";

type TabType = "users" | "stores" | "finds" | "friends" | "messages";

export default function AdminPortal() {
  const router = useRouter();
  const { user, stores, finds } = useApp();
  const { friends, friendRequests, messages, conversations } = useSocial();
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const ADMIN_PASSWORD = "mapcask2024";

  const handleLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      if (Platform.OS === "web") {
        alert("Invalid admin password");
      } else {
        Alert.alert("Error", "Invalid admin password");
      }
    }
  };

  const exportData = async () => {
    const allData = {
      exportedAt: new Date().toISOString(),
      currentUser: user,
      stores,
      finds,
      friends,
      friendRequests,
      messages,
      conversations,
    };

    console.log("=== ADMIN DATA EXPORT ===");
    console.log(JSON.stringify(allData, null, 2));
    console.log("=== END EXPORT ===");

    if (Platform.OS === "web") {
      alert("Data exported to console. Check browser developer tools.");
    } else {
      Alert.alert("Success", "Data exported to console logs");
    }
  };

  const clearAllData = async () => {
    const confirmAction = () => {
      AsyncStorage.clear();
      if (Platform.OS === "web") {
        alert("All data cleared successfully");
      } else {
        Alert.alert("Success", "All data cleared successfully");
      }
    };

    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to clear all app data? This cannot be undone.")) {
        confirmAction();
      }
    } else {
      Alert.alert(
        "Clear All Data",
        "Are you sure you want to clear all app data? This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Clear", style: "destructive", onPress: confirmAction },
        ]
      );
    }
  };

  const filteredStores = useMemo(() => {
    if (!searchQuery) return stores;
    const query = searchQuery.toLowerCase();
    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query) ||
        store.addedBy.toLowerCase().includes(query)
    );
  }, [stores, searchQuery]);

  const filteredFinds = useMemo(() => {
    if (!searchQuery) return finds;
    const query = searchQuery.toLowerCase();
    return finds.filter(
      (find) =>
        find.bourbonName.toLowerCase().includes(query) ||
        find.bourbonBrand.toLowerCase().includes(query) ||
        find.storeName.toLowerCase().includes(query) ||
        find.hunterName.toLowerCase().includes(query)
    );
  }, [finds, searchQuery]);

  const filteredFriends = useMemo(() => {
    if (!searchQuery) return friends;
    const query = searchQuery.toLowerCase();
    return friends.filter(
      (friend) =>
        friend.name.toLowerCase().includes(query) ||
        friend.email.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    const query = searchQuery.toLowerCase();
    return messages.filter(
      (msg) =>
        msg.text.toLowerCase().includes(query) ||
        msg.senderName.toLowerCase().includes(query)
    );
  }, [messages, searchQuery]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Admin Portal</Text>
          <Text style={styles.loginSubtitle}>Enter admin password to continue</Text>
          <TextInput
            style={styles.passwordInput}
            placeholder="Admin Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={adminPassword}
            onChangeText={setAdminPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Portal</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportData}>
          <Download size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "users" && styles.activeTab]}
            onPress={() => setActiveTab("users")}
          >
            <Users size={18} color={activeTab === "users" ? "#fff" : "#666"} />
            <Text style={[styles.tabText, activeTab === "users" && styles.activeTabText]}>
              User
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "stores" && styles.activeTab]}
            onPress={() => setActiveTab("stores")}
          >
            <MapPin size={18} color={activeTab === "stores" ? "#fff" : "#666"} />
            <Text style={[styles.tabText, activeTab === "stores" && styles.activeTabText]}>
              Stores ({stores.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "finds" && styles.activeTab]}
            onPress={() => setActiveTab("finds")}
          >
            <Bold size={18} color={activeTab === "finds" ? "#fff" : "#666"} />
            <Text style={[styles.tabText, activeTab === "finds" && styles.activeTabText]}>
              Finds ({finds.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "friends" && styles.activeTab]}
            onPress={() => setActiveTab("friends")}
          >
            <Users size={18} color={activeTab === "friends" ? "#fff" : "#666"} />
            <Text style={[styles.tabText, activeTab === "friends" && styles.activeTabText]}>
              Friends ({friends.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "messages" && styles.activeTab]}
            onPress={() => setActiveTab("messages")}
          >
            <MessageSquare size={18} color={activeTab === "messages" ? "#fff" : "#666"} />
            <Text style={[styles.tabText, activeTab === "messages" && styles.activeTabText]}>
              Messages ({messages.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {activeTab !== "users" && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      <ScrollView style={styles.content}>
        {activeTab === "users" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current User</Text>
            {user ? (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Name:</Text>
                  <Text style={styles.value}>{user.name}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{user.email}</Text>
                </View>
                {user.city && (
                  <View style={styles.row}>
                    <Text style={styles.label}>City:</Text>
                    <Text style={styles.value}>{user.city}</Text>
                  </View>
                )}
                {user.state && (
                  <View style={styles.row}>
                    <Text style={styles.label}>State:</Text>
                    <Text style={styles.value}>{user.state}</Text>
                  </View>
                )}
                {user.avatar && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Avatar:</Text>
                    <Text style={styles.value} numberOfLines={1}>{user.avatar}</Text>
                  </View>
                )}
                <View style={styles.row}>
                  <Text style={styles.label}>ID:</Text>
                  <Text style={styles.value}>{user.id}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Joined:</Text>
                  <Text style={styles.value}>
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>No user signed in</Text>
            )}
          </View>
        )}

        {activeTab === "stores" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Store Locations ({filteredStores.length})</Text>
            {filteredStores.length === 0 ? (
              <Text style={styles.emptyText}>No stores found</Text>
            ) : (
              filteredStores.map((store) => (
                <View key={store.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{store.name}</Text>
                  <View style={styles.row}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{store.address}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Location:</Text>
                    <Text style={styles.value}>
                      {store.location.latitude.toFixed(4)}, {store.location.longitude.toFixed(4)}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Added By:</Text>
                    <Text style={styles.value}>{store.addedBy}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Added:</Text>
                    <Text style={styles.value}>
                      {new Date(store.addedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "finds" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bourbon Finds ({filteredFinds.length})</Text>
            {filteredFinds.length === 0 ? (
              <Text style={styles.emptyText}>No bourbon finds</Text>
            ) : (
              filteredFinds.map((find) => (
                <View key={find.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{find.bourbonName}</Text>
                  <View style={styles.row}>
                    <Text style={styles.label}>Brand:</Text>
                    <Text style={styles.value}>{find.bourbonBrand}</Text>
                  </View>
                  {find.price && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Price:</Text>
                      <Text style={styles.value}>${find.price.toFixed(2)}</Text>
                    </View>
                  )}
                  <View style={styles.row}>
                    <Text style={styles.label}>Store:</Text>
                    <Text style={styles.value}>{find.storeName}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{find.storeAddress}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Hunter:</Text>
                    <Text style={styles.value}>{find.hunterName}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.value}>{find.description}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Photos:</Text>
                    <Text style={styles.value}>{find.photos.length} image(s)</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Posted:</Text>
                    <Text style={styles.value}>
                      {new Date(find.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "friends" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Friends ({filteredFriends.length})</Text>
            {filteredFriends.length === 0 ? (
              <Text style={styles.emptyText}>No friends</Text>
            ) : (
              filteredFriends.map((friend) => (
                <View key={friend.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{friend.name}</Text>
                  <View style={styles.row}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{friend.email}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.value}>{friend.status}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Added:</Text>
                    <Text style={styles.value}>
                      {new Date(friend.addedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Friend Requests ({friendRequests.length})
            </Text>
            {friendRequests.length === 0 ? (
              <Text style={styles.emptyText}>No friend requests</Text>
            ) : (
              friendRequests.map((request) => (
                <View key={request.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{request.fromUserName}</Text>
                  <View style={styles.row}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{request.fromUserEmail}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.value}>{request.status}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Created:</Text>
                    <Text style={styles.value}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "messages" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Messages ({filteredMessages.length})</Text>
            {filteredMessages.length === 0 ? (
              <Text style={styles.emptyText}>No messages</Text>
            ) : (
              filteredMessages.map((message) => (
                <View key={message.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{message.senderName}</Text>
                  <View style={styles.row}>
                    <Text style={styles.label}>Message:</Text>
                    <Text style={styles.value}>{message.text}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Conversation ID:</Text>
                    <Text style={styles.value}>{message.conversationId}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Read:</Text>
                    <Text style={styles.value}>{message.read ? "Yes" : "No"}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Sent:</Text>
                    <Text style={styles.value}>
                      {new Date(message.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))
            )}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Conversations ({conversations.length})
            </Text>
            {conversations.length === 0 ? (
              <Text style={styles.emptyText}>No conversations</Text>
            ) : (
              conversations.map((conv) => (
                <View key={conv.id} style={styles.card}>
                  <Text style={styles.cardTitle}>
                    {conv.participantNames.join(" & ")}
                  </Text>
                  <View style={styles.row}>
                    <Text style={styles.label}>Participants:</Text>
                    <Text style={styles.value}>{conv.participantIds.length}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Unread:</Text>
                    <Text style={styles.value}>{conv.unreadCount}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Last Updated:</Text>
                    <Text style={styles.value}>
                      {new Date(conv.updatedAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
            <Text style={styles.dangerButtonText}>Clear All App Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 32,
  },
  passwordInput: {
    width: "100%",
    maxWidth: 400,
    height: 56,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
  },
  loginButton: {
    width: "100%",
    maxWidth: 400,
    height: 56,
    backgroundColor: "#8B4513",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
  backButton: {
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#8B4513",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerBack: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  exportButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    paddingVertical: 12,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#8B4513",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    height: 48,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#999",
    minWidth: 100,
  },
  value: {
    fontSize: 14,
    color: "#fff",
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingVertical: 32,
  },
  dangerZone: {
    padding: 16,
    marginTop: 24,
    marginBottom: 40,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#ff4444",
    marginBottom: 16,
  },
  dangerButton: {
    height: 56,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
