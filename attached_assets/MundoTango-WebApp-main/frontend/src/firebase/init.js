'use client';
import { initializeApp } from "@firebase/app";
import config from "./config.json";

const {
  apiKey,
  appId,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  vapidKey,
} = config;

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  vapidKey,
};

export const app = initializeApp(firebaseConfig);
