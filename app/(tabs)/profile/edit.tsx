import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { auth, usersCollection } from "../../../firebase/config";
import { getCurrentUser } from "../../../src/services/auth";
import { User, Goal, GoalType } from "../../../src/types";
import { Timestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

type Duration = "short" | "medium" | "long";

const COLORS = {
  primary: "#FF6B6B",
  primaryDark: "#E85D5D",
  primaryLight: "#FF8787",
  secondary: "#FFB84C",
  success: "#51CF66",
  background: "#FFF9F9",
  card: "#FFFFFF",
  text: "#2D3436",
  textSecondary: "#636E72",
  border: "#FFE5E5",
};

// Body type descriptions and icons
const bodyTypeInfo = {
  ectomorph: {
    icon: "body-outline",
    description: "Lean and long body type",
  },
  mesomorph: {
    icon: "fitness-outline",
    description: "Athletic and muscular body type",
  },
  endomorph: {
    icon: "body-outline",
    description: "Naturally bigger body type",
  },
};

// Goal type descriptions and icons
const goalTypeInfo = {
  weight: {
    icon: "scale-outline",
    description: "Weight management",
  },
  strength: {
    icon: "barbell-outline",
    description: "Build muscle and strength",
  },
  stamina: {
    icon: "pulse-outline",
    description: "Improve endurance",
  },
};

export default function EditProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyType, setBodyType] = useState<
    "ectomorph" | "mesomorph" | "endomorph" | ""
  >("");
  const [selectedGoalType, setSelectedGoalType] = useState<GoalType>("weight");
  const [selectedDuration, setSelectedDuration] = useState<Duration>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.replace("/(auth)/login");
        return;
      }
      setUser(currentUser);
      setHeight(currentUser.profile.height.toString());
      setWeight(currentUser.profile.weight.toString());
      setBodyType(currentUser.profile.bodyType || "");

      // Set initial goal values if they exist
      if (currentUser.goals && currentUser.goals.length > 0) {
        setSelectedGoalType(currentUser.goals[0].type);
        // You might want to convert the deadline to duration here
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Failed to load user data");
    }
  };

  const calculateBMI = (weight: number, height: number): number => {
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const handleSave = async () => {
    console.log("[Save] Starting save process");
    if (!validateInputs()) {
      console.log("[Save] Validation failed");
      return;
    }

    setLoading(true);
    try {
      console.log("[Save] Preparing data");
      setError("");

      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.log("[Save] No user ID found");
        throw new Error("No authenticated user found");
      }

      const heightNum = Number(height);
      const weightNum = Number(weight);
      const bmi = calculateBMI(weightNum, heightNum);
      console.log("[Save] BMI calculated:", bmi);

      // // Check if goal type has changed
      // if (selectedGoalType !== user?.goals?.[0]?.type) {
      //   console.log("[Save] Goal type changed, showing confirmation");
      //   const confirmed = await new Promise((resolve) => {
      //     Alert.alert(
      //       "Change Goal?",
      //       "Changing your goal will reset your current goal progress. Your workout history and achievements will be preserved, but the home page will focus on your new goal progress.\n\nAre you sure you want to continue?",
      //       [
      //         {
      //           text: "Cancel",
      //           style: "cancel",
      //           onPress: () => {
      //             console.log("[Save] Goal change cancelled");
      //             resolve(false);
      //           },
      //         },
      //         {
      //           text: "Continue",
      //           style: "destructive",
      //           onPress: () => {
      //             console.log("[Save] Goal change confirmed");
      //             resolve(true);
      //           },
      //         },
      //       ]
      //     );
      //   });

      //   console.log("[Save] Confirmation result:", confirmed);
      //   if (!confirmed) {
      //     console.log("[Save] Process cancelled by user");
      //     setLoading(false);
      //     return;
      //   }
      // }

      console.log("[Save] Preparing updates");
      const goal = selectedGoalType
        ? {
            type: selectedGoalType,
            target: 0,
            deadline: Timestamp.fromDate(
              new Date(Date.now() + getDurationInMs(selectedDuration))
            ),
          }
        : null;

      console.log("[Save] Constructed goal object:", goal);
      const updates = {
        "profile.height": heightNum,
        "profile.weight": weightNum,
        "profile.bmi": bmi,
        "profile.bodyType": bodyType,
        goals: goal ? [goal] : [],
        updatedAt: Timestamp.fromDate(new Date()),
      };
      console.log("[Save] Update payload prepared:", updates);

      console.log("[Save] Starting Firestore update");
      const userRef = doc(usersCollection, userId);
      await updateDoc(userRef, updates);
      console.log("[Save] Firestore update completed");

      console.log("[Save] Navigating back");
      router.back();
    } catch (err) {
      console.error("[Save] Error:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      console.log("[Save] Process completed");
      setLoading(false);
    }
  };

  const getDurationInMs = (duration: Duration): number => {
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    switch (duration) {
      case "short":
        return 4 * weekInMs; // 4 weeks
      case "medium":
        return 12 * weekInMs; // 12 weeks
      case "long":
        return 24 * weekInMs; // 24 weeks
      default:
        return 12 * weekInMs;
    }
  };

  const validateInputs = () => {
    if (height.trim() === "") {
      setError("Please enter a valid height in cm (100-250)");
      return false;
    }

    if (weight.trim() === "") {
      setError("Please enter a valid weight in kg (30-300)");
      return false;
    }

    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (heightNum < 100 || heightNum > 250) {
      setError("Please enter a valid height in cm (100-250)");
      return false;
    }

    if (weightNum < 30 || weightNum > 300) {
      setError("Please enter a valid weight in kg (30-300)");
      return false;
    }

    return true;
  };

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={styles.title}>Edit Profile</Text> */}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Physical Stats</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="Enter your height"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Enter your weight"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Body Type</Text>
          <View style={styles.bodyTypeContainer}>
            {(["ectomorph", "mesomorph", "endomorph"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.bodyTypeButton,
                  bodyType === type && styles.bodyTypeButtonSelected,
                ]}
                onPress={() => setBodyType(type)}
              >
                <Ionicons
                  name={
                    bodyTypeInfo[type].icon as keyof typeof Ionicons.glyphMap
                  }
                  size={24}
                  color={bodyType === type ? "#fff" : COLORS.primary}
                />
                <Text
                  style={[
                    styles.bodyTypeButtonText,
                    bodyType === type && styles.bodyTypeButtonTextSelected,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
                <Text style={styles.typeDescription}>
                  {bodyTypeInfo[type].description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Your Goal</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Goal Type</Text>
          <View style={styles.goalTypeContainer}>
            {(["weight", "strength", "stamina"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.goalTypeButton,
                  selectedGoalType === type && styles.goalTypeButtonSelected,
                ]}
                onPress={() => setSelectedGoalType(type)}
              >
                <Ionicons
                  name={
                    goalTypeInfo[type].icon as keyof typeof Ionicons.glyphMap
                  }
                  size={24}
                  color={selectedGoalType === type ? "#fff" : COLORS.primary}
                />
                <Text
                  style={[
                    styles.goalTypeButtonText,
                    selectedGoalType === type &&
                      styles.goalTypeButtonTextSelected,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
                <Text style={styles.typeDescription}>
                  {goalTypeInfo[type].description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Program Duration</Text>
          <View style={styles.durationContainer}>
            {(["short", "medium", "long"] as const).map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationButton,
                  selectedDuration === duration &&
                    styles.durationButtonSelected,
                ]}
                onPress={() => setSelectedDuration(duration)}
              >
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={
                    selectedDuration === duration ? "#fff" : COLORS.primary
                  }
                />
                <Text
                  style={[
                    styles.durationButtonText,
                    selectedDuration === duration &&
                      styles.durationButtonTextSelected,
                  ]}
                >
                  {duration === "short"
                    ? "4 weeks"
                    : duration === "medium"
                    ? "12 weeks"
                    : "24 weeks"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  bodyTypeContainer: {
    flexDirection: "column",
    gap: 10,
  },
  bodyTypeButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bodyTypeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bodyTypeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
  },
  bodyTypeButtonTextSelected: {
    color: COLORS.card,
  },
  goalTypeContainer: {
    flexDirection: "column",
    gap: 10,
  },
  goalTypeButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  goalTypeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalTypeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
  },
  goalTypeButtonTextSelected: {
    color: COLORS.card,
  },
  typeDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: "auto",
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  durationButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    height: 60,
  },
  durationButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "500",
  },
  durationButtonTextSelected: {
    color: COLORS.card,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  saveButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#e74c3c",
    marginBottom: 15,
    textAlign: "center",
  },
});
