import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { create } from 'zustand';
import { auth } from '../services/firebase';

interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    province: string;
    district: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasSeenOnboarding: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    setOnboardingSeen: () => Promise<void>;
    checkAuth: () => Promise<void>;
    updateUser: (userData: Partial<User>) => Promise<void>;
    clearError: () => void;
}

// Convert Firebase user to our app user
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'U'}&background=007AFF&color=fff`,
    role: 'Citizen',
    province: 'Butuan City',
    district: 'Any District',
});

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    hasSeenOnboarding: false,
    error: null,

    // ──────────────────────────────────────────
    // LOGIN with Firebase Auth
    // ──────────────────────────────────────────
    login: async (email: string, password: string) => {
        set({ error: null });
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = mapFirebaseUser(userCredential.user);
            set({ user, isAuthenticated: true, error: null });
            return true;
        } catch (error: any) {
            let message = 'Login failed. Please try again.';
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    message = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address.';
                    break;
                case 'auth/too-many-requests':
                    message = 'Too many attempts. Please try again later.';
                    break;
                case 'auth/invalid-credential':
                    message = 'Invalid email or password.';
                    break;
            }
            set({ error: message });
            return false;
        }
    },

    // ──────────────────────────────────────────
    // REGISTER with Firebase Auth
    // ──────────────────────────────────────────
    register: async (name: string, email: string, password: string) => {
        set({ error: null });
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Set the display name
            await updateProfile(userCredential.user, {
                displayName: name,
                photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=007AFF&color=fff`,
            });

            const user = mapFirebaseUser(userCredential.user);
            user.name = name; // Override since profile update is async
            user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=007AFF&color=fff`;

            set({ user, isAuthenticated: true, error: null });
            return true;
        } catch (error: any) {
            let message = 'Registration failed. Please try again.';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'An account with this email already exists.';
                    break;
                case 'auth/weak-password':
                    message = 'Password must be at least 6 characters.';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address.';
                    break;
            }
            set({ error: message });
            return false;
        }
    },

    // ──────────────────────────────────────────
    // LOGOUT
    // ──────────────────────────────────────────
    logout: async () => {
        try {
            await signOut(auth);
            set({ user: null, isAuthenticated: false });
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    // ──────────────────────────────────────────
    // ONBOARDING STATE
    // ──────────────────────────────────────────
    setOnboardingSeen: async () => {
        await AsyncStorage.setItem('@pintig_onboarding', 'true');
        set({ hasSeenOnboarding: true });
    },

    // ──────────────────────────────────────────
    // CHECK AUTH — Listens for Firebase auth state
    // ──────────────────────────────────────────
    checkAuth: async () => {
        const onboarding = await AsyncStorage.getItem('@pintig_onboarding');
        set({ hasSeenOnboarding: onboarding === 'true' });

        // Firebase auth state listener
        onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const user = mapFirebaseUser(firebaseUser);
                set({ user, isAuthenticated: true, isLoading: false });
            } else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        });
    },

    updateUser: async (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
            set({ user: { ...user, ...userData } });
        }
    },

    clearError: () => set({ error: null }),
}));
