import { WorkoutPlan, Exercise, WorkoutCategory, DifficultyLevel } from '../../src/types/workout';

// Helper function to get image URL
const getExerciseImage = (filename: string) => `/assets/images/exercises/${filename}`;

// Define common exercises that are used across multiple workouts
export const commonExercises: Record<string, Exercise> = {
  // Cardio & Warm-up Exercises
  jumpingJacks: {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    description: 'Full body warm-up exercise to get your heart rate up',
    imageUrl: getExerciseImage('jumping-jacks.gif'),
    duration: 30,
    targetMuscles: ['full_body'],
    equipment: [],
    tips: [
      'Land softly on your feet',
      'Keep core engaged',
      'Coordinate arm and leg movements'
    ],
    difficulty: 'beginner'
  },
  highKnees: {
    id: 'high_knees',
    name: 'High Knees',
    description: 'Dynamic cardio exercise that engages core and legs',
    imageUrl: getExerciseImage('high-knees.gif'),
    duration: 30,
    targetMuscles: ['core', 'legs'],
    equipment: [],
    tips: [
      'Drive knees up towards chest',
      'Stay on balls of feet',
      'Keep upper body straight'
    ],
    difficulty: 'beginner'
  },
  mountainClimbers: {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    description: 'Dynamic plank exercise targeting core and cardio',
    imageUrl: getExerciseImage('mountain-climbers.gif'),
    duration: 30,
    targetMuscles: ['core', 'shoulders', 'cardio'],
    equipment: [],
    tips: [
      'Keep hips level',
      'Engage core throughout',
      'Alternate legs quickly'
    ],
    difficulty: 'intermediate'
  },

  // Push-up Variations
  pushups: {
    id: 'pushups',
    name: 'Push-ups',
    description: 'Classic bodyweight exercise targeting chest, shoulders, and triceps',
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
      'Keep your core engaged throughout'
    ],
    difficulty: 'intermediate'
  },
  wideArmPushups: {
    id: 'wide_arm_pushups',
    name: 'Wide Arm Push-ups',
    description: 'Push-ups with wider arm placement for outer chest focus',
    imageUrl: getExerciseImage('wide-arm-push-up.gif'),
    duration: 45,
    sets: 3,
    reps: 8,
    restBetweenSets: 30,
    targetMuscles: ['chest', 'shoulders'],
    equipment: [],
    tips: [
      'Place hands wider than shoulder width',
      'Keep elbows at 45-degree angle',
      'Maintain straight body alignment'
    ],
    difficulty: 'intermediate'
  },
  diamondPushups: {
    id: 'diamond_pushups',
    name: 'Diamond Push-ups',
    description: 'Advanced push-up variation targeting triceps',
    imageUrl: getExerciseImage('diamond-push-up.gif'),
    duration: 45,
    sets: 3,
    reps: 8,
    restBetweenSets: 30,
    targetMuscles: ['triceps', 'chest'],
    equipment: [],
    tips: [
      'Form diamond shape with hands',
      'Keep elbows close to body',
      'Lower chest to hands'
    ],
    difficulty: 'advanced'
  },

  // Core Exercises
  plank: {
    id: 'plank',
    name: 'Plank',
    description: 'Static hold for core stability',
    imageUrl: getExerciseImage('plank.jpg'),
    duration: 30,
    targetMuscles: ['core', 'shoulders'],
    equipment: [],
    tips: [
      'Keep body straight',
      'Engage core',
      'Look at the floor',
      'Keep breathing steady'
    ],
    difficulty: 'beginner'
  },
  russianTwist: {
    id: 'russian_twist',
    name: 'Russian Twist',
    description: 'Rotational exercise targeting obliques',
    imageUrl: getExerciseImage('russian-twist.gif'),
    duration: 45,
    reps: 32,
    targetMuscles: ['obliques', 'core'],
    equipment: [],
    tips: [
      'Sit with knees bent',
      'Lean back slightly',
      'Rotate torso side to side'
    ],
    difficulty: 'intermediate'
  },
  legRaises: {
    id: 'leg_raises',
    name: 'Leg Raises',
    description: 'Targets lower abs',
    imageUrl: getExerciseImage('leg-raises.gif'),
    duration: 45,
    sets: 3,
    reps: 12,
    targetMuscles: ['lower_abs'],
    equipment: [],
    tips: [
      'Keep legs straight',
      'Control the movement',
      'Lower legs slowly'
    ],
    difficulty: 'intermediate'
  },

  // Lower Body Exercises
  squats: {
    id: 'squats',
    name: 'Squats',
    description: 'Fundamental lower body exercise targeting multiple muscle groups',
    imageUrl: getExerciseImage('squats.gif'),
    duration: 45,
    sets: 3,
    reps: 12,
    restBetweenSets: 30,
    targetMuscles: ['quadriceps', 'hamstrings', 'glutes', 'core'],
    equipment: [],
    tips: [
      'Keep feet shoulder-width apart',
      'Keep back straight',
      'Lower until thighs are parallel to ground'
    ],
    difficulty: 'beginner'
  },
  lunges: {
    id: 'lunges',
    name: 'Lunges',
    description: 'Lower body strengthening exercise',
    imageUrl: getExerciseImage('lunges.gif'),
    duration: 45,
    sets: 3,
    reps: 10,
    targetMuscles: ['quadriceps', 'hamstrings', 'glutes'],
    equipment: [],
    tips: [
      'Keep torso upright',
      'Step forward with control',
      'Back knee nearly touches ground'
    ],
    difficulty: 'beginner'
  },
  burpees: {
    id: 'burpees',
    name: 'Burpees',
    description: 'Full body cardio exercise',
    imageUrl: getExerciseImage('burpee.webp'),
    duration: 45,
    sets: 3,
    reps: 8,
    targetMuscles: ['full_body', 'cardio'],
    equipment: [],
    tips: [
      'Start standing',
      'Drop to plank position',
      'Optional push-up',
      'Jump back to feet'
    ],
    difficulty: 'advanced'
  }
};

