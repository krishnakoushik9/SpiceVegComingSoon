import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCXx0h_4FVtBnM83-QRP4MhwPB3juiDSr4",
  authDomain: "spice-veg-agri.firebaseapp.com",
  projectId: "spice-veg-agri",
  storageBucket: "spice-veg-agri.firebasestorage.app",
  messagingSenderId: "610216694160",
  appId: "1:610216694160:web:b27e4791de027d4fd36315",
  measurementId: "G-9F159C79CN"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
