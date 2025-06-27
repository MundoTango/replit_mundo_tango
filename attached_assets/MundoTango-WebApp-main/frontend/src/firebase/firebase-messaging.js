
'use client';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./init";
import { getAuthToken } from "@/data/services/localStorageService";

// const messaging = getMessaging(app);
// console.log("messaging", messaging);

export const requestNotificationPermission = async () => {
    try {
        // if ((await getAuthToken()) !== null) {
        //   return false;
        // }
        const messaging = getMessaging(app);
        console.log("messaging", messaging);
  
        const permission = await Notification.requestPermission();
        console.log("permission", permission);
        if (permission === "granted") {
            
          try {
            const registration = await navigator.serviceWorker.ready;
            console.log(registration , "registered");
  
            const currentToken = await getToken(messaging, {
              vapidKey:
                "BP0xi2PghRTOnKf3eYkKyyLZ-devb3tF8x1ZMoZNXoTCdCQgBkleAJDJfQqy6G2T5reLA4iSefPxPsB23TO4rKA",
              serviceWorkerRegistration: registration,
            });
            console.log(currentToken);
  
            if (currentToken) {
              // Send the token to your server and update the UI if necessary
              // save the token in your database
              await localStorage.setItem("fcm_token", currentToken);
            } else {
            }
          } catch (error) {
            // location.reload();
          }
        } else if (permission !== "granted") {
          return;
        }
      } catch (error) {
      }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    const messaging = getMessaging(app);
    console.log("messaging", messaging);

    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });