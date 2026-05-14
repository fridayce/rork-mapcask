import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Layers, MapPin, Navigation, Info, ExternalLink, X } from "lucide-react-native";
import * as Location from "expo-location";
import * as WebBrowser from "expo-web-browser";
import { useApp } from "@/contexts/app-context";
import Colors from "@/constants/colors";
import HamburgerMenu from "@/components/HamburgerMenu";

// The deployed URL of the WebXR experience. In production this points to the
// HTTPS host serving /expo/webxr/ — it must be HTTPS for WebXR + GPS to work.
const AR_BASE_URL = "https://your-deployment.example.com/webxr/";
const AR_EXPERIENCE_URL = AR_BASE_URL + "ar.html";
const AR_LANDING_URL    = AR_BASE_URL + "index.html";

const TRIGGER_RADIUS_M = 200; // mirrors ar-engine.js threshold

// ── Haversine distance utility (mirrors gps-tracker.js) ──────────────────────
function distanceBetween(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

// ── QR code SVG ──────────────────────────────────────────────────────────────
// Placeholder visual — replace with a library like react-native-qrcode-svg
// in production, pointing at AR_LANDING_URL.
function QRCodePlaceholder() {
  return (
    <View style={styles.qrWrapper}>
      <View style={styles.qrInner}>
        {/* Finder pattern corners */}
        <View style={[styles.qrFinder, { top: 0, left: 0 }]} />
        <View style={[styles.qrFinder, { top: 0, right: 0 }]} />
        <View style={[styles.qrFinder, { bottom: 0, left: 0 }]} />
        {/* Centre label */}
        <View style={styles.qrCenter}>
          <Text style={styles.qrEmoji}>🥃</Text>
          <Text style={styles.qrLabel}>MapCask AR</Text>
        </View>
      </View>
      <Text style={styles.qrNote}>
        Deploy the /webxr/ folder and generate a real QR code{"\n"}
        pointing to <Text style={{ color: Colors.accent }}>{AR_LANDING_URL}</Text>
      </Text>
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ARScreen() {
  const { finds, speakeasies, isLoading } = useApp();

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [archInfoVisible, setArchInfoVisible] = useState(false);

  // ── Location ──────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
              setLocationLoading(false);
            },
            () => setLocationLoading(false)
          );
        } else {
          setLocationLoading(false);
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { setLocationLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLocationLoading(false);
    })();
  }, []);

  // ── AR waypoints — merge finds + speakeasies into one list ───────────────

  const arWaypoints = React.useMemo(() => {
    const result: Array<{
      id: string;
      name: string;
      subtitle: string;
      type: "bourbon" | "speakeasy";
      latitude: number;
      longitude: number;
      distance: number | null;
      withinRange: boolean;
    }> = [];

    finds.forEach((f) => {
      const dist = userLocation
        ? distanceBetween(userLocation.latitude, userLocation.longitude, f.location.latitude, f.location.longitude)
        : null;
      result.push({
        id: f.id,
        name: f.bourbonName,
        subtitle: f.storeName,
        type: "bourbon",
        latitude: f.location.latitude,
        longitude: f.location.longitude,
        distance: dist,
        withinRange: dist !== null && dist <= TRIGGER_RADIUS_M,
      });
    });

    speakeasies.forEach((s) => {
      const dist = userLocation
        ? distanceBetween(userLocation.latitude, userLocation.longitude, s.location.latitude, s.location.longitude)
        : null;
      result.push({
        id: s.id,
        name: s.name,
        subtitle: s.address,
        type: "speakeasy",
        latitude: s.location.latitude,
        longitude: s.location.longitude,
        distance: dist,
        withinRange: dist !== null && dist <= TRIGGER_RADIUS_M,
      });
    });

    // Sort by distance ascending (null distances go last)
    result.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    return result;
  }, [finds, speakeasies, userLocation]);

  const nearbyCount = arWaypoints.filter((w) => w.withinRange).length;

  // ── Launch AR ─────────────────────────────────────────────────────────────

  const openAR = useCallback(async () => {
    if (Platform.OS === "web") {
      window.open(AR_EXPERIENCE_URL, "_blank");
      return;
    }
    await WebBrowser.openBrowserAsync(AR_EXPERIENCE_URL, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      toolbarColor: "#0C0A10",
      controlsColor: "#E8922A",
    });
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading || locationLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading AR waypoints…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <HamburgerMenu />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>AR Experience</Text>
          <Text style={styles.headerSubtitle}>Location-based augmented reality</Text>
        </View>
        <TouchableOpacity onPress={() => setArchInfoVisible(true)} style={styles.infoBtn}>
          <Info size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🥃</Text>
          <Text style={styles.heroTitle}>MapCask AR</Text>
          <Text style={styles.heroSubtitle}>
            Walk to any pinned location and see bourbon finds and speakeasies
            appear as 3D objects through your camera — no app download required.
          </Text>

          {nearbyCount > 0 && (
            <View style={styles.nearbyBadge}>
              <Navigation size={14} color="#4DD080" />
              <Text style={styles.nearbyBadgeText}>{nearbyCount} location{nearbyCount !== 1 ? "s" : ""} in AR range</Text>
            </View>
          )}

          <TouchableOpacity style={styles.btnLaunch} onPress={openAR} activeOpacity={0.85}>
            <ExternalLink size={18} color="#fff" />
            <Text style={styles.btnLaunchText}>Launch AR Experience</Text>
          </TouchableOpacity>

          <Text style={styles.heroNote}>
            Opens in your browser · No app install required
          </Text>
        </View>

        {/* ── Tech stack pills ── */}
        <View style={styles.techRow}>
          {["Unity 2022", "WebXR API", "WebGL 2.0", "Three.js", "GPS"].map((t) => (
            <View key={t} style={styles.techBadge}>
              <Text style={styles.techBadgeText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* ── Waypoints list ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AR Waypoints ({arWaypoints.length})</Text>
          <Text style={styles.sectionSubtitle}>
            Approach within {TRIGGER_RADIUS_M} m to trigger an AR object
          </Text>
        </View>

        {arWaypoints.map((wp) => (
          <View
            key={wp.id}
            style={[styles.waypointCard, wp.withinRange && styles.waypointCardActive]}
          >
            <View style={styles.waypointIcon}>
              <Text style={styles.waypointEmoji}>{wp.type === "bourbon" ? "🥃" : "📍"}</Text>
            </View>

            <View style={styles.waypointInfo}>
              <Text style={styles.waypointName} numberOfLines={1}>{wp.name}</Text>
              <Text style={styles.waypointSub} numberOfLines={1}>{wp.subtitle}</Text>
            </View>

            <View style={styles.waypointRight}>
              {wp.distance !== null ? (
                <>
                  <Text style={[styles.waypointDist, wp.withinRange && styles.waypointDistNear]}>
                    {formatDistance(wp.distance)}
                  </Text>
                  {wp.withinRange && (
                    <View style={styles.inRangeDot} />
                  )}
                </>
              ) : (
                <Text style={styles.waypointDist}>—</Text>
              )}
            </View>
          </View>
        ))}

        {/* ── QR share section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share AR Link</Text>
          <Text style={styles.sectionSubtitle}>
            Anyone with this QR code can open the AR experience directly in their browser.
          </Text>
        </View>

        <TouchableOpacity style={styles.qrCard} onPress={() => setQrModalVisible(true)} activeOpacity={0.8}>
          <QRCodePlaceholder />
          <Text style={styles.qrCardHint}>Tap to enlarge · Scan with any camera app</Text>
        </TouchableOpacity>

        {/* ── Architecture summary ── */}
        <View style={styles.archCard}>
          <Text style={styles.archTitle}>How it works</Text>
          {[
            ["1", "QR scan or direct link opens the web app — no install needed"],
            ["2", "Unity C# logic compiled to WebAssembly (WebGL build)"],
            ["3", "WebXR Export replaces Unity's XR backend with browser WebXR API"],
            ["4", "GPS coordinates from browser Geolocation API sent to Unity via .jslib bridge"],
            ["5", "ARWaypointManager.cs places 3D prefabs at GPS-derived world positions"],
            ["6", "Tap any AR object to see price, brand info, and hunter notes"],
          ].map(([num, text]) => (
            <View key={num} style={styles.archStep}>
              <View style={styles.archNum}>
                <Text style={styles.archNumText}>{num}</Text>
              </View>
              <Text style={styles.archStepText}>{text}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── QR Modal ── */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setQrModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setQrModalVisible(false)}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Scan to open MapCask AR</Text>
            <QRCodePlaceholder />
            <Text style={styles.modalUrl}>{AR_LANDING_URL}</Text>
            <TouchableOpacity
              style={styles.btnOpen}
              onPress={() => { setQrModalVisible(false); openAR(); }}
            >
              <Text style={styles.btnOpenText}>Open on this device</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Architecture info modal ── */}
      <Modal
        visible={archInfoVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setArchInfoVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setArchInfoVisible(false)}
        >
          <View style={[styles.modalCard, { padding: 24 }]}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setArchInfoVisible(false)}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Architecture</Text>
            {[
              ["Unity Project", "Unity 2022.3 LTS with WebGL build target. C# AR logic, 3D prefabs, and GPS/compass MonoBehaviours."],
              ["WebXR Export", "De-Panther/unity-webxr-export replaces Unity's native XR backend with the browser WebXR Device API."],
              [".jslib Bridge", "WebXRBridge.jslib exposes GPS and DeviceOrientation to C# via DllImport. C# calls JS via SendMessage."],
              ["AR Foundation", "ARSession, ARRaycastManager, and ARAnchorManager run inside the WebXR frame loop."],
              ["GPS Placement", "Haversine distance + equirectangular GPS→metres offset, rotated by device heading into AR space."],
              ["Fallback Mode", "Browsers without WebXR (Safari/Firefox) use getUserMedia + Three.js overlay instead of the Unity renderer."],
            ].map(([title, desc]) => (
              <View key={title} style={styles.archInfoRow}>
                <Text style={styles.archInfoTitle}>{title}</Text>
                <Text style={styles.archInfoDesc}>{desc}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { color: Colors.textSecondary, fontSize: 15 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700" as const, color: Colors.text },
  headerSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  infoBtn: { padding: 4 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },

  // ── Hero
  heroCard: {
    backgroundColor: "#0C0A10",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(232,146,42,0.28)",
  },
  heroEmoji: { fontSize: 48 },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: "#E8922A",
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#8899AA",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  nearbyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(77,208,128,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(77,208,128,0.3)",
  },
  nearbyBadgeText: { fontSize: 13, fontWeight: "600" as const, color: "#4DD080" },
  btnLaunch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#E8922A",
    borderRadius: 50,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 4,
  },
  btnLaunchText: { fontSize: 16, fontWeight: "700" as const, color: "#fff" },
  heroNote: { fontSize: 11, color: "#5A6878", marginTop: -2 },

  // ── Tech row
  techRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  techBadge: {
    backgroundColor: "rgba(69,123,157,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(69,123,157,0.3)",
  },
  techBadgeText: { fontSize: 12, fontWeight: "600" as const, color: "#7EB8D4" },

  // ── Section header
  section: { marginTop: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "700" as const, color: Colors.text, marginBottom: 2 },
  sectionSubtitle: { fontSize: 12, color: Colors.textSecondary },

  // ── Waypoint cards
  waypointCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  waypointCardActive: {
    borderColor: "rgba(77,208,128,0.45)",
    backgroundColor: "rgba(77,208,128,0.05)",
  },
  waypointIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  waypointEmoji: { fontSize: 24 },
  waypointInfo: { flex: 1 },
  waypointName: { fontSize: 14, fontWeight: "600" as const, color: Colors.text },
  waypointSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  waypointRight: { alignItems: "flex-end", gap: 4 },
  waypointDist: { fontSize: 12, color: Colors.textSecondary },
  waypointDistNear: { color: "#4DD080", fontWeight: "600" as const },
  inRangeDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#4DD080",
  },

  // ── QR
  qrCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qrWrapper: { alignItems: "center", gap: 12 },
  qrInner: {
    width: 160,
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  qrFinder: {
    position: "absolute",
    width: 36,
    height: 36,
    borderWidth: 5,
    borderColor: "#111",
    borderRadius: 4,
  },
  qrCenter: { alignItems: "center", gap: 4 },
  qrEmoji: { fontSize: 28 },
  qrLabel: { fontSize: 11, fontWeight: "700" as const, color: "#111" },
  qrNote: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
    maxWidth: 280,
  },
  qrCardHint: { fontSize: 11, color: Colors.textSecondary },

  // ── Architecture card
  archCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    marginTop: 4,
  },
  archTitle: { fontSize: 15, fontWeight: "700" as const, color: Colors.text, marginBottom: 4 },
  archStep: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  archNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "rgba(232,146,42,0.18)",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  archNumText: { fontSize: 12, fontWeight: "800" as const, color: "#E8922A" },
  archStepText: { fontSize: 13, color: Colors.textSecondary, flex: 1, lineHeight: 18 },

  // ── Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalClose: { position: "absolute", top: 14, right: 14, zIndex: 1, padding: 4 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center",
    marginTop: 8,
  },
  modalUrl: { fontSize: 11, color: Colors.textSecondary, textAlign: "center" },
  btnOpen: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnOpenText: { fontSize: 15, fontWeight: "700" as const, color: "#fff" },

  archInfoRow: { gap: 2 },
  archInfoTitle: { fontSize: 13, fontWeight: "700" as const, color: Colors.accent },
  archInfoDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
});
