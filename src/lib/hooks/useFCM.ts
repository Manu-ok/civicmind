"use client";

import { useEffect, useState, useRef } from "react";
import { getToken, onMessage, MessagePayload } from "firebase/messaging";
import { initMessaging } from "../firebase/config";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";

export function useFCM() {
  const { user } = useAuthStore();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const isInitializing = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("Notifications not supported in this environment.");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        await initializeFCM();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to request notification permission", err);
      return false;
    }
  };

  const initializeFCM = async () => {
    if (isInitializing.current || permission !== "granted" || !user) return;
    
    isInitializing.current = true;
    try {
      const messaging = await initMessaging();
      if (!messaging) {
        console.warn("Firebase Messaging is not supported or failed to initialize.");
        return;
      }

      // Register the service worker with the config query params
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
      const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

      const swRegistration = await navigator.serviceWorker.register(
        `/firebase-messaging-sw.js?apiKey=${apiKey}&projectId=${projectId}&messagingSenderId=${messagingSenderId}&appId=${appId}`
      );

      // Get FCM token
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn("NEXT_PUBLIC_FIREBASE_VAPID_KEY is not defined. Push notifications may not work.");
      }

      const token = await getToken(messaging, { 
        vapidKey, 
        serviceWorkerRegistration: swRegistration 
      });

      if (token) {
        setFcmToken(token);
        
        // Save token to Firestore if not already present
        if (!user.fcmTokens?.includes(token)) {
          const userRef = doc(db, "users", user.id);
          await updateDoc(userRef, {
            fcmTokens: arrayUnion(token)
          });
          console.log("FCM Token saved to user document.");
        }

        // Listen for foreground messages
        onMessage(messaging, (payload: MessagePayload) => {
          console.log("Received foreground message:", payload);
          if (payload.notification) {
            toast(payload.notification.body || "New Notification", {
              icon: '🔔',
              style: {
                background: '#18181b', // zinc-900
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)'
              }
            });
          }
        });
      }
    } catch (err) {
      console.error("Failed to initialize FCM:", err);
    } finally {
      isInitializing.current = false;
    }
  };

  useEffect(() => {
    if (user && permission === "granted" && !fcmToken) {
      initializeFCM();
    }
  }, [user, permission]);

  return { fcmToken, permission, requestPermission };
}
