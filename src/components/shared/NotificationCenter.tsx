"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, Star, ShieldAlert, Zap, MapPin } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AppNotification, markNotificationRead, markAllNotificationsRead } from "@/lib/firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export function NotificationCenter() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.id, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    if (user) markAllNotificationsRead(user.id);
  };

  const handleNotificationClick = (n: AppNotification) => {
    if (user && n.id && !n.read) markNotificationRead(user.id, n.id);
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'points': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'verified': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'status_change': return <ShieldAlert className="w-4 h-4 text-green-500" />;
      case 'nearby_issue': return <MapPin className="w-4 h-4 text-red-500" />;
      default: return <Zap className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-zinc-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-black">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <h3 className="font-semibold text-zinc-100">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 flex flex-col items-center space-y-2">
                  <Bell className="w-8 h-8 opacity-20" />
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 flex gap-3 cursor-pointer hover:bg-zinc-800/50 transition-colors ${!n.read ? 'bg-blue-500/5' : ''}`}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-sm ${!n.read ? 'text-zinc-100 font-medium' : 'text-zinc-300'}`}>
                            {n.title}
                          </p>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-medium">
                          {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
