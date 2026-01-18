import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  Menu,
  X,
  Map,
  Compass,
  PlusCircle,
  Users,
  MessageCircle,
  User,
  Shield,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  route: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useApp();

  const menuItems: MenuItem[] = [
    {
      label: "Map",
      icon: <Map size={24} color={Colors.textSecondary} />,
      route: "/",
    },
    {
      label: "Discover",
      icon: <Compass size={24} color={Colors.textSecondary} />,
      route: "/discover",
    },
    {
      label: "Add Find",
      icon: <PlusCircle size={24} color={Colors.textSecondary} />,
      route: "/add",
      requiresAuth: true,
    },
    {
      label: "Friends",
      icon: <Users size={24} color={Colors.textSecondary} />,
      route: "/friends",
      requiresAuth: true,
    },
    {
      label: "Messages",
      icon: <MessageCircle size={24} color={Colors.textSecondary} />,
      route: "/messages",
      requiresAuth: true,
    },
    {
      label: "Profile",
      icon: <User size={24} color={Colors.textSecondary} />,
      route: "/profile",
    },
    {
      label: "Admin",
      icon: <Shield size={24} color={Colors.textSecondary} />,
      route: "/admin",
      adminOnly: true,
    },
  ];

  const openDrawer = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
    });
  };

  const handleNavigation = (route: string) => {
    closeDrawer();
    setTimeout(() => {
      router.push(route as any);
    }, 250);
  };

  const isActiveRoute = (route: string): boolean => {
    if (route === "/") {
      return pathname === "/" || pathname === "/(tabs)";
    }
    return pathname.includes(route);
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.requiresAuth && !user) return false;
    if (item.adminOnly && user?.email !== "admin@mapcask.com") return false;
    return true;
  });

  return (
    <>
      <TouchableOpacity
        onPress={openDrawer}
        style={styles.hamburgerButton}
        activeOpacity={0.7}
      >
        <Menu size={24} color={Colors.text} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View
              style={[
                styles.overlay,
                {
                  opacity: fadeAnim,
                },
              ]}
            />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>MapCask</Text>
              <TouchableOpacity
                onPress={closeDrawer}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {user && (
              <View style={styles.userSection}>
                <View style={styles.userAvatar}>
                  <User size={32} color={Colors.textSecondary} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.menuItems}>
              {filteredMenuItems.map((item, index) => {
                const isActive = isActiveRoute(item.route);
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleNavigation(item.route)}
                    style={[
                      styles.menuItem,
                      isActive && styles.menuItemActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    {item.icon}
                    <Text
                      style={[
                        styles.menuItemText,
                        isActive && styles.menuItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.drawerFooter}>
              <Text style={styles.footerText}>MapCask v1.0</Text>
              <Text style={styles.footerSubtext}>For Bourbon Hunters</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  hamburgerButton: {
    padding: 8,
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  menuItems: {
    flex: 1,
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItemActive: {
    backgroundColor: Colors.surfaceLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  menuItemTextActive: {
    color: Colors.text,
    fontWeight: "600" as const,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footerSubtext: {
    fontSize: 11,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
});
