import { WorkoutPlan, Exercise, WorkoutCategory, DifficultyLevel } from '../../src/types/workout';

// Helper function to get image URL
const getExerciseImage = (filename: string) => `/assets/images/exercises/${filename}`;

// Define common exercises that are used across multiple workouts
export const commonExercises: Record<string, Exercise> = {
  pushups: {
    id: 'pushups',
    name: 'Push-ups',
    description: 'A classic bodyweight exercise that targets chest, shoulders, and triceps.',
    imageUrl: getExerciseImage('pushup.gif'),
    duration: 45,
    sets: 3,
    reps: 10,
    restBetweenSets: 30,
    targetMuscles: ['chest', 'shoulders', 'triceps'],
    equipment: [],
    tips: [
      'Keep your body in a straight line',
      'Lower your chest to just above the ground',
      'Keep your core engaged throughout the movement'
    ],
    difficulty: 'intermediate'
  },
  squats: {
    id: 'squats',
    name: 'Squats',
    description: 'A fundamental lower body exercise targeting multiple muscle groups.',
    imageUrl: getExerciseImage('squats.gif'),
    duration: 45,
    sets: 3,
    reps: 12,
    restBetweenSets: 30,
    targetMuscles: ['quadriceps', 'hamstrings', 'glutes', 'core'],
    equipment: [],
    tips: [
      'Keep your feet shoulder-width apart',
      'Keep your back straight',
      'Lower until your thighs are parallel to the ground'
    ],
    difficulty: 'beginner'
  },
  // Add more common exercises...
};

// Define workout plans
export const workoutPlans: WorkoutPlan[] = [
  {
    id: 'beginner_full_body',
    category: 'full_body',
    name: 'Beginner Full Body Workout',
    description: 'A complete body workout suitable for beginners.',
    difficulty: 'beginner',
    duration: 30,
    exercises: [
      commonExercises.pushups,
      commonExercises.squats,
      // Add more exercises...
    ],
    restBetweenExercises: 60,
    equipmentNeeded: [],
    targetMuscles: ['chest', 'legs', 'core', 'back', 'shoulders'],
    calories: 150
  },
  // Add more workout plans...
];

// Export workout categories with their metadata
export const workoutCategories: Record<WorkoutCategory, {
  name: string;
  description: string;
  icon: string;
  primaryMuscles: string[];
}> = {
  abs: {
    name: 'Abs Workout',
    description: 'Build core strength and stability',
    icon: 'fitness',
    primaryMuscles: ['abs', 'obliques', 'lower back']
  },
  arm: {
    name: 'Arm Workout',
    description: 'Build arm strength and definition',
    icon: 'barbell',
    primaryMuscles: ['biceps', 'triceps', 'forearms']
  },
  chest: {
    name: 'Chest Workout',
    description: 'Build chest strength and definition',
    icon: 'body',
    primaryMuscles: ['chest', 'shoulders', 'triceps']
  },
  endurance: {
    name: 'Endurance Workout',
    description: 'Improve cardiovascular fitness and stamina',
    icon: 'heart',
    primaryMuscles: ['heart', 'lungs', 'full body']
  },
  fat_burning: {
    name: 'Fat Burning',
    description: 'High-intensity workouts for maximum calorie burn',
    icon: 'flame',
    primaryMuscles: ['full body']
  },
  flexibility: {
    name: 'Flexibility Workout',
    description: 'Improve mobility and flexibility',
    icon: 'body',
    primaryMuscles: ['full body', 'joints']
  },
  full_body: {
    name: 'Full Body Workout',
    description: 'Complete workout targeting all major muscle groups',
    icon: 'body',
    primaryMuscles: ['chest', 'back', 'legs', 'arms', 'core']
  },
  leg: {
    name: 'Leg Workout',
    description: 'Build lower body strength and power',
    icon: 'body',
    primaryMuscles: ['quadriceps', 'hamstrings', 'calves', 'glutes']
  }
};

// Export difficulty levels with their metadata
export const difficultyLevels: Record<DifficultyLevel, {
  name: string;
  description: string;
  recommendedExperience: string;
}> = {
  beginner: {
    name: 'Beginner',
    description: 'Perfect for those just starting their fitness journey',
    recommendedExperience: '0-3 months'
  },
  intermediate: {
    name: 'Intermediate',
    description: 'For those with some fitness experience',
    recommendedExperience: '3-12 months'
  },
  advanced: {
    name: 'Advanced',
    description: 'Challenging workouts for experienced fitness enthusiasts',
    recommendedExperience: '1+ years'
  }
}; 