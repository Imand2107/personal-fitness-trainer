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

type Duration = "short" | "medium" | "long";

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
    if (!user) return;

    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (heightNum < 100 || heightNum > 250) {
      setError("Please enter a valid height in cm (100-250)");
      return;
    }

    if (weightNum < 30 || weightNum > 300) {
      setError("Please enter a valid weight in kg (30-300)");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("No authenticated user found");

      const bmi = calculateBMI(weightNum, heightNum);

      // Create new goal object
      const newGoal: Goal = {
        type: selectedGoalType,
        target: 0, // You might want to add a target input field
        deadline: Timestamp.fromDate(
          new Date(Date.now() + getDurationInMs(selectedDuration))
        ),
      };

      const updates = {
        profile: {
          ...user.profile,
          height: heightNum,
          weight: weightNum,
          bmi: bmi,
          bodyType: bodyType || user.profile.bodyType,
        },
        goals: [newGoal], // Replace existing goals with new goal
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(usersCollection, userId), updates);
      router.back();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

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
                <Text
                  style={[
                    styles.bodyTypeButtonText,
                    bodyType === type && styles.bodyTypeButtonTextSelected,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
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
                <Text
                  style={[
                    styles.goalTypeButtonText,
                    selectedGoalType === type &&
                      styles.goalTypeButtonTextSelected,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
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
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bodyTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
    alignItems: "center",
  },
  bodyTypeButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  bodyTypeButtonText: {
    color: "#333",
    fontSize: 14,
  },
  bodyTypeButtonTextSelected: {
    color: "#fff",
  },
  goalTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
    alignItems: "center",
  },
  goalTypeButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  goalTypeButtonText: {
    color: "#333",
    fontSize: 14,
  },
  goalTypeButtonTextSelected: {
    color: "#fff",
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  durationButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
    alignItems: "center",
  },
  durationButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  durationButtonText: {
    color: "#333",
    fontSize: 14,
  },
  durationButtonTextSelected: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#e74c3c",
    marginBottom: 15,
    textAlign: "center",
  },
});
