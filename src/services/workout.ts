import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { workoutsCollection } from '../../firebase/config';
import { Workout, Exercise } from '../types';

export const createWorkout = async (userId: string, exercises: Exercise[]): Promise<Workout> => {
  try {
    const workoutData: Workout = {
      userId,
      exercises,
      date: Timestamp.fromDate(new Date()),
      completed: false
    };

    const docRef = await addDoc(workoutsCollection, workoutData);
    return { ...workoutData, id: docRef.id };
  } catch (error) {
    console.error('Error creating workout:', error);
    throw error;
  }
};

export const getUserWorkouts = async (userId: string): Promise<Workout[]> => {
  try {
    const q = query(
      workoutsCollection,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user workouts:', error);
    throw error;
  }
};

export const updateWorkout = async (workoutId: string, updates: Partial<Workout>): Promise<void> => {
  try {
    const workoutRef = doc(workoutsCollection, workoutId);
    await updateDoc(workoutRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating workout:', error);
    throw error;
  }
};

export const deleteWorkout = async (workoutId: string): Promise<void> => {
  try {
    await deleteDoc(doc(workoutsCollection, workoutId));
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
};

export const completeWorkout = async (
  workoutId: string,
  totalTimeElapsed: number,
  caloriesBurned: number,
  exercises: {
    exerciseId: string;
    sets?: number;
    reps?: number;
    duration?: number;
  }[]
): Promise<void> => {
  try {
    const workoutRef = doc(workoutsCollection, workoutId);
    await updateDoc(workoutRef, {
      completed: true,
      completedAt: Timestamp.fromDate(new Date()),
      totalTimeElapsed,
      caloriesBurned,
      exercises,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error completing workout:', error);
    throw error;
  }
};

export const updateExerciseProgress = async (
  workoutId: string,
  exerciseIndex: number,
  timeElapsed: number,
  isCompleted: boolean
): Promise<void> => {
  try {
    const workoutRef = doc(workoutsCollection, workoutId);
    
    // Update the workout document with the completed exercise
    await updateDoc(workoutRef, {
      [`exercises.${exerciseIndex}.completed`]: isCompleted,
      [`exercises.${exerciseIndex}.timeElapsed`]: timeElapsed,
      totalTimeElapsed: timeElapsed,
      lastUpdated: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating exercise progress:', error);
    throw error;
  }
}; 