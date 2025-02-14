import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";

export default function DataExportScreen() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement actual data export logic
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated delay
      console.log("Data export requested");
      // Show success message or handle the exported data
    } catch (error) {
      console.error("Error exporting data:", error);
      // Show error message
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Export Data",
          headerShown: true,
        }}
      />

      <Text style={styles.title}>Export Your Data</Text>

      <Text style={styles.description}>
        You can download a copy of all your personal data, including:
      </Text>

      <View style={styles.dataList}>
        <Text style={styles.dataItem}>• Profile information</Text>
        <Text style={styles.dataItem}>• Workout history</Text>
        <Text style={styles.dataItem}>• Progress tracking data</Text>
        <Text style={styles.dataItem}>• Goals and achievements</Text>
        <Text style={styles.dataItem}>• App settings</Text>
      </View>

      <Text style={styles.note}>
        The export process may take a few minutes depending on the amount of
        data. You'll receive the data in a downloadable format.
      </Text>

      <TouchableOpacity
        style={[styles.button, isExporting && styles.buttonDisabled]}
        onPress={handleExport}
        disabled={isExporting}
      >
        {isExporting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={[styles.buttonText, { marginLeft: 8 }]}>
              Exporting...
            </Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Start Export</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000000",
  },
  description: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
    lineHeight: 22,
  },
  dataList: {
    marginBottom: 24,
  },
  dataItem: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 8,
    lineHeight: 22,
  },
  note: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
    marginBottom: 32,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#A8A8A8",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
