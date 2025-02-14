import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentUser } from "../../src/services/auth";
import { getUserWorkouts } from "../../src/services/workout";
import { getLatestProgress } from "../../src/services/progress";
import { User, Workout, Progress, GoalType } from "../../src/types";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#FF6B6B", // Warm red
  primaryDark: "#E85D5D", // Darker shade of primary
  primaryLight: "#FF8787", // Lighter shade of primary
  secondary: "#FFB84C", // Warm orange for accents
  success: "#51CF66", // Green for completed states
  background: "#FFF9F9", // Slightly warm white
  card: "#FFFFFF",
  text: "#2D3436",
  textSecondary: "#636E72",
  border: "#FFE5E5",
  divider: "#FFE5E5",
};

interface AchievementCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  date: string;
}

const AchievementCard = ({
  title,
  description,
  icon,
  date,
}: AchievementCardProps) => (
  <View style={styles.achievementCard}>
    <View style={styles.achievementIcon}>
      <Ionicons name={icon} size={24} color={COLORS.secondary} />
    </View>
    <View style={styles.achievementInfo}>
      <Text style={styles.achievementTitle}>{title}</Text>
      <Text style={styles.achievementDescription}>{description}</Text>
      <Text style={styles.achievementDate}>{date}</Text>
    </View>
  </View>
);

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [latestProgress, setLatestProgress] = useState<{
    [key in GoalType]?: Progress;
  }>({});
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Progress[]>([]);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.replace("/(auth)/login");
        return;
      }

      setUser(currentUser);

      // Load recent workouts and calculate streak
      const workouts = await getUserWorkouts(currentUser.uid);
      setRecentWorkouts(workouts.slice(0, 3));

      // Calculate streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sortedWorkouts = workouts
        .filter((w) => w.completed)
        .sort((a, b) => b.date.toMillis() - a.date.toMillis());

      let lastWorkoutDate = today;
      for (const workout of sortedWorkouts) {
        const workoutDate = workout.date.toDate();
        workoutDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (lastWorkoutDate.getTime() - workoutDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (diffDays <= 1) {
          currentStreak++;
          lastWorkoutDate = workoutDate;
        } else {
          break;
        }
      }
      setStreak(currentStreak);

      // Calculate total exercise minutes
      const totalMins = workouts
        .filter((w) => w.completed)
        .reduce((acc, workout) => {
          const workoutDuration = workout.exercises.reduce(
            (sum, exercise) => sum + (exercise.duration || 0),
            0
          );
          return acc + Math.floor(workoutDuration / 60);
        }, 0);
      setTotalMinutes(totalMins);

      // Load latest progress for each goal type
      const progressTypes: GoalType[] = ["weight", "strength", "stamina"];
      const progressData: { [key in GoalType]?: Progress } = {};

      for (const type of progressTypes) {
        const progress = await getLatestProgress(currentUser.uid, type);
        if (progress) {
          progressData[type] = progress;
        }
      }

      setLatestProgress(progressData);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGoalProgress = (goalType: GoalType): number => {
    if (!user?.goals || !user.goals.length) return 0;
    const goal = user.goals.find((g) => g.type === goalType);
    if (!goal || !latestProgress[goalType]) return 0;

    return Math.min(
      Math.round((latestProgress[goalType]!.value / goal.target) * 100),
      100
    );
  };

  const getCurrentWeek = () => {
    if (!user?.goals?.[0]?.deadline) return { current: 1, total: 12 };

    const startDate = user.createdAt.toDate();
    const endDate = user.goals[0].deadline.toDate();
    const today = new Date();

    const totalWeeks = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const currentWeek = Math.ceil(
      (today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    return {
      current: Math.min(Math.max(1, currentWeek), totalWeeks),
      total: totalWeeks,
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.profile.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push("/(tabs)/settings")}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.weekContainer}>
          <View style={styles.weekIndicator}>
            <View style={styles.weekProgress}>
              <View
                style={[
                  styles.weekProgressFill,
                  {
                    width: `${
                      (getCurrentWeek().current / getCurrentWeek().total) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={styles.weekText}>
            Week {getCurrentWeek().current}/{getCurrentWeek().total}
          </Text>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={[styles.statsContainer, styles.elevatedCard]}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="flame-outline" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="time-outline" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{totalMinutes}</Text>
          <Text style={styles.statLabel}>Total Minutes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trophy" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>
            {recentWorkouts.filter((w) => w.completed).length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Goal Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goal Progress</Text>
        {user?.goals?.map((goal) => (
          <View key={goal.type} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalType}>
                {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
              </Text>
              <Text style={styles.goalProgress}>
                {calculateGoalProgress(goal.type)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${calculateGoalProgress(goal.type)}%` },
                ]}
              />
            </View>
            <Text style={styles.goalDeadline}>
              Target: {goal.deadline.toDate().toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(tabs)/workout")}
        >
          <Ionicons name="play-circle" size={24} color="#FF6B6B" />
          <Text style={styles.actionText}>Start Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(tabs)/profile/edit")}
        >
          <Ionicons name="analytics" size={24} color="#FF6B6B" />
          <Text style={styles.actionText}>Update Goals</Text>
        </TouchableOpacity>
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <AchievementCard
            title="First Workout"
            description="Completed your first workout"
            icon="trophy"
            date="Today"
          />
          <AchievementCard
            title="Consistency"
            description="Completed 3 workouts this week"
            icon="star"
            date="2 days ago"
          />
          <AchievementCard
            title="Early Bird"
            description="Completed a morning workout"
            icon="sunny"
            date="Yesterday"
          />
        </ScrollView>
      </View>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/workout")}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentWorkouts.length > 0 ? (
          recentWorkouts.map((workout, index) => (
            <TouchableOpacity
              key={index}
              style={styles.workoutCard}
              onPress={() => router.push(`/(tabs)/workout/${workout.id}`)}
            >
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutDate}>
                  {workout.date.toDate().toLocaleDateString()}
                </Text>
                <Text style={styles.workoutExercises}>
                  {workout.exercises.length} exercises
                </Text>
              </View>
              {workout.completed && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.noProgressCard, { marginTop: 8 }]}>
            <Ionicons
              name="barbell-outline"
              size={40}
              color={COLORS.textSecondary}
            />
            <Text style={[styles.noProgressText, { marginTop: 12 }]}>
              No Recent Workouts
            </Text>
            <Text style={[styles.noProgressSubtext, { marginBottom: 16 }]}>
              Start your fitness journey today! Choose a workout plan and begin
              your transformation.
            </Text>
            <TouchableOpacity
              style={[
                styles.startFirstWorkoutButton,
                { backgroundColor: COLORS.primary },
              ]}
              onPress={() => router.push("/(tabs)/workout")}
            >
              <View style={styles.startFirstWorkoutContent}>
                <Ionicons name="play-circle" size={24} color={COLORS.card} />
                <Text style={styles.startFirstWorkoutText}>
                  Start Your First Workout
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Progress Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Summary</Text>
        {Object.keys(latestProgress).length > 0 ? (
          Object.entries(latestProgress).map(([type, progress]) => (
            <View key={type} style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Ionicons
                  name={
                    type === "weight"
                      ? "scale"
                      : type === "strength"
                      ? "barbell"
                      : "pulse"
                  }
                  size={24}
                  color="#007AFF"
                />
                <Text style={styles.progressType}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </View>
              <Text style={styles.progressValue}>{progress.value}</Text>
              <Text style={styles.progressDate}>
                {progress.date.toDate().toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.noProgressCard}>
            <Ionicons
              name="fitness-outline"
              size={24}
              color={COLORS.textSecondary}
            />
            <Text style={styles.noProgressText}>No recent progress</Text>
            <Text style={styles.noProgressSubtext}>
              Complete workouts to track your progress
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: COLORS.primary,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    color: COLORS.card,
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 4,
  },
  userName: {
    color: COLORS.card,
    fontSize: 28,
    fontWeight: "bold",
  },
  weekContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 8,
  },
  weekIndicator: {
    width: 200,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    marginBottom: 12,
  },
  weekProgress: {
    height: "100%",
    borderRadius: 3,
    overflow: "hidden",
  },
  weekProgressFill: {
    height: 6,
    backgroundColor: COLORS.card,
    borderRadius: 3,
  },
  weekText: {
    color: COLORS.card,
    fontSize: 14,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 24,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginTop: -30,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  elevatedCard: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: COLORS.divider,
    marginHorizontal: 8,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  seeAllButton: {
    color: COLORS.primary,
    fontSize: 14,
  },
  goalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  goalType: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  goalDeadline: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  quickActions: {
    flexDirection: "row",
    padding: 20,
    justifyContent: "space-around",
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 10,
    width: "45%",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    marginTop: 8,
    color: COLORS.primary,
    fontWeight: "500",
  },
  workoutCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutDate: {
    fontWeight: "500",
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  workoutExercises: {
    color: COLORS.textSecondary,
  },
  completedBadge: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    padding: 4,
  },
  progressCard: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressType: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: COLORS.text,
    textTransform: "capitalize",
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 4,
    color: COLORS.text,
  },
  progressDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: 10,
    fontStyle: "italic",
  },
  settingsButton: {
    padding: 8,
  },
  achievementCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 280,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  achievementDate: {
    fontSize: 12,
    color: COLORS.primary,
  },
  noProgressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
  },
  noProgressText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  noProgressSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  startFirstWorkoutButton: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startFirstWorkoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  startFirstWorkoutText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
