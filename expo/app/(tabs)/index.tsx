import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Heatmap } from "react-native-maps";
import * as Location from "expo-location";
import { MapPin, Wine, MapPinned } from "lucide-react-native";
import { useApp } from "@/contexts/app-context";
import Colors from "@/constants/colors";
import HamburgerMenu from "@/components/HamburgerMenu";

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  (window as any).GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
}

type MapFilter = "all" | "finds" | "speakeasies";

export default function MapScreen() {
  const { finds, speakeasies, isLoading } = useApp();
  const [filter, setFilter] = useState<MapFilter>("all");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState<boolean>(true);

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
              setLocationLoading(false);
            },
            (error) => {
              console.log("Geolocation error:", error);
              setErrorMsg("Unable to get location");
              setLocation({ latitude: 38.2527, longitude: -85.7585 });
              setLocationLoading(false);
            }
          );
        } else {
          setErrorMsg("Geolocation not available");
          setLocation({ latitude: 38.2527, longitude: -85.7585 });
          setLocationLoading(false);
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          setLocation({ latitude: 38.2527, longitude: -85.7585 });
          setLocationLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        setLocationLoading(false);
      }
    })();
  }, []);

  if (isLoading || locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <MapPin size={48} color={Colors.textSecondary} />
        <Text style={styles.errorText}>{errorMsg || "Unable to load map"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'web' ? undefined : PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 1.5,
          longitudeDelta: 1.5,
        }}
        showsUserLocation={Platform.OS !== "web"}
        showsMyLocationButton={Platform.OS !== "web"}
      >
        {Platform.OS !== "web" && filter !== "speakeasies" && (
          <Heatmap
            points={finds.map(find => ({
              latitude: find.location.latitude,
              longitude: find.location.longitude,
              weight: 1,
            }))}
            radius={40}
            opacity={0.6}
            gradient={{
              colors: ["#00F", "#0FF", "#0F0", "#FF0", "#F00"],
              startPoints: [0.0, 0.25, 0.5, 0.75, 1.0],
              colorMapSize: 256,
            }}
          />
        )}

        {(filter === "all" || filter === "finds") && finds.map((find) => (
          <Marker
            key={`find-${find.id}`}
            coordinate={find.location}
            title={find.bourbonName}
            description={find.storeName}
            pinColor="#E63946"
          />
        ))}

        {(filter === "all" || filter === "speakeasies") && speakeasies.map((speakeasy) => (
          <Marker
            key={`speakeasy-${speakeasy.id}`}
            coordinate={speakeasy.location}
            title={speakeasy.name}
            description={speakeasy.address}
            pinColor="#457B9D"
          />
        ))}
      </MapView>

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <HamburgerMenu />
          <Text style={styles.headerTitle}>MapCask</Text>
          <View style={styles.storeCount}>
            <MapPin size={16} color={Colors.text} />
            <Text style={styles.storeCountText}>
              {filter === "all" 
                ? `${finds.length + speakeasies.length} pins` 
                : filter === "finds" 
                ? `${finds.length} finds`
                : `${speakeasies.length} spots`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
          onPress={() => setFilter("all")}
        >
          <MapPin size={18} color={filter === "all" ? Colors.text : Colors.textSecondary} />
          <Text style={[styles.filterButtonText, filter === "all" && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "finds" && styles.filterButtonActive]}
          onPress={() => setFilter("finds")}
        >
          <Wine size={18} color={filter === "finds" ? Colors.text : Colors.textSecondary} />
          <Text style={[styles.filterButtonText, filter === "finds" && styles.filterButtonTextActive]}>
            Finds ({finds.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "speakeasies" && styles.filterButtonActive]}
          onPress={() => setFilter("speakeasies")}
        >
          <MapPinned size={18} color={filter === "speakeasies" ? Colors.text : Colors.textSecondary} />
          <Text style={[styles.filterButtonText, filter === "speakeasies" && styles.filterButtonTextActive]}>
            Speakeasies ({speakeasies.length})
          </Text>
        </TouchableOpacity>
      </View>

      {errorMsg ? (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>{errorMsg}</Text>
        </View>
      ) : null}
    </View>
  );
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  map: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  storeCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  storeCountText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  warningBanner: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  warningText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  filterBar: {
    position: "absolute",
    top: 140,
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.text,
  },
});
