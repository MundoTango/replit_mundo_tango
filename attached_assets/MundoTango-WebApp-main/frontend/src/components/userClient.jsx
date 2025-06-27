"use client";
import { removeAuthToken } from "@/data/services/localStorageService";
import { useUpdateFcmMutation } from "@/data/services/postApi";
import {
  onMessageListener,
  requestNotificationPermission,
} from "@/firebase/firebase-messaging";
import TimeLine from "@/sections/dashboard/Timeline/TimeLine";
import { useEffect } from "react";
import toast from "react-hot-toast";

function Page() {
  const FCM = localStorage.getItem("fcm_token");
  const [updateFcm, {}] = useUpdateFcmMutation();

  const onUpdateFCM = async (body) => {
    try {
      const result = await updateFcm(body);

      const { code } = result?.data;

      if (code === 200) {
        // toast.success("FCM Updated successfully");
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    console.log("initiaite messages");
    requestNotificationPermission();

    onMessageListener()
      .then((payload) => {
        console.log("Message received in foreground:", payload);
        alert(`Notification: ${payload.notification.title}`);
      })
      .catch((err) => console.error("Failed to receive message:", err));

    // remove auth token
    removeAuthToken();
  }, []);

  useEffect(() => {
    onUpdateFCM({ token: FCM });
  }, [FCM]);

  return <TimeLine />;
}

export default Page;
