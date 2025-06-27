importScripts("https://www.gstatic.com/firebasejs/8.3.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.3.2/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyAtkL2FTP0P-F1FgNKoqknmrXTZ_wn_KHI",
  authDomain: "mundotango-test.firebaseapp.com",
  projectId: "mundotango-test",
  storageBucket: "mundotango-test.appspot.com",
  messagingSenderId: "599691469375",
  appId: "1:599691469375:web:4044582a5c6c9946d68e8a",
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler((payload) => {
  console.log("Message received in background:", payload);
  const notificationTitle = "Background Message Title";
  const { title, body } = payload.notification;
  const notificationOptions = {
    body: "Background Message body.",
    icon: "/firebase-logo.png",
  };

  self.registration.showNotification(
    title || notificationTitle,
    body || notificationOptions
  );
});

messaging.onBackgroundMessage((payload) => {
  console.log("Message received in background:", payload);
  const notificationTitle = "Background Message Title";
  const { title, body } = payload.notification;
  const notificationOptions = {
    body: "Background Message body.",
    icon: "/firebase-logo.png",
  };

  self.registration.showNotification(
    title || notificationTitle,
    body || notificationOptions
  );
});
