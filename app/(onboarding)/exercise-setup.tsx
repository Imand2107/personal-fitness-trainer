import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { auth, usersCollection } from "../../firebase/config";
import { Ionicons } from "@expo/vector-icons";

interface Exercise {
  id: string;
  name: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  equipment: string[];
  muscles: string[];
}

const sampleExercises: Exercise[] = [
  {
    id: "1",
    name: "Push-ups",
    category: "Strength",
    difficulty: "beginner",
    equipment: ["none"],
    muscles: ["chest", "shoulders", "triceps"],
  },
  {
    id: "2",
    name: "Squats",
    category: "Strength",
    difficulty: "beginner",
    equipment: ["none"],
    muscles: ["quadriceps", "hamstrings", "glutes"],
  },
  {
    id: "3",
    name: "Plank",
    category: "Core",
    difficulty: "beginner",
    equipment: ["none"],
    muscles: ["core", "shoulders"],
  },
  // Add more exercises as needed
];

export default function ExerciseSetupScreen() {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleComplete = async () => {
    if (selectedExercises.length < 3) {
      setError("Please select at least 3 exercises");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("No authenticated user found");
      }

      const exercises = sampleExercises.filter((ex) =>
        selectedExercises.includes(ex.id)
      );

      await updateDoc(doc(usersCollection, userId), {
        "profile.onboardingCompleted": true,
        selectedExercises: exercises,
      });

      router.replace("/(tabs)");
    } catch (err) {
      console.error("Error saving exercise preferences:", err);
      setError("Failed to save your preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Customize Your Workout</Text>
      <Text style={styles.subtitle}>
        Select exercises that match your fitness level and goals
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.exerciseList}>
        {sampleExercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={[
              styles.exerciseCard,
              selectedExercises.includes(exercise.id) && styles.selectedCard,
            ]}
            onPress={() => toggleExercise(exercise.id)}
          >
            <View style={styles.exerciseHeader}>
              <View>
                <Text
                  style={[
                    styles.exerciseName,
                    selectedExercises.includes(exercise.id) &&
                      styles.selectedText,
                  ]}
                >
                  {exercise.name}
                </Text>
                <Text
                  style={[
                    styles.exerciseCategory,
                    selectedExercises.includes(exercise.id) &&
                      styles.selectedText,
                  ]}
                >
                  {exercise.category}
                </Text>
              </View>
              {selectedExercises.includes(exercise.id) && (
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
              )}
            </View>

            <View style={styles.exerciseDetails}>
              <View style={styles.detailItem}>
                <Text
                  style={[
                    styles.detailLabel,
                    selectedExercises.includes(exercise.id) &&
                      styles.selectedText,
                  ]}
                >
                  Difficulty:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    selectedExercises.includes(exercise.id) &&
                      styles.selectedText,
                  ]}
                >
                  {exercise.difficulty}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text
                  style={[
                    styles.detailLabel,
                    selectedExercises.includes(exercise.id) &&
                      styles.selectedText,
                  ]}
                >
                  Equipment:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    selectedExercises.includes(exercise.id) &&
                      styles.selectedText,
                  ]}
                >
                  {exercise.equipment.join(", ")}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text
                  style={[
                    styles.detailLabel,
                    selectedExercises.includes(exercise.id) &&
                      styles.selectedText,
                  ]}
                >
                  Muscles:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    selectedExercises.includes(exercise.id) &&
                      styles.selectedText,
                  ]}
                >
                  {exercise.muscles.join(", ")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleComplete}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Complete Setup"}
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
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  exerciseList: {
    marginBottom: 20,
  },
  exerciseCard: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedCard: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 14,
    color: "#666",
  },
  exerciseDetails: {
    marginTop: 10,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginRight: 5,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
  },
  selectedText: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  error: {
    color: "#e74c3c",
    marginBottom: 20,
    textAlign: "center",
  },
});
