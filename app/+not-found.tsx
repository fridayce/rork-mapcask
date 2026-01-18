import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { MapPin } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <MapPin size={64} color={Colors.textSecondary} />
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.subtitle}>
          Looks like you&apos;ve wandered off the bourbon trail
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return to Map</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: Colors.background,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  link: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
});
