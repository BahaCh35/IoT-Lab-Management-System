// Firebase Messaging Service Worker
// This file must be in the public/ root so the browser can register it at /firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAFhsTyGaflvRXkkcQ_Q8udunhMDiDU-io',
  authDomain: 'iot-lab-aa6b3.firebaseapp.com',
  projectId: 'iot-lab-aa6b3',
  storageBucket: 'iot-lab-aa6b3.firebasestorage.app',
  messagingSenderId: '577150156497',
  appId: '1:577150156497:web:31e11400427fd6a2630ff0',
});

const messaging = firebase.messaging();

// Handle background messages (when the browser tab is closed or not focused)
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};

  const notificationTitle = title || 'SmartLab';
  const notificationOptions = {
    body: body || '',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
