"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, Star, ShieldAlert, Zap, MapPin, MessageSquare, ThumbsUp, UserPlus, Users, Image as ImageIcon, Check } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AppNotification, markNotificationRead, markAllNotificationsRead } from "@/lib/firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | "social" | "issues" | "achievements";

export function NotificationCenter() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevUnreadCount = useRef(0);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.id, "notifications"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      
      setNotifications(notifs);

      // Handle real-time toasts
      if (!isFirstLoad.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const newNotif = change.doc.data() as AppNotification;
            if (!newNotif.read) {
              toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-zinc-900 border border-white/10 shadow-2xl rounded-2xl pointer-events-auto flex items-start gap-3 p-4`}>
                  {newNotif.actorPhotoUrl ? (
                    <Image fill src={newNotif.actorPhotoUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white mb-0.5">{newNotif.title}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">{newNotif.message}</p>
                  </div>
                </div>
              ), { duration: 4000 });
            }
          }
        });
      }
      isFirstLoad.current = false;
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

  useEffect(() => {
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  const hasNew = unreadCount > prevUnreadCount.current;

  const handleMarkAllRead = () => {
    if (user) markAllNotificationsRead(user.id);
  };

  const handleNotificationClick = (n: AppNotification) => {
    if (user && n.id && !n.read) markNotificationRead(user.id, n.id);
    setIsOpen(false);

    // Route based on type
    if (n.issueId) {
      router.push(`/issues/${n.issueId}`);
    } else if (n.actorUsername) {
      router.push(`/profile/${n.actorUsername}`);
    } else if (n.circleId) {
      router.push(`/circles/${n.circleId}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'points': 
      case 'achievement': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'verified': 
      case 'issue_resolved': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'status_change': return <ShieldAlert className="w-5 h-5 text-blue-500" />;
      case 'nearby_issue': return <MapPin className="w-5 h-5 text-red-500" />;
      case 'new_follower': return <UserPlus className="w-5 h-5 text-fuchsia-500" />;
      case 'comment_on_issue':
      case 'mention': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'reaction_on_issue': return <ThumbsUp className="w-5 h-5 text-orange-500" />;
      case 'circle_invite': return <Users className="w-5 h-5 text-violet-500" />;
      case 'story_interaction': return <ImageIcon className="w-5 h-5 text-pink-500" />;
      default: return <Zap className="w-5 h-5 text-purple-500" />;
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "social") return ['new_follower', 'mention', 'comment_on_issue', 'reaction_on_issue', 'story_interaction', 'circle_invite'].includes(n.type);
    if (filter === "issues") return ['status_change', 'nearby_issue', 'verified', 'issue_resolved'].includes(n.type);
    if (filter === "achievements") return ['points', 'achievement'].includes(n.type);
    return true;
  });

  // Group notifications
  const groupedNotifications = filteredNotifications.reduce((acc, notif) => {
    const date = notif.createdAt.toDate();
    let group = "Older";
    if (isToday(date)) group = "Today";
    else if (isYesterday(date)) group = "Yesterday";
    else if (isThisWeek(date)) group = "This Week";

    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {} as Record<string, AppNotification[]>);

  const groupOrder = ["Today", "Yesterday", "This Week", "Older"];

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 dark:bg-zinc-800 transition-colors"
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={hasNew ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Bell className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
        </motion.div>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span 
              key={unreadCount}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1, 1.5, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-black"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-50 dark:bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white dark:bg-zinc-900/50 backdrop-blur-md">
              <h3 className="font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 p-3 border-b border-white/5 overflow-x-auto no-scrollbar">
              {(["all", "social", "issues", "achievements"] as CategoryFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                    filter === f ? "bg-white text-black" : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:text-white"
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-2 space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-zinc-600" />
                  </div>
                  <p className="text-slate-500 dark:text-zinc-500 text-sm font-bold">No notifications found</p>
                  <p className="text-zinc-600 text-xs mt-1">You&apos;re all caught up!</p>
                </div>
              ) : (
                groupOrder.map(group => {
                  if (!groupedNotifications[group]) return null;
                  return (
                    <div key={group} className="space-y-1">
                      <div className="px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider sticky top-0 bg-slate-50 dark:bg-zinc-950/80 backdrop-blur-md z-10">
                        {group}
                      </div>
                      {groupedNotifications[group].map((n) => (
                        <div 
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={cn(
                            "relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors",
                            !n.read ? "bg-blue-500/5 hover:bg-blue-500/10" : "hover:bg-white dark:bg-zinc-900"
                          )}
                        >
                          {!n.read && (
                            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                          )}
                          
                          <div className={cn("relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center", !n.actorPhotoUrl && "bg-slate-100 dark:bg-zinc-800")}>
                            {n.actorPhotoUrl ? (
                              <Image fill src={n.actorPhotoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              getIcon(n.type)
                            )}
                            {/* Type badge on avatar */}
                            {n.actorPhotoUrl && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-950 flex items-center justify-center">
                                {React.cloneElement(getIcon(n.type) as React.ReactElement<any>, { className: "w-3 h-3" })}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 pr-1">
                            <p className="text-sm text-zinc-200 line-clamp-2 leading-snug">
                              {n.actorUsername ? (
                                <Link href={`/profile/${n.actorUsername}`} className="font-bold text-white hover:underline mr-1" onClick={(e) => e.stopPropagation()}>
                                  {n.actorName} <span className="text-slate-500 dark:text-zinc-400 font-normal">@{n.actorUsername}</span>
                                </Link>
                              ) : (
                                <span className="font-bold text-white">{n.actorName || n.title} </span>
                              )}
                              {n.message.replace(n.actorName + ' ', '')}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1 font-medium">
                              {formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true })}
                            </p>
                          </div>

                          {/* Action area / Thumbnail */}
                          {n.type === 'new_follower' && (
                            <button className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                              Follow
                            </button>
                          )}
                          {/* We don't have issue thumbnail URL in notification yet, but we can put a placeholder */}
                          {n.issueId && !['new_follower', 'achievement', 'circle_invite'].includes(n.type) && (
                            <div className="shrink-0 w-12 h-12 rounded-lg bg-slate-100 dark:bg-zinc-800 overflow-hidden ml-2 flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-zinc-600" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-white dark:bg-zinc-900/30 text-center">
              <button 
                onClick={() => { setIsOpen(false); router.push('/settings?tab=notifications'); }}
                className="text-xs text-slate-500 dark:text-zinc-500 hover:text-white transition-colors"
              >
                Notification Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
