import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, MapPin, DollarSign, Star, Wine } from "lucide-react-native";
import { useApp } from "@/contexts/app-context";
import Colors from "@/constants/colors";
import HamburgerMenu from "@/components/HamburgerMenu";

type Tab = "finds" | "speakeasies";

export default function DiscoverScreen() {
  const { finds, speakeasies, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>("finds");

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading finds...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <HamburgerMenu />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === "finds"
              ? `${finds.length} bourbon${finds.length !== 1 ? "s" : ""} spotted`
              : `${speakeasies.length} speakeasy${speakeasies.length !== 1 ? "ies" : ""} to visit`}
          </Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "finds" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("finds")}
          activeOpacity={0.7}
        >
          <Wine
            size={20}
            color={activeTab === "finds" ? Colors.accent : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "finds" && styles.activeTabText,
            ]}
          >
            Bourbon Finds
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "speakeasies" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("speakeasies")}
          activeOpacity={0.7}
        >
          <MapPin
            size={20}
            color={activeTab === "speakeasies" ? Colors.accent : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "speakeasies" && styles.activeTabText,
            ]}
          >
            Speakeasies
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "finds" && finds.map((find) => (
          <TouchableOpacity
            key={find.id}
            style={styles.card}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: find.photos[0] }}
              style={styles.cardImage}
              resizeMode="cover"
            />

            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.hunterInfo}>
                  {find.hunterAvatar ? (
                    <Image
                      source={{ uri: find.hunterAvatar }}
                      style={styles.hunterAvatar}
                    />
                  ) : null}
                  <Text style={styles.hunterName}>{find.hunterName}</Text>
                </View>
                <View style={styles.timeContainer}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.timeText}>
                    {formatTime(find.timestamp)}
                  </Text>
                </View>
              </View>

              <Text style={styles.bourbonName}>{find.bourbonName}</Text>
              <Text style={styles.bourbonBrand}>{find.bourbonBrand}</Text>

              {find.price ? (
                <View style={styles.priceContainer}>
                  <DollarSign size={16} color={Colors.accent} />
                  <Text style={styles.priceText}>
                    ${find.price.toFixed(2)}
                  </Text>
                </View>
              ) : null}

              <Text style={styles.description} numberOfLines={2}>
                {find.description}
              </Text>

              <View style={styles.locationContainer}>
                <MapPin size={14} color={Colors.textSecondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {find.storeName}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {activeTab === "speakeasies" && speakeasies.map((speakeasy) => (
          <TouchableOpacity
            key={speakeasy.id}
            style={styles.card}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: speakeasy.coverPhoto }}
              style={styles.cardImage}
              resizeMode="cover"
            />

            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.hunterInfo}>
                  {speakeasy.recommendedByAvatar ? (
                    <Image
                      source={{ uri: speakeasy.recommendedByAvatar }}
                      style={styles.hunterAvatar}
                    />
                  ) : null}
                  <Text style={styles.hunterName}>
                    {speakeasy.recommendedBy}
                  </Text>
                </View>
                <View style={styles.ratingContainer}>
                  <Star size={16} color={Colors.accent} fill={Colors.accent} />
                  <Text style={styles.ratingText}>{speakeasy.rating}</Text>
                </View>
              </View>

              <Text style={styles.bourbonName}>{speakeasy.name}</Text>
              <Text style={styles.bourbonBrand}>{speakeasy.ambiance}</Text>

              <View style={styles.speakeasyInfo}>
                <Text style={styles.priceRange}>{speakeasy.priceRange}</Text>
                <Text style={styles.signature}>{speakeasy.signature}</Text>
              </View>

              <Text style={styles.description} numberOfLines={2}>
                {speakeasy.description}
              </Text>

              <View style={styles.locationContainer}>
                <MapPin size={14} color={Colors.textSecondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {speakeasy.address}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {activeTab === "finds" && finds.length === 0 && (
          <View style={styles.emptyState}>
            <Wine size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No finds yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to share a bourbon find!
            </Text>
          </View>
        )}

        {activeTab === "speakeasies" && speakeasies.length === 0 && (
          <View style={styles.emptyState}>
            <MapPin size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No speakeasies yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to recommend a speakeasy!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
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
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImage: {
    width: "100%",
    height: 220,
    backgroundColor: Colors.surfaceLight,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  hunterInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hunterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
  },
  hunterName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bourbonName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  bourbonBrand: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.accent,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.accent,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeTab: {
    backgroundColor: Colors.surfaceLight,
    borderColor: Colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.accent,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.accent,
  },
  speakeasyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  priceRange: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.accent,
  },
  signature: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    flex: 1,
  },
});
