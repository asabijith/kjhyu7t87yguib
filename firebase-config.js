// Initialize Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVeSrg9RpHmfO-mdMey9TuoEla-zlcTU0",
  authDomain: "dssdsd-bf4a8.firebaseapp.com",
  databaseURL: "https://dssdsd-bf4a8-default-rtdb.firebaseio.com",
  projectId: "dssdsd-bf4a8",
  storageBucket: "dssdsd-bf4a8.firebasestorage.app",
  messagingSenderId: "676931866710",
  appId: "1:676931866710:web:d29440a8fab9307f5aabf7",
  measurementId: "G-VZZ3EYD14T"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create auth and db variables to use throughout the app
const auth = firebase.auth();
const db = firebase.firestore();