export type WorkoutCategory =
  | "abs"
  | "arm"
  | "chest"
  | "endurance"
  | "fat_burning"
  | "flexibility"
  | "full_body"
  | "leg";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type GoalType = "weight" | "strength" | "stamina";

export interface Exercise {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  duration: number; // in seconds
  sets?: number;
  reps?: number;
  restBetweenSets?: number; // in seconds
  targetMuscles: string[];
  equipment: string[];
  tips: string[];
  variations?: string[];
  difficulty: DifficultyLevel;
}

export interface WorkoutPlan {
  id: string;
  category: WorkoutCategory;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  duration: number; // total duration in minutes
  exercises: Exercise[];
  restBetweenExercises: number; // in seconds
  equipmentNeeded: string[];
  targetMuscles: string[];
  calories: number; // estimated calories burned
  goalType: GoalType; // the primary fitness goal this workout supports
}

// User's workout progress and preferences
export interface UserWorkoutPreferences {
  preferredCategories: WorkoutCategory[];
  preferredDifficulty: DifficultyLevel;
  preferredDuration: number; // in minutes
  availableEquipment: string[];
  workoutSchedule: {
    daysPerWeek: number;
    preferredTime?: string;
  };
}

export interface WorkoutProgress {
  userId: string;
  workoutId: string;
  date: Date;
  completed: boolean;
  duration: number; // actual duration in minutes
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
  }[];
  caloriesBurned: number;
  notes?: string;
} 