 import { initializeApp } from "firebase/app"; 
 import { getAuth } from "firebase/auth"; 
 import { getStorage } from "firebase/storage"; 
 import { getFirestore } from "firebase/firestore";   

 const firebaseConfig = {
  apiKey: "AIzaSyDWiEhAoG3MbQn1ebt4_Agkhqsn7YzWfXU",
  authDomain: "react-twitter-28971.firebaseapp.com",
  projectId: "react-twitter-28971",
  storageBucket: "react-twitter-28971.appspot.com",
  messagingSenderId: "839178727384",
  appId: "1:839178727384:web:45a4744d865866359f4cad"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
 