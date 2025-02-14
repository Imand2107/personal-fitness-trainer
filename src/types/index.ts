import { Timestamp } from 'firebase/firestore';

export type GoalType = 'weight' | 'strength' | 'stamina';

export interface Goal {
  type: GoalType;
  target: number;
  deadline: Timestamp;
}

export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  bmi: number;
  gender: 'male' | 'female';
  onboardingCompleted: boolean;
  bodyType?: 'ectomorph' | 'mesomorph' | 'endomorph';
}

export interface User {
  uid: string;
  email: string;
  profile: UserProfile;
  goals: Goal[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
}

export interface Workout {
  id?: string;
  userId: string;
  exercises: Exercise[];
  date: Timestamp;
  completed: boolean;
  completedAt?: Timestamp;
  notes?: string;
}

export interface Progress {
  id?: string;
  userId: string;
  type: GoalType;
  value: number;
  date: Timestamp;
  notes?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Workout types
export interface WorkoutState {
  workouts: Workout[];
  currentWorkout: Workout | null;
  loading: boolean;
  error: string | null;
}

// Progress types
export interface ProgressState {
  progress: Progress[];
  loading: boolean;
  error: string | null;
}

// Root state type
export interface RootState {
  auth: AuthState;
  workout: WorkoutState;
  progress: ProgressState;
} 