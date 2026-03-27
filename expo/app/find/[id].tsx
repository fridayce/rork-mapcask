import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  ArrowLeft,
  Star,
  MapPin,
  DollarSign,
  Bookmark,
  Camera,
  MessageSquare,
  Share2,
  CheckCircle2,
  Clock,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "@/contexts/app-context";
import Colors from "@/constants/colors";

export default function FindDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { finds } = useApp();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const find = finds.find((f) => f.id === id);
  
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewText, setReviewText] = useState<string>("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [checkInNote, setCheckInNote] = useState<string>("");
  const [showCheckInModal, setShowCheckInModal] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  if (!find) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Find not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log("Photo selected:", result.assets[0].uri);
    }
  };

  const handleCheckIn = () => {
    console.log("Checked in at", find.storeName, checkInNote);
    setShowCheckInModal(false);
    setCheckInNote("");
  };

  const handleSubmitReview = () => {
    console.log("Review submitted:", reviewRating, reviewText);
    setShowReviewModal(false);
    setReviewText("");
    setReviewRating(5);
  };

  const handleViewMap = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${find.storeName}@${find.location.latitude},${find.location.longitude}`,
      android: `geo:0,0?q=${find.location.latitude},${find.location.longitude}(${find.storeName})`,
      default: `https://www.google.com/maps/search/?api=1&query=${find.location.latitude},${find.location.longitude}`,
    });
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: find.photos[0] }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <SafeAreaView style={styles.imageOverlay} edges={["top"]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Share2 size={20} color={Colors.text} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.name}>{find.bourbonName}</Text>
              <Text style={styles.brand}>{find.bourbonBrand}</Text>
              <View style={styles.metaRow}>
                {find.price && (
                  <View style={styles.priceContainer}>
                    <DollarSign size={16} color="#E63946" />
                    <Text style={styles.priceText}>${find.price.toFixed(2)}</Text>
                  </View>
                )}
                <View style={styles.timeContainer}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.timeText}>
                    Found {formatTime(find.timestamp)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.hunterSection}>
            {find.hunterAvatar && (
              <Image
                source={{ uri: find.hunterAvatar }}
                style={styles.hunterAvatar}
              />
            )}
            <View style={styles.hunterInfo}>
              <Text style={styles.hunterLabel}>Found by</Text>
              <Text style={styles.hunterName}>{find.hunterName}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowReviewModal(true)}>
              <MessageSquare size={22} color={Colors.accent} />
              <Text style={styles.actionButtonText}>Add Review</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleAddPhoto}>
              <Camera size={22} color={Colors.accent} />
              <Text style={styles.actionButtonText}>Add Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowCheckInModal(true)}>
              <CheckCircle2 size={22} color={Colors.accent} />
              <Text style={styles.actionButtonText}>Check In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setIsFavorited(!isFavorited)}
            >
              <Bookmark 
                size={22} 
                color={isFavorited ? "#E63946" : Colors.accent}
                fill={isFavorited ? "#E63946" : "transparent"}
              />
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity style={styles.locationCard} onPress={handleViewMap}>
              <View style={styles.locationInfo}>
                <MapPin size={20} color={Colors.accent} />
                <View style={styles.locationTexts}>
                  <Text style={styles.storeName}>{find.storeName}</Text>
                  <Text style={styles.storeAddress}>{find.storeAddress}</Text>
                </View>
              </View>
              <Text style={styles.viewMapText}>View Map</Text>
            </TouchableOpacity>
          </View>

          {find.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Find</Text>
              <Text style={styles.description}>{find.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Reviews ({find.reviews.length})
            </Text>
            {find.reviews.length === 0 ? (
              <View style={styles.emptyState}>
                <MessageSquare size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>No reviews yet</Text>
                <Text style={styles.emptyStateSubtext}>Be the first to review!</Text>
              </View>
            ) : (
              find.reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    {review.userAvatar && (
                      <Image
                        source={{ uri: review.userAvatar }}
                        style={styles.reviewAvatar}
                      />
                    )}
                    <View style={styles.reviewHeaderInfo}>
                      <Text style={styles.reviewUserName}>{review.userName}</Text>
                      <View style={styles.reviewRating}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            color="#E63946"
                            fill={i < review.rating ? "#E63946" : "transparent"}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.text}</Text>
                  {review.photos && review.photos.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.reviewPhotos}
                    >
                      {review.photos.map((photo, index) => (
                        <Image
                          key={index}
                          source={{ uri: photo }}
                          style={styles.reviewPhoto}
                        />
                      ))}
                    </ScrollView>
                  )}
                  <Text style={styles.reviewTime}>
                    {formatTime(review.timestamp)}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Recent Check-ins ({find.checkIns.length})
            </Text>
            {find.checkIns.length === 0 ? (
              <View style={styles.emptyState}>
                <CheckCircle2 size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>No check-ins yet</Text>
              </View>
            ) : (
              find.checkIns.slice(0, 5).map((checkIn) => (
                <View key={checkIn.id} style={styles.checkInCard}>
                  {checkIn.userAvatar && (
                    <Image
                      source={{ uri: checkIn.userAvatar }}
                      style={styles.checkInAvatar}
                    />
                  )}
                  <View style={styles.checkInInfo}>
                    <Text style={styles.checkInUserName}>{checkIn.userName}</Text>
                    <Text style={styles.checkInTime}>
                      {formatTime(checkIn.timestamp)}
                    </Text>
                    {checkIn.note && (
                      <Text style={styles.checkInNote}>{checkIn.note}</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {showReviewModal && (
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.ratingLabel}>Your Rating</Text>
              <View style={styles.ratingSelector}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setReviewRating(i + 1)}
                  >
                    <Star
                      size={32}
                      color="#E63946"
                      fill={i < reviewRating ? "#E63946" : "transparent"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.reviewInput}
                placeholder="Share your experience..."
                placeholderTextColor={Colors.textSecondary}
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !reviewText && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitReview}
                disabled={!reviewText}
              >
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      )}

      {showCheckInModal && (
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Check In</Text>
              <TouchableOpacity onPress={() => setShowCheckInModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.checkInTitle}>
                {"You're checking in at "}{find.storeName}
              </Text>

              <TextInput
                style={styles.reviewInput}
                placeholder="Add a note (optional)"
                placeholderTextColor={Colors.textSecondary}
                value={checkInNote}
                onChangeText={setCheckInNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCheckIn}
              >
                <Text style={styles.submitButtonText}>Check In</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      )}
    </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.surfaceLight,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  header: {
    gap: 12,
  },
  titleSection: {
    gap: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  brand: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#E63946",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  hunterSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hunterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceLight,
  },
  hunterInfo: {
    flex: 1,
    gap: 2,
  },
  hunterLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  hunterName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  locationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  locationTexts: {
    flex: 1,
    gap: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  storeAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  viewMapText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.accent,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
  },
  reviewHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  reviewUserName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  reviewRating: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  reviewPhotos: {
    flexDirection: "row",
    gap: 8,
  },
  reviewPhoto: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: Colors.surfaceLight,
  },
  reviewTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  checkInCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkInAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
  },
  checkInInfo: {
    flex: 1,
    gap: 4,
  },
  checkInUserName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  checkInTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  checkInNote: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.accent,
  },
  modalContent: {
    padding: 20,
    gap: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  ratingSelector: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  reviewInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  checkInTitle: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
