import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Camera as CameraIcon, Image as ImageIcon, X, MapPin } from "lucide-react-native";
import { useApp } from "@/contexts/app-context";
import { BourbonFind } from "@/types";
import Colors from "@/constants/colors";
import { bourbonBrands, bourbonProducts, getProductsByBrand, searchBourbons } from "@/mocks/bourbon-brands";
import HamburgerMenu from "@/components/HamburgerMenu";

export default function AddFindScreen() {
  const { user, addFind, isAddingFind } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [bourbonName, setBourbonName] = useState<string>("");
  const [bourbonBrand, setBourbonBrand] = useState<string>("");
  const [showBourbonPicker, setShowBourbonPicker] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>("");
  const [storeAddress, setStoreAddress] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              console.log("Geolocation error:", error);
            }
          );
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        }
      }
    })();
  }, []);

  const handleTakePhoto = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Permission needed", "Camera permission is required to take photos");
        return;
      }
    }

    if (Platform.OS === "web") {
      Alert.alert("Not available", "Camera is not available on web. Please use the gallery instead.");
      return;
    }

    setShowCamera(true);
  };

  const handleCapturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setPhoto(photo.uri);
        setShowCamera(false);
      }
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSelectBourbon = (productName: string, brandName: string) => {
    setBourbonName(productName);
    setBourbonBrand(brandName);
    setShowBourbonPicker(false);
    setSearchQuery("");
    setSelectedBrandFilter(null);
  };

  const filteredProducts = searchQuery
    ? searchBourbons(searchQuery)
    : selectedBrandFilter
    ? getProductsByBrand(selectedBrandFilter)
    : bourbonProducts;

  const handleSubmit = () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to share your finds");
      return;
    }

    if (!photo || !bourbonName || !bourbonBrand || !storeName || !storeAddress) {
      Alert.alert("Missing information", "Please fill in all required fields");
      return;
    }

    const newFind: BourbonFind = {
      id: Date.now().toString(),
      storeName,
      storeAddress,
      location: location || { latitude: 38.2527, longitude: -85.7585 },
      bourbonName,
      bourbonBrand,
      price: price ? parseFloat(price) : undefined,
      photos: [photo],
      description,
      hunterName: user.name,
      hunterAvatar: user.avatar,
      timestamp: new Date().toISOString(),
    };

    addFind(newFind);

    setPhoto(null);
    setBourbonName("");
    setBourbonBrand("");
    setStoreName("");
    setStoreAddress("");
    setPrice("");
    setDescription("");

    Alert.alert("Success!", "Your find has been shared with the community");
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.signInPrompt}>
          <CameraIcon size={64} color={Colors.textSecondary} />
          <Text style={styles.signInPromptTitle}>Sign in to share finds</Text>
          <Text style={styles.signInPromptText}>
            Create an account to share your bourbon discoveries with the community
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (Platform.OS !== "web" && showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={cameraRef} facing="back">
          <SafeAreaView style={styles.cameraControls} edges={["top", "bottom"]}>
            <TouchableOpacity
              style={styles.cameraCancelButton}
              onPress={() => setShowCamera(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapturePhoto}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <HamburgerMenu />
        <Text style={styles.headerTitle}>Share a Find</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photoSection}>
          {photo ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setPhoto(null)}
              >
                <X size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              {Platform.OS !== "web" && (
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handleTakePhoto}
                >
                  <CameraIcon size={32} color={Colors.accent} />
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handlePickImage}
              >
                <ImageIcon size={32} color={Colors.accent} />
                <Text style={styles.photoButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Bourbon *</Text>
            <TouchableOpacity
              style={styles.bourbonSelector}
              onPress={() => setShowBourbonPicker(true)}
            >
              {bourbonName ? (
                <View style={styles.bourbonSelected}>
                  <Text style={styles.bourbonSelectedName}>{bourbonName}</Text>
                  <Text style={styles.bourbonSelectedBrand}>{bourbonBrand}</Text>
                </View>
              ) : (
                <Text style={styles.bourbonSelectorPlaceholder}>Tap to select from database</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Store Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Bourbon Street Liquors"
              placeholderTextColor={Colors.textSecondary}
              value={storeName}
              onChangeText={setStoreName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Store Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 123 Main St, Louisville, KY"
              placeholderTextColor={Colors.textSecondary}
              value={storeAddress}
              onChangeText={setStoreAddress}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Price</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 89.99"
              placeholderTextColor={Colors.textSecondary}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share details about your find..."
              placeholderTextColor={Colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {location && (
            <View style={styles.locationInfo}>
              <MapPin size={16} color={Colors.accent} />
              <Text style={styles.locationText}>Location captured</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!photo || !bourbonName || !bourbonBrand || !storeName || !storeAddress || isAddingFind) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!photo || !bourbonName || !bourbonBrand || !storeName || !storeAddress || isAddingFind}
          >
            {isAddingFind ? (
              <ActivityIndicator size="small" color={Colors.text} />
            ) : (
              <Text style={styles.submitButtonText}>Share Find</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showBourbonPicker && (
        <View style={styles.pickerOverlay}>
          <SafeAreaView style={styles.pickerContainer} edges={["top", "bottom"]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Bourbon</Text>
              <TouchableOpacity onPress={() => setShowBourbonPicker(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search bourbons..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.brandFilterScroll}
              contentContainerStyle={styles.brandFilterContent}
            >
              <TouchableOpacity
                style={[
                  styles.brandFilterChip,
                  !selectedBrandFilter && styles.brandFilterChipActive,
                ]}
                onPress={() => setSelectedBrandFilter(null)}
              >
                <Text
                  style={[
                    styles.brandFilterChipText,
                    !selectedBrandFilter && styles.brandFilterChipTextActive,
                  ]}
                >
                  All Brands
                </Text>
              </TouchableOpacity>
              {bourbonBrands.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={[
                    styles.brandFilterChip,
                    selectedBrandFilter === brand.name && styles.brandFilterChipActive,
                  ]}
                  onPress={() => setSelectedBrandFilter(brand.name)}
                >
                  <Text
                    style={[
                      styles.brandFilterChipText,
                      selectedBrandFilter === brand.name && styles.brandFilterChipTextActive,
                    ]}
                  >
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView
              style={styles.productList}
              contentContainerStyle={styles.productListContent}
            >
              {filteredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productItem}
                  onPress={() => handleSelectBourbon(product.name, product.brand)}
                >
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productBrand}>{product.brand}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                  </View>
                  {product.avgPrice && (
                    <Text style={styles.productPrice}>${product.avgPrice.toFixed(2)}</Text>
                  )}
                </TouchableOpacity>
              ))}
              {filteredProducts.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No bourbons found</Text>
                  <Text style={styles.emptyStateSubtext}>Try a different search</Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  signInPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  signInPromptTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center",
  },
  signInPromptText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
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
    gap: 24,
  },
  photoSection: {
    gap: 16,
  },
  photoButtons: {
    flexDirection: "row",
    gap: 12,
  },
  photoButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed" as const,
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  photoPreviewContainer: {
    position: "relative",
  },
  photoPreview: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
  },
  removePhotoButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.surface,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
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
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cameraCancelButton: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surface,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
  },
  bourbonSelector: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    justifyContent: "center",
  },
  bourbonSelectorPlaceholder: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  bourbonSelected: {
    gap: 4,
  },
  bourbonSelectedName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  bourbonSelectedBrand: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    margin: 16,
  },
  brandFilterScroll: {
    maxHeight: 50,
    marginBottom: 8,
  },
  brandFilterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  brandFilterChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  brandFilterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  brandFilterChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  brandFilterChipTextActive: {
    color: Colors.text,
  },
  productList: {
    flex: 1,
  },
  productListContent: {
    padding: 16,
    gap: 12,
  },
  productItem: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  productBrand: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  productCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: "italic" as const,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.accent,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 8,
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
});
