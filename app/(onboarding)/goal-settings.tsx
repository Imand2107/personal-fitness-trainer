import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { auth, usersCollection } from "../../firebase/config";
import { Ionicons } from "@expo/vector-icons";

type GoalType = "weight" | "strength" | "stamina";
type BodyType = "ectomorph" | "mesomorph" | "endomorph";
type Duration = "short" | "medium" | "long";

interface Goal {
  type: GoalType;
  duration: Duration;
}

export default function GoalSettingsScreen() {
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType | null>(
    null
  );
  const [selectedDuration, setSelectedDuration] = useState<Duration | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const goals: {
    type: GoalType;
    title: string;
    icon: string;
    description: string;
  }[] = [
    {
      type: "weight",
      title: "Weight Management",
      icon: "barbell-outline",
      description:
        "Focus on achieving your ideal weight through balanced workouts",
    },
    {
      type: "strength",
      title: "Build Strength",
      icon: "fitness-outline",
      description: "Develop muscle strength and improve overall power",
    },
    {
      type: "stamina",
      title: "Increase Stamina",
      icon: "pulse-outline",
      description: "Enhance your endurance and cardiovascular fitness",
    },
  ];

  const bodyTypes: { type: BodyType; title: string; description: string }[] = [
    {
      type: "ectomorph",
      title: "Ectomorph",
      description: "Lean and long, difficulty gaining weight",
    },
    {
      type: "mesomorph",
      title: "Mesomorph",
      description: "Athletic and muscular, easy to gain/lose weight",
    },
    {
      type: "endomorph",
      title: "Endomorph",
      description: "Naturally bigger, difficulty losing weight",
    },
  ];

  const durations: { type: Duration; title: string; weeks: number }[] = [
    { type: "short", title: "Short Term", weeks: 4 },
    { type: "medium", title: "Medium Term", weeks: 12 },
    { type: "long", title: "Long Term", weeks: 24 },
  ];

  const handleNext = async () => {
    if (!selectedGoal || !selectedBodyType || !selectedDuration) {
      setError("Please make all selections to continue");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("No authenticated user found");
      }

      const goal: Goal = {
        type: selectedGoal,
        duration: selectedDuration,
      };

      await updateDoc(doc(usersCollection, userId), {
        "profile.bodyType": selectedBodyType,
        goals: [goal],
      });

      router.push("./exercise-setup");
    } catch (err) {
      console.error("Error saving goals:", err);
      setError("Failed to save your goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Set Your Fitness Goals</Text>
      <Text style={styles.subtitle}>
        Let's customize your fitness journey based on your goals
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Primary Goal</Text>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.type}
            style={[
              styles.card,
              selectedGoal === goal.type && styles.selectedCard,
            ]}
            onPress={() => setSelectedGoal(goal.type)}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name={goal.icon as any}
                size={24}
                color={selectedGoal === goal.type ? "#fff" : "#007AFF"}
              />
              <Text
                style={[
                  styles.cardTitle,
                  selectedGoal === goal.type && styles.selectedText,
                ]}
              >
                {goal.title}
              </Text>
            </View>
            <Text
              style={[
                styles.cardDescription,
                selectedGoal === goal.type && styles.selectedText,
              ]}
            >
              {goal.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Body Type</Text>
        {bodyTypes.map((type) => (
          <TouchableOpacity
            key={type.type}
            style={[
              styles.card,
              selectedBodyType === type.type && styles.selectedCard,
            ]}
            onPress={() => setSelectedBodyType(type.type)}
          >
            <Text
              style={[
                styles.cardTitle,
                selectedBodyType === type.type && styles.selectedText,
              ]}
            >
              {type.title}
            </Text>
            <Text
              style={[
                styles.cardDescription,
                selectedBodyType === type.type && styles.selectedText,
              ]}
            >
              {type.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Program Duration</Text>
        <View style={styles.durationContainer}>
          {durations.map((duration) => (
            <TouchableOpacity
              key={duration.type}
              style={[
                styles.durationCard,
                selectedDuration === duration.type && styles.selectedCard,
              ]}
              onPress={() => setSelectedDuration(duration.type)}
            >
              <Text
                style={[
                  styles.durationTitle,
                  selectedDuration === duration.type && styles.selectedText,
                ]}
              >
                {duration.title}
              </Text>
              <Text
                style={[
                  styles.durationWeeks,
                  selectedDuration === duration.type && styles.selectedText,
                ]}
              >
                {duration.weeks} weeks
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Continue"}
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  card: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedCard: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
  },
  selectedText: {
    color: "#fff",
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  durationCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  durationTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  durationWeeks: {
    fontSize: 12,
    color: "#666",
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
