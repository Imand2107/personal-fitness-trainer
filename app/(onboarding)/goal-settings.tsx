import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { updateUserProfile, getCurrentUser } from "../../src/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/Colors";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { usersCollection } from "../../firebase/config";
import { GoalType } from "../../src/types/workout";

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
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
    workouts: string[];
  }[] = [
    {
      type: "weight",
      title: "Weight Management",
      icon: "barbell",
      description:
        "High-intensity workouts designed for effective weight management and fat burning",
      workouts: ["Weight Loss HIIT", "Fat Burning Circuit"],
    },
    {
      type: "strength",
      title: "Build Strength",
      icon: "fitness",
      description:
        "Progressive resistance training to build muscle and increase strength",
      workouts: ["Strength Training", "Muscle Building"],
    },
    {
      type: "stamina",
      title: "Improve Stamina",
      icon: "pulse",
      description:
        "Endurance-focused workouts to boost cardiovascular fitness and stamina",
      workouts: ["Cardio Endurance", "HIIT Circuit"],
    },
  ];

  const bodyTypes: {
    type: BodyType;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
  }[] = [
    {
      type: "ectomorph",
      title: "Ectomorph",
      icon: "body",
      description: "Naturally lean and find it hard to gain weight",
    },
    {
      type: "mesomorph",
      title: "Mesomorph",
      icon: "body",
      description: "Athletic build and respond well to exercise",
    },
    {
      type: "endomorph",
      title: "Endomorph",
      icon: "body",
      description: "Naturally broad and find it hard to lose weight",
    },
  ];

  const durations: {
    type: Duration;
    title: string;
    description: string;
    weeks: number;
  }[] = [
    {
      type: "short",
      title: "4 Weeks",
      description: "Quick start program for immediate results",
      weeks: 4,
    },
    {
      type: "medium",
      title: "8 Weeks",
      description: "Balanced program for steady progress",
      weeks: 8,
    },
    {
      type: "long",
      title: "12 Weeks",
      description: "Comprehensive program for lasting change",
      weeks: 12,
    },
  ];

  const getDurationInMs = (duration: Duration): number => {
    switch (duration) {
      case "short":
        return 4 * 7 * 24 * 60 * 60 * 1000; // 4 weeks
      case "medium":
        return 8 * 7 * 24 * 60 * 60 * 1000; // 8 weeks
      case "long":
        return 12 * 7 * 24 * 60 * 60 * 1000; // 12 weeks
      default:
        return 8 * 7 * 24 * 60 * 60 * 1000; // Default to 8 weeks
    }
  };

  const handleNext = async () => {
    if (!selectedGoal || !selectedBodyType || !selectedDuration) {
      setError("Please select all options to continue");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error("No authenticated user found");
      }

      const { profile } = currentUser;

      // Update user profile with body type
      await updateUserProfile({
        ...profile,
        bodyType: selectedBodyType,
      });

      // Set goal with deadline based on selected duration
      const deadline = new Date(Date.now() + getDurationInMs(selectedDuration));
      await updateDoc(doc(usersCollection, currentUser.uid), {
        goals: [
          {
            type: selectedGoal,
            target: 0, // This will be customized based on the goal type
            deadline: Timestamp.fromDate(deadline),
          },
        ],
      });

      router.push("/(onboarding)/exercise-setup");
    } catch (err) {
      setError("Failed to save your preferences. Please try again.");
      console.error("Goal settings error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            <Text style={styles.backButtonText}>BMI Setup</Text>
          </TouchableOpacity>
          <View style={styles.progressIndicator}>
            <View style={[styles.progressDot, styles.progressDotCompleted]} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
          </View>
        </View>

        <View style={styles.content}>
          <Ionicons name="trophy-outline" size={60} color={COLORS.primary} />
          <Text style={styles.title}>Set Your Goals</Text>
          <Text style={styles.subtitle}>
            Choose your fitness goals and preferences
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your main goal?</Text>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.type}
              style={[
                styles.card,
                selectedGoal === goal.type && styles.cardSelected,
              ]}
              onPress={() => setSelectedGoal(goal.type)}
            >
              <View style={styles.cardIcon}>
                <Ionicons
                  name={goal.icon}
                  size={28}
                  color={
                    selectedGoal === goal.type ? COLORS.card : COLORS.primary
                  }
                />
              </View>
              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.cardTitle,
                    selectedGoal === goal.type && styles.cardTitleSelected,
                  ]}
                >
                  {goal.title}
                </Text>
                <Text
                  style={[
                    styles.cardDescription,
                    selectedGoal === goal.type &&
                      styles.cardDescriptionSelected,
                  ]}
                >
                  {goal.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your body type?</Text>
          {bodyTypes.map((type) => (
            <TouchableOpacity
              key={type.type}
              style={[
                styles.card,
                selectedBodyType === type.type && styles.cardSelected,
              ]}
              onPress={() => setSelectedBodyType(type.type)}
            >
              <View style={styles.cardIcon}>
                <Ionicons
                  name={type.icon}
                  size={28}
                  color={
                    selectedBodyType === type.type
                      ? COLORS.card
                      : COLORS.primary
                  }
                />
              </View>
              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.cardTitle,
                    selectedBodyType === type.type && styles.cardTitleSelected,
                  ]}
                >
                  {type.title}
                </Text>
                <Text
                  style={[
                    styles.cardDescription,
                    selectedBodyType === type.type &&
                      styles.cardDescriptionSelected,
                  ]}
                >
                  {type.description}
                </Text>
              </View>
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
                  selectedDuration === duration.type &&
                    styles.durationCardSelected,
                ]}
                onPress={() => setSelectedDuration(duration.type)}
              >
                <Text
                  style={[
                    styles.durationTitle,
                    selectedDuration === duration.type &&
                      styles.durationTitleSelected,
                  ]}
                >
                  {duration.title}
                </Text>
                <Text
                  style={[
                    styles.durationDescription,
                    selectedDuration === duration.type &&
                      styles.durationDescriptionSelected,
                  ]}
                >
                  {duration.description}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backButtonText: {
    color: COLORS.primary,
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
    backgroundColor: COLORS.border,
  },
  progressDotCompleted: {
    backgroundColor: COLORS.success,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  content: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: COLORS.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: COLORS.text,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: COLORS.text,
  },
  cardTitleSelected: {
    color: COLORS.card,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cardDescriptionSelected: {
    color: `${COLORS.card}CC`,
  },
  durationContainer: {
    flexDirection: "row",
    gap: 8,
  },
  durationCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  durationCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: COLORS.text,
  },
  durationTitleSelected: {
    color: COLORS.card,
  },
  durationDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  durationDescriptionSelected: {
    color: `${COLORS.card}CC`,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: Platform.OS === "ios" ? 0 : 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    color: COLORS.error,
    marginHorizontal: 20,
    marginBottom: 20,
    textAlign: "center",
  },
});
