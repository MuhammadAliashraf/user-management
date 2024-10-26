// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: 'AIzaSyD1soKpuF-9mPt1oMFkj81MnbqKaXiMEt0',
  authDomain: 'user-data-a186f.firebaseapp.com',
  projectId: 'user-data-a186f',
  storageBucket: 'user-data-a186f.appspot.com',
  messagingSenderId: '1007442068265',
  appId: '1:1007442068265:web:8e2617a57e821ac78d6d38',
  measurementId: 'G-YQL8YBC6D8',
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
