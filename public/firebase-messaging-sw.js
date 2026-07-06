importScripts('https://www.gstatic.com/firebasejs/9.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.x/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "gen-lang-client-0121446000.firebaseapp.com",
  projectId: "gen-lang-client-0121446000",
  storageBucket: "gen-lang-client-0121446000.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Taj Lift';
  const options = {
    body: payload.notification?.body || '',
    icon: '/icon.png',
  };
  self.registration.showNotification(title, options);
});
