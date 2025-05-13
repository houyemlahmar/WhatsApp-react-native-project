// Import the functions you need from the SDKs you need
import app from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import { createClient } from '@supabase/supabase-js'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRXk5uKXDJlZZPqrrICYu4pi6mOmj2oXU",
  authDomain: "whatsapphouyem.firebaseapp.com",
  projectId: "whatsapphouyem",
  storageBucket: "whatsapphouyem.firebasestorage.app",
  messagingSenderId: "492074648942",
  appId: "1:492074648942:web:74391ef03474073f326d7f",
  measurementId: "G-3S29829EJ9"
};

// Initialize Firebase
const firebase = app.initializeApp(firebaseConfig);
export default firebase;

const supabaseUrl = 'https://sflwgjnkfxaocxwyltvf.supabase.co' // Remplace par ton URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmbHdnam5rZnhhb2N4d3lsdHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODI4NTYsImV4cCI6MjA2MTA1ODg1Nn0.fJlv9kvknLm7ogyGBpeT65Y8s5iVVe9NQLkCnP84nKE' // Remplace par ta clé
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    enabled: false, // Disable realtime features
  },
});
export { supabase };