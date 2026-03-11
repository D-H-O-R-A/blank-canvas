import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCfkWB3-QIMhuB7H_IwSFo-Myx3hbpUPQg",
  authDomain: "click-servico.firebaseapp.com",
  databaseURL: "https://click-servico-default-rtdb.firebaseio.com",
  projectId: "click-servico",
  storageBucket: "click-servico.firebasestorage.app",
  messagingSenderId: "95688280794",
  appId: "1:95688280794:web:fa2ce37beec9d64d6473e3",
  measurementId: "G-NKD3WPRRGK",
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const database = getDatabase(app);
