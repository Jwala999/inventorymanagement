let app;
let auth;
let db;

try {
  const firebaseConfig = {
    apiKey: "AIzaSyA2I6pxYexhdlhBTmOrTK5bfQu0ugwJmwU",
    authDomain: "inventorymanegement.firebaseapp.com",
    projectId: "inventorymanegement",
    storageBucket: "inventorymanegement.appspot.com",
    messagingSenderId: "98913828234",
    appId: "1:98913828234:web:328cdb4692cc430c69dc73",
    measurementId: "G-D78W44E3PJ"
  };

  app = firebase.initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully");

  if (typeof firebase.auth !== 'function') {
    throw new Error("Firebase Auth module is not available. Ensure firebase-auth.js is loaded.");
  }
  auth = firebase.auth();
  console.log("Firebase Auth initialized successfully");

  if (typeof firebase.firestore !== 'function') {
    throw new Error("Firebase Firestore module is not available. Ensure firebase-firestore.js is loaded.");
  }
  db = firebase.firestore();
  console.log("Firebase Firestore initialized successfully");
} catch (error) {
  console.error("Firebase initialization failed:", error);
  throw error;
}