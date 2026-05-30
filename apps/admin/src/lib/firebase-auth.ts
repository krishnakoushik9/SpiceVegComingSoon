import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCXh_4FVtBnM83-QRP4MhwPB3juiDSr4",
  authDomain: "spice-veg-agri.firebaseapp.com",
  projectId: "spice-veg-agri"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
