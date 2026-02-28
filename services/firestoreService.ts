import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface AdminAlert {
    id?: string;
    title: string;
    message: string;
    type: 'emergency' | 'info' | 'warning';
    province: string;
    isActive: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    createdBy?: string;
}

const ALERTS_COLLECTION = 'admin_alerts';

export const firestoreService = {
    // CREATE — Add a new admin alert
    createAlert: async (alert: Omit<AdminAlert, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, ALERTS_COLLECTION), {
                ...alert,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating alert:', error);
            throw error;
        }
    },

    // READ — Get all alerts
    getAlerts: async (): Promise<AdminAlert[]> => {
        try {
            const q = query(collection(db, ALERTS_COLLECTION), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as AdminAlert[];
        } catch (error) {
            console.error('Error getting alerts:', error);
            return [];
        }
    },

    // UPDATE — Update an existing alert
    updateAlert: async (id: string, data: Partial<AdminAlert>) => {
        try {
            const docRef = doc(db, ALERTS_COLLECTION, id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating alert:', error);
            throw error;
        }
    },

    // DELETE — Remove an alert
    deleteAlert: async (id: string) => {
        try {
            await deleteDoc(doc(db, ALERTS_COLLECTION, id));
        } catch (error) {
            console.error('Error deleting alert:', error);
            throw error;
        }
    },

    // REAL-TIME LISTENER — Listen for changes (for mobile app)
    subscribeToAlerts: (callback: (alerts: AdminAlert[]) => void) => {
        const q = query(collection(db, ALERTS_COLLECTION), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const alerts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as AdminAlert[];
            callback(alerts);
        });
        return unsubscribe; // Call this to stop listening
    },
};
