"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Upload, ChevronRight, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useAuthStore } from "@/lib/stores/authStore";
import { 
  checkUsernameAvailability, 
  claimUsername, 
  getSuggestedUsers, 
  followUser 
} from "@/lib/firebase/social";
import { SocialUser } from "@/lib/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

enum Step {
  USERNAME = 1,
  PROFILE = 2,
  COMMUNITY = 3,
}

export default function OnboardingPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [step, setStep] = useState<Step>(Step.USERNAME);
  const [direction, setDirection] = useState(1);

  // Step 1 State
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Step 2 State
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState(user?.city || "");
  const [ward, setWard] = useState(user?.ward || "");
  const [website, setWebsite] = useState("");

  // Step 3 State
  const [suggestedUsers, setSuggestedUsers] = useState<SocialUser[]>([]);
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (user?.hasCompletedOnboarding) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (step === Step.COMMUNITY && user) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
      });
      
      const loadSuggestions = async () => {
        try {
          const users = await getSuggestedUsers(user.id, city || "Mumbai", ward || "");
          setSuggestedUsers(users.slice(0, 5));
        } catch (e) {
          console.error(e);
        }
      };
      loadSuggestions();
    }
  }, [step, user, city, ward]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (username.length < 3) {
      setIsAvailable(null);
      setUsernameError(null);
      return;
    }

    setIsChecking(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(username);
        setIsAvailable(result.available);
        setUsernameError(result.reason);
        if (result.suggestions) {
          setSuggestions(result.suggestions);
        }
      } catch (err) {
        console.error(err);
        setIsAvailable(false);
        setUsernameError("Error checking username");
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  const goToNextStep = () => {
    setDirection(1);
    setStep(prev => prev + 1);
  };

  const handleFinish = async () => {
    if (!user || !username) return;
    setIsFinishing(true);
    try {
      // 1. Claim username
      await claimUsername(user.id, username);
      
      // 2. Update additional profile fields
      await updateDoc(doc(db, 'users', user.id), {
        displayName,
        bio,
        city,
        ward,
        website
      });
      
      // 3. Follow selected users
      for (const id of Array.from(followedUserIds)) {
        await followUser(user.id, id).catch(console.error);
      }
      
      // Force reload auth state ideally, then redirect to feed
      // Using window.location.href to ensure the app re-mounts with fresh user data
      window.location.href = "/feed";
    } catch (err) {
      console.error(err);
      alert("Failed to complete onboarding. Username might be taken.");
      setIsFinishing(false);
    }
  };

  const toggleFollow = (id: string) => {
    const newSet = new Set(followedUserIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setFollowedUserIds(newSet);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    })
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 px-4 py-8">
        {/* Progress indicator */}
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-2 rounded-full transition-all duration-500 ${s === step ? "w-10 bg-blue-500" : s < step ? "w-3 bg-blue-500/50" : "w-3 bg-slate-800"}`}
            />
          ))}
        </div>

        <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-6 md:p-10 rounded-[2rem] shadow-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            
            {/* STEP 1: USERNAME */}
            {step === Step.USERNAME && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center mb-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-blue-500/20">
                    CM
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black mb-3 text-white tracking-tight">Choose your @username</h1>
                  <p className="text-slate-400">This is how the community will know you. Choose wisely.</p>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold text-xl">@</span>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl py-4 pl-12 pr-14 text-xl font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all shadow-inner"
                    placeholder="username"
                    maxLength={30}
                  />
                  <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
                    {isChecking ? (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : username.length >= 3 ? (
                      isAvailable ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </motion.div>
                      ) : (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <X className="w-6 h-6 text-red-500" />
                        </motion.div>
                      )
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-sm px-1">
                  <div className="flex-1">
                    {username.length > 0 && username.length < 3 && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Minimum 3 characters
                      </motion.span>
                    )}
                    {isAvailable && username.length >= 3 && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 flex items-center gap-1.5 font-medium">
                        <Check className="w-4 h-4" /> @{username} is available!
                      </motion.span>
                    )}
                    {!isAvailable && usernameError && username.length >= 3 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 flex flex-col gap-3">
                        <span className="flex items-center gap-1.5">
                          <X className="w-4 h-4" /> {usernameError}
                        </span>
                        {suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-slate-500 text-xs w-full mb-1">Suggestions:</span>
                            {suggestions.map(s => (
                              <button
                                key={s}
                                onClick={() => setUsername(s)}
                                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 transition-all active:scale-95"
                              >
                                @{s}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                  <span className="text-slate-500 font-mono text-xs">{username.length}/30</span>
                </div>

                <div className="bg-slate-950/30 p-5 rounded-2xl border border-slate-800/50 text-sm mt-2 space-y-3 text-slate-400">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-4 h-4 ${username.length >= 3 && username.length <= 30 ? 'text-green-500' : 'text-slate-600'}`} />
                    3-30 characters
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-4 h-4 ${/^[a-z0-9_.]+$/.test(username || 'a') ? 'text-green-500' : 'text-slate-600'}`} />
                    Letters, numbers, dots, underscores only
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-4 h-4 ${username && !username.startsWith('.') && !username.startsWith('_') && !username.endsWith('.') && !username.endsWith('_') ? 'text-green-500' : 'text-slate-600'}`} />
                    Cannot start or end with special characters
                  </div>
                </div>

                <button
                  onClick={goToNextStep}
                  disabled={!isAvailable || username.length < 3 || isChecking}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-500/20"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: PROFILE */}
            {step === Step.PROFILE && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center mb-2">
                  <h2 className="text-3xl font-black text-white tracking-tight mb-2">Complete your profile</h2>
                  <p className="text-slate-400">Tell the community a bit about yourself.</p>
                </div>

                <div className="flex justify-center mb-2">
                  <div className="relative group cursor-pointer">
                    <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-slate-700/50 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-black text-slate-500">{displayName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Display Name *</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Bio</label>
                      <span className="text-xs text-slate-500 font-mono">{bio.length}/160</span>
                    </div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={160}
                      rows={3}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 resize-none transition-all"
                      placeholder="Passionate about clean streets and green parks..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all"
                        placeholder="e.g. Mumbai"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Ward / Locality</label>
                      <input
                        type="text"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all"
                        placeholder="e.g. Andheri West"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-2">
                  <button
                    onClick={goToNextStep}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={goToNextStep}
                    disabled={!displayName}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                  >
                    Next Step
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: COMMUNITY */}
            {step === Step.COMMUNITY && (
              <motion.div
                key="step3"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center mb-2">
                  <h2 className="text-3xl font-black text-white tracking-tight mb-2">Welcome, @{username}! 🎉</h2>
                  <p className="text-slate-400">Follow some active citizens in {city || "your area"} to get your feed started.</p>
                </div>

                <div className="bg-slate-950/50 rounded-2xl border border-slate-800/50 p-2 space-y-1 max-h-[240px] overflow-y-auto custom-scrollbar">
                  {suggestedUsers.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-500 text-sm">Finding top citizens...</span>
                    </div>
                  ) : (
                    suggestedUsers.map(su => (
                      <div key={su.id} className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <img src={su.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${su.displayName}`} alt={su.displayName} className="w-10 h-10 rounded-full border border-slate-700" />
                          <div>
                            <div className="font-bold text-sm text-white flex items-center gap-1.5">
                              {su.displayName}
                              {su.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                            </div>
                            <div className="text-xs text-slate-500">@{su.username || su.displayName.toLowerCase().replace(/\s/g, '')}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFollow(su.id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                            followedUserIds.has(su.id) 
                              ? 'bg-slate-700 text-slate-300' 
                              : 'bg-blue-600 hover:bg-blue-500 text-white'
                          }`}
                        >
                          {followedUserIds.has(su.id) ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {ward && (
                  <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/20 border border-indigo-500/30 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <div className="font-black text-indigo-300 text-base mb-1">Discover Your Ward&apos;s Circle</div>
                      <div className="text-xs text-indigo-200/70 font-medium">Join the {ward} community</div>
                    </div>
                    <button className="relative z-10 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-900/50">
                      Join Circle
                    </button>
                  </div>
                )}

                <button
                  onClick={handleFinish}
                  disabled={isFinishing}
                  className="w-full bg-white hover:bg-slate-200 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 mt-4 shadow-xl"
                >
                  {isFinishing ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Start Exploring"
                  )}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}