// Define workout plans
export const workoutPlans: WorkoutPlan[] = [
  // Weight Management Workouts
  {
    id: 'weight_beginner_hiit',
    category: 'fat_burning',
    name: 'Weight Loss HIIT',
    description: 'High-intensity interval training for effective weight management',
    difficulty: 'beginner',
    duration: 30,
    exercises: [
      commonExercises.jumpingJacks,
      commonExercises.mountainClimbers,
      commonExercises.burpees,
      commonExercises.highKnees,
      commonExercises.squats
    ],
    restBetweenExercises: 30,
    equipmentNeeded: [],
    targetMuscles: ['full_body', 'cardio'],
    calories: 300,
    goalType: 'weight'
  },
  {
    id: 'weight_intermediate_circuit',
    category: 'fat_burning',
    name: 'Fat Burning Circuit',
    description: 'Circuit training designed for optimal fat burning and muscle preservation',
    difficulty: 'intermediate',
    duration: 45,
    exercises: [
      commonExercises.burpees,
      commonExercises.pushups,
      commonExercises.squats,
      commonExercises.mountainClimbers,
      commonExercises.plank
    ],
    restBetweenExercises: 45,
    equipmentNeeded: [],
    targetMuscles: ['full_body', 'cardio'],
    calories: 400,
    goalType: 'weight'
  },

  // Strength Building Workouts
  {
    id: 'strength_upper_body',
    category: 'chest',
    name: 'Upper Body Power',
    description: 'Focus on building upper body strength and muscle',
    difficulty: 'intermediate',
    duration: 40,
    exercises: [
      commonExercises.pushups,
      commonExercises.diamondPushups,
      commonExercises.wideArmPushups,
      commonExercises.plank
    ],
    restBetweenExercises: 90,
    equipmentNeeded: [],
    targetMuscles: ['chest', 'shoulders', 'triceps', 'core'],
    calories: 250,
    goalType: 'strength'
  },
  {
    id: 'strength_lower_body',
    category: 'leg',
    name: 'Lower Body Power',
    description: 'Build leg strength and power with compound movements',
    difficulty: 'intermediate',
    duration: 40,
    exercises: [
      commonExercises.squats,
      commonExercises.lunges,
      commonExercises.burpees
    ],
    restBetweenExercises: 90,
    equipmentNeeded: [],
    targetMuscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    calories: 300,
    goalType: 'strength'
  },

  // Stamina Building Workouts
  {
    id: 'stamina_endurance',
    category: 'endurance',
    name: 'Endurance Builder',
    description: 'Improve cardiovascular endurance and stamina',
    difficulty: 'intermediate',
    duration: 45,
    exercises: [
      commonExercises.jumpingJacks,
      commonExercises.highKnees,
      commonExercises.mountainClimbers,
      commonExercises.burpees
    ],
    restBetweenExercises: 30,
    equipmentNeeded: [],
    targetMuscles: ['full_body', 'cardio'],
    calories: 350,
    goalType: 'stamina'
  },
  {
    id: 'stamina_hiit',
    category: 'endurance',
    name: 'HIIT Endurance',
    description: 'High-intensity intervals to boost stamina and endurance',
    difficulty: 'advanced',
    duration: 35,
    exercises: [
      commonExercises.burpees,
      commonExercises.mountainClimbers,
      commonExercises.highKnees,
      commonExercises.jumpingJacks,
      commonExercises.squats
    ],
    restBetweenExercises: 20,
    equipmentNeeded: [],
    targetMuscles: ['full_body', 'cardio'],
    calories: 400,
    goalType: 'stamina'
  }
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
    primaryMuscles: ['abs', 'obliques', 'lower_back']
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
    primaryMuscles: ['heart', 'lungs', 'full_body']
  },
  fat_burning: {
    name: 'Fat Burning',
    description: 'High-intensity workouts for maximum calorie burn',
    icon: 'flame',
    primaryMuscles: ['full_body']
  },
  flexibility: {
    name: 'Flexibility Workout',
    description: 'Improve mobility and flexibility',
    icon: 'body',
    primaryMuscles: ['full_body', 'joints']
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