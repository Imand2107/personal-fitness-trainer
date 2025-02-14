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
import { User, Goal } from "../../../src/types";
import { Timestamp } from "firebase/firestore";

export default function EditProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyType, setBodyType] = useState<
    "ectomorph" | "mesomorph" | "endomorph" | ""
  >("");
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

      const updates = {
        profile: {
          ...user.profile,
          height: heightNum,
          weight: weightNum,
          bmi: bmi,
          bodyType: bodyType || user.profile.bodyType,
        },
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
