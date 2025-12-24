import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCwMIzsYzLVx7q3WIcqHTt1j1rKPZMyo1s',
  authDomain: 'questionnaire-72c7e.firebaseapp.com',
  projectId: 'questionnaire-72c7e',
  storageBucket: 'questionnaire-72c7e.appspot.com',
  messagingSenderId: '187267928880',
  appId: '1:187267928880:web:35cf871933965a19b0eef5'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
