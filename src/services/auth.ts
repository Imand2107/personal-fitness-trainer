import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db, usersCollection } from '../../firebase/config';
import { User, UserProfile } from '../types';

export const registerUser = async (
  email: string,
  password: string,
  profile: UserProfile
): Promise<User> => {
  try {
    console.log('Starting user registration process...');
    
    // Create the authentication user
    console.log('Creating authentication user...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;
    console.log('Authentication user created with UID:', uid);
    
    const now = Timestamp.fromDate(new Date());

    // Prepare the user data
    const userData: User = {
      uid,
      email,
      profile,
      goals: [],
      createdAt: now,
      updatedAt: now
    };
    console.log('Prepared user data:', JSON.stringify(userData, null, 2));

    // Create the user document in Firestore
    try {
      console.log('Attempting to create Firestore document...');
      const userDocRef = doc(usersCollection, uid);
      await setDoc(userDocRef, userData);
      console.log('User document created successfully in collection:', userDocRef.path);
      
      // Verify the document was created
      const verifyDoc = await getDoc(userDocRef);
      if (verifyDoc.exists()) {
        console.log('Verified document exists with data:', verifyDoc.data());
      } else {
        console.error('Document was not created successfully');
      }
    } catch (firestoreError) {
      // If Firestore operation fails, delete the authentication user
      console.error('Firestore error details:', firestoreError);
      await userCredential.user.delete();
      console.error('Error creating user document:', firestoreError);
      throw new Error('Failed to create user profile');
    }

    return userData;
  } catch (error) {
    console.error('Registration error details:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  try {
    const userDoc = await getDoc(doc(usersCollection, currentUser.uid));
    if (!userDoc.exists()) return null;
    return userDoc.data();
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const updateUserProfile = async (profile: UserProfile): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No authenticated user');

  try {
    const userDocRef = doc(usersCollection, currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data() as User;
    await setDoc(userDocRef, {
      ...userData,
      profile,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}; 