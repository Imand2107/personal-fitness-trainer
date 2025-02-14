import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    CollectionReference,
    DocumentData,
    QueryDocumentSnapshot,
    FirestoreDataConverter,
    initializeFirestore,
    enableIndexedDbPersistence
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { User, Workout, Progress } from '../src/types';
// import { PrivateUserData, PublicUserData } from 'src/types';
// import env from 'expo-env';

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);

// Initialize Firestore with settings optimized for React Native
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // This is needed for React Native
});

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.log('Persistence failed to enable: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        // The current browser/environment doesn't support persistence
        console.log('Persistence not supported in this environment');
    }
});

const storage = getStorage(app);

// Export Firebase instances
export { auth, db, storage };

/**
 * Create a collection reference
 * @param collectionPath 
 * @returns Firestore collection reference
 */
export const createCollection = (collectionPath: string) => {
    return collection(db, collectionPath);
};

/**
 * Generic data type converter from firestore
 *
 * @template T
 */
const genericConverter = <T>() => ({
    toFirestore: (data: T) => {
        // Remove undefined fields
        const cleanData = Object.entries(data as any).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as any);
        return cleanData as DocumentData;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot): T => snapshot.data() as T,
});

/**
 * Create a collection function, using typecasting and the withConverter function to get typed data back from firestore
 *
 * @template T
 * @param {string} collectionName
 * @return {*}  {CollectionReference<T>}
 */
const createCollectionTyped = <T = DocumentData>(collectionName: string): CollectionReference<T> => {
    const converter = genericConverter<T>() as FirestoreDataConverter<T>;
    return collection(db, collectionName).withConverter(converter);
};

/**
 * Define the collections
 */
// export const privateUserCollection = createCollectionTyped<PrivateUserData>('private-user-data');
// export const publicUserCollection = createCollectionTyped<PublicUserData>('public-user-data');
export const usersCollection = createCollectionTyped<User>('users');
export const workoutsCollection = createCollectionTyped<Workout>('workouts');
export const progressCollection = createCollectionTyped<Progress>('progress');