// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyAISMT6efSSAAsEOW4BSoHe4luZEG0MlaU",
  authDomain: "notification-92dce.firebaseapp.com",
  projectId: "notification-92dce",
  storageBucket: "notification-92dce.appspot.com",
  messagingSenderId: "431799702508",
  appId: "1:431799702508:web:92b3226cba7feb102de6c9",
  measurementId: "G-QTSDLX2C42",
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
