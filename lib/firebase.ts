
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyCgZ2UX_cs-DvOppabC7g69Au7HL3y-Wnk",
  authDomain: "al-furqan-portal.firebaseapp.com",
  projectId: "al-furqan-portal",
  storageBucket: "al-furqan-portal.firebasestorage.app",
  messagingSenderId: "1044341382876",
  appId: "1:1044341382876:web:0d04fbc60fc15d99b45e19",
  measurementId: "G-CLZPK4DL9S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
