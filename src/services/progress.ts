import {
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { progressCollection } from '../../firebase/config';
import { Progress, GoalType } from '../types';

export const recordProgress = async (
  userId: string,
  type: GoalType,
  value: number,
  notes?: string
): Promise<Progress> => {
  try {
    const progressData: Progress = {
      userId,
      type,
      value,
      date: Timestamp.fromDate(new Date()),
      notes
    };

    const docRef = await addDoc(progressCollection, progressData);
    return { ...progressData, id: docRef.id };
  } catch (error) {
    console.error('Error recording progress:', error);
    throw error;
  }
};

export const getUserProgress = async (userId: string, type?: GoalType): Promise<Progress[]> => {
  try {
    let q = query(
      progressCollection,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    if (type) {
      q = query(q, where('type', '==', type));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
};

export const getLatestProgress = async (userId: string, type: GoalType): Promise<Progress | null> => {
  try {
    const q = query(
      progressCollection,
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('date', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting latest progress:', error);
    throw error;
  }
};

export const updateProgress = async (progressId: string, updates: Partial<Progress>): Promise<void> => {
  try {
    const progressRef = doc(progressCollection, progressId);
    await updateDoc(progressRef, updates);
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

export const deleteProgress = async (progressId: string): Promise<void> => {
  try {
    await deleteDoc(doc(progressCollection, progressId));
  } catch (error) {
    console.error('Error deleting progress:', error);
    throw error;
  }
}; 