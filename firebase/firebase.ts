import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBH6XzHzmTfO3ARZrdxBy8MytxJvpj0dic",
  authDomain: "clubconnect-9e4a3.firebaseapp.com",
  projectId: "clubconnect-9e4a3",
  storageBucket: "clubconnect-9e4a3.appspot.com",
  messagingSenderId: "780503007414",
  appId: "1:780503007414:web:03265a15a36c5411946617"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, googleProvider, db, storage };
