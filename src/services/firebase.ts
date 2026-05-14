import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyAFhsTyGaflvRXkkcQ_Q8udunhMDiDU-io',
  authDomain: 'iot-lab-aa6b3.firebaseapp.com',
  projectId: 'iot-lab-aa6b3',
  storageBucket: 'iot-lab-aa6b3.firebasestorage.app',
  messagingSenderId: '577150156497',
  appId: '1:577150156497:web:31e11400427fd6a2630ff0',
};

// Avoid re-initializing on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messaging: Messaging | null = null;

// Messaging is only supported in browser contexts (not SSR/Node)
if (typeof window !== 'undefined' && 'Notification' in window) {
  messaging = getMessaging(app);
}

export { messaging };
export default app;
