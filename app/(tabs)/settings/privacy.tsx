import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function PrivacyScreen() {
  const [shareProgress, setShareProgress] = useState(false);
  const [shareWorkouts, setShareWorkouts] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const router = useRouter();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement account deletion
            console.log("Account deletion requested");
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Sharing</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Share Progress</Text>
          <Switch
            value={shareProgress}
            onValueChange={setShareProgress}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={shareProgress ? "#007AFF" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Share Workouts</Text>
          <Switch
            value={shareWorkouts}
            onValueChange={setShareWorkouts}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={shareWorkouts ? "#007AFF" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analytics</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Usage Analytics</Text>
          <Switch
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={analyticsEnabled ? "#007AFF" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("./data-export")}
        >
          <Text style={styles.buttonText}>Export My Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        Your privacy is important to us. Control how your data is used and
        shared. You can request a copy of your data or delete your account at
        any time.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  settingLabel: {
    fontSize: 16,
  },
  button: {
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  deleteButton: {
    backgroundColor: "#fff0f0",
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#ff3b30",
  },
  description: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});
