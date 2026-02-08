// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB2tNqHYXAt8_-S-QBStqX_EOOAmO2_R3s",
  authDomain: "coin-insights-76a3c.firebaseapp.com",
  projectId: "coin-insights-76a3c",
  storageBucket: "coin-insights-76a3c.appspot.com",
  messagingSenderId: "359296980222",
  appId: "1:359296980222:web:c6d022434628f90a1f81af"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
