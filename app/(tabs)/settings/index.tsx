import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { logoutUser } from "../../../src/services/auth";
import { COLORS } from "../../../constants/Colors";

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your app experience</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("./notifications")}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>Notifications</Text>
              <Text style={styles.menuItemSubtitle}>
                Manage your alerts and reminders
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("./privacy")}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="shield-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>Privacy</Text>
              <Text style={styles.menuItemSubtitle}>
                Control your data and permissions
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("./about")}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>About</Text>
              <Text style={styles.menuItemSubtitle}>
                App information and version
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("./help")}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>Help & Support</Text>
              <Text style={styles.menuItemSubtitle}>
                Get assistance and FAQs
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={COLORS.card} />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.card,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.card,
    opacity: 0.8,
  },
  section: {
    marginTop: 20,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: "600",
  },
});
