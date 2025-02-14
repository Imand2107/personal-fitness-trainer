import React, { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default function NotificationsScreen() {
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [progressReminders, setProgressReminders] = useState(true);
  const [goalAlerts, setGoalAlerts] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Workout Reminders</Text>
          <Switch
            value={workoutReminders}
            onValueChange={setWorkoutReminders}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={workoutReminders ? "#007AFF" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Progress Reminders</Text>
          <Switch
            value={progressReminders}
            onValueChange={setProgressReminders}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={progressReminders ? "#007AFF" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Goal Alerts</Text>
          <Switch
            value={goalAlerts}
            onValueChange={setGoalAlerts}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={goalAlerts ? "#007AFF" : "#f4f3f4"}
          />
        </View>
      </View>

      <Text style={styles.description}>
        Control which notifications you want to receive. You can change these
        settings at any time.
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
  description: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});
