import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { auth, usersCollection } from "../../../firebase/config";
import { Ionicons } from "@expo/vector-icons";
import { commonExercises } from "../../../assets/data/workouts";
import { Exercise, GoalType } from "../../../src/types";
import { getCurrentUser } from "../../../src/services/auth";

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

// Helper function to get exercise image
const getExerciseImage = (exerciseId: string) => {
  const imageMap: { [key: string]: any } = {
    jumping_jacks: require("../../../assets/images/exercises/jumping-jacks.gif"),
    high_knees: require("../../../assets/images/exercises/high-knees.gif"),
    mountain_climbers: require("../../../assets/images/exercises/mountain-climbers.gif"),
    pushups: require("../../../assets/images/exercises/pushup.gif"),
    wide_arm_pushups: require("../../../assets/images/exercises/wide-arm-push-up.gif"),
    diamond_pushups: require("../../../assets/images/exercises/Diamond_Push-Up.gif"),
    plank: require("../../../assets/images/exercises/plank.jpg"),
    russian_twist: require("../../../assets/images/exercises/russian-twist.gif"),
    leg_raises: require("../../../assets/images/exercises/leg-raises.gif"),
    squats: require("../../../assets/images/exercises/squats.gif"),
    lunges: require("../../../assets/images/exercises/lunges.gif"),
    burpees: require("../../../assets/images/exercises/burpee.webp"),
  };

  return (
    imageMap[exerciseId] ||
    require("../../../assets/images/exercises/plank.jpg")
  );
};

export default function WorkoutSettingsScreen() {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userGoal, setUserGoal] = useState<GoalType>("weight");
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

      // Set user's goal
      if (currentUser.goals && currentUser.goals.length > 0) {
        setUserGoal(currentUser.goals[0].type);
      }

      // Set selected exercises if they exist
      if (currentUser.selectedExercises) {
        setSelectedExercises(currentUser.selectedExercises);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Failed to load user data");
    }
  };

  const getRecommendedExercises = () => {
    const exercises = Object.values(commonExercises);

    switch (userGoal) {
      case "weight":
        return exercises.filter(
          (exercise) =>
            exercise.targetMuscles.includes("cardio") ||
            exercise.difficulty === "beginner" ||
            exercise.targetMuscles.includes("full_body")
        );
      case "strength":
        return exercises.filter(
          (exercise) =>
            (exercise.sets && exercise.reps) ||
            exercise.targetMuscles.some((muscle) =>
              [
                "chest",
                "shoulders",
                "triceps",
                "quadriceps",
                "hamstrings",
                "glutes",
              ].includes(muscle)
            )
        );
      case "stamina":
        return exercises.filter(
          (exercise) =>
            exercise.targetMuscles.includes("cardio") ||
            exercise.targetMuscles.includes("full_body") ||
            exercise.duration >= 30
        );
      default:
        return exercises;
    }
  };

  const handleExerciseToggle = (exerciseId: string) => {
    setSelectedExercises((prev) => {
      if (prev.includes(exerciseId)) {
        return prev.filter((id) => id !== exerciseId);
      }
      return [...prev, exerciseId];
    });
  };

  const handleSave = async () => {
    if (selectedExercises.length < 3) {
      setError("Please select at least 3 exercises");
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("No authenticated user found");

      await updateDoc(doc(usersCollection, userId), {
        selectedExercises,
        updatedAt: new Date(),
      });

      Alert.alert(
        "Success",
        "Your exercise preferences have been saved. Your workouts will now be customized based on your selections.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err) {
      console.error("Error saving exercises:", err);
      setError("Failed to save exercises. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const recommendedExercises = getRecommendedExercises();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Customize Your Workouts</Text>
      <Text style={styles.subtitle}>
        Select exercises that match your fitness level and preferences.
        {"\n"}Choose at least 3 exercises to continue.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.exercisesGrid}>
        {recommendedExercises.map((exercise: Exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={[
              styles.exerciseCard,
              selectedExercises.includes(exercise.id) && styles.selectedCard,
            ]}
            onPress={() => handleExerciseToggle(exercise.id)}
          >
            <Image
              source={getExerciseImage(exercise.id)}
              style={styles.exerciseImage}
              resizeMode="cover"
            />
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseDetail}>
                {exercise.duration}s • {exercise.difficulty}
              </Text>
              <View style={styles.targetMuscles}>
                {exercise.targetMuscles.map((muscle, index) => (
                  <Text key={index} style={styles.muscle}>
                    {muscle}
                  </Text>
                ))}
              </View>
              {exercise.tips.length > 0 && (
                <Text style={styles.tips}>Tip: {exercise.tips[0]}</Text>
              )}
            </View>
            {selectedExercises.includes(exercise.id) && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          (selectedExercises.length < 3 || loading) && styles.buttonDisabled,
        ]}
        onPress={handleSave}
        disabled={selectedExercises.length < 3 || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Save Preferences"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 30,
    textAlign: "center",
  },
  exercisesGrid: {
    gap: 16,
  },
  exerciseCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: "#e3f2fd",
    borderColor: COLORS.primary,
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: COLORS.text,
  },
  exerciseDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  targetMuscles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  muscle: {
    fontSize: 12,
    color: COLORS.card,
    backgroundColor: COLORS.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tips: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  buttonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#e74c3c",
    marginBottom: 20,
    textAlign: "center",
  },
});
