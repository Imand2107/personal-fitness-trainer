import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { Ionicons } from "@expo/vector-icons";
import { commonExercises } from "../../assets/data/workouts";
import { Exercise, GoalType } from "../../src/types/workout";
import { useAuth } from "../../src/hooks/useAuth";

// Helper function to get exercise image
const getExerciseImage = (exerciseId: string) => {
  const imageMap: { [key: string]: any } = {
    jumping_jacks: require("../../assets/images/exercises/jumping-jacks.gif"),
    high_knees: require("../../assets/images/exercises/high-knees.gif"),
    mountain_climbers: require("../../assets/images/exercises/mountain-climbers.gif"),
    pushups: require("../../assets/images/exercises/pushup.gif"),
    wide_arm_pushups: require("../../assets/images/exercises/wide-arm-push-up.gif"),
    diamond_pushups: require("../../assets/images/exercises/Diamond_Push-Up.gif"),
    plank: require("../../assets/images/exercises/plank.jpg"),
    russian_twist: require("../../assets/images/exercises/russian-twist.gif"),
    leg_raises: require("../../assets/images/exercises/leg-raises.gif"),
    squats: require("../../assets/images/exercises/squats.gif"),
    lunges: require("../../assets/images/exercises/lunges.gif"),
    burpees: require("../../assets/images/exercises/burpee.webp"),
  };

  return (
    imageMap[exerciseId] || require("../../assets/images/exercises/plank.jpg")
  ); // Default image
};

export default function ExerciseSetupScreen() {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const [userGoal, setUserGoal] = useState<GoalType>("weight");

  useEffect(() => {
    // Fetch user's goal from Firestore
    const fetchUserGoal = async () => {
      if (!user) return;
      // Add logic to fetch user's goal from Firestore
    };
    fetchUserGoal();
  }, [user]);

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

  const handleNext = async () => {
    if (selectedExercises.length < 3) {
      setError("Please select at least 3 exercises");
      return;
    }

    setLoading(true);
    try {
      if (!user) throw new Error("No user found");

      await updateDoc(doc(db, "users", user.uid), {
        selectedExercises,
        onboardingCompleted: true,
      });

      router.replace("/(tabs)");
    } catch (err) {
      setError("Failed to save exercises. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recommendedExercises = getRecommendedExercises();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
          <Text style={styles.backButtonText}>Goals</Text>
        </TouchableOpacity>
        <View style={styles.progressIndicator}>
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        <Text style={styles.title}>Customize Your Workout</Text>
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
          onPress={handleNext}
          disabled={selectedExercises.length < 3 || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Complete Setup"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
    marginLeft: 4,
  },
  progressIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  progressDotCompleted: {
    backgroundColor: "#4CAF50",
  },
  progressDotActive: {
    backgroundColor: "#2196f3",
  },
  scrollContent: {
    flex: 1,
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
  exercisesGrid: {
    gap: 16,
  },
  exerciseCard: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedCard: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
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
    color: "#333",
  },
  exerciseDetail: {
    fontSize: 14,
    color: "#666",
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
    color: "#fff",
    backgroundColor: "#9e9e9e",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tips: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  button: {
    backgroundColor: "#2196f3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: "#bdbdbd",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#f44336",
    marginBottom: 20,
    textAlign: "center",
  },
});
