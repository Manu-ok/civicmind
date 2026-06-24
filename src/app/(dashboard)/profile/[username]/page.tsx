"use client";

import { useState, useRef, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useProfile } from "@/lib/hooks/useProfile";
import { FollowButton } from "@/components/social/FollowButton";
import { getUsernameColor } from "@/lib/utils/usernameValidator";
import { IssueCard } from "@/components/issues/IssueCard";
import { FollowNetworkModal } from "@/components/social/FollowNetworkModal";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { 
  MapPin, Calendar, Link as LinkIcon, Edit3, MoreHorizontal, MessageSquare, 
  CheckCircle2, Share, Activity, Users, Shield, Award, Map, Image as ImageIcon, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { SwipeToBack } from "@/components/shared/SwipeToBack";

import { useFollow } from "@/lib/hooks/useFollow";

const TABS = [
  { id: "issues", label: "Issues" },
  { id: "verified", label: "Verified" },
  { id: "activity", label: "Activity" },
  { id: "circles", label: "Circles" },
];

function getBadgeInfo(points: number) {
  if (points >= 5000) return { name: "City Champion", color: "ring-purple-500", bg: "bg-purple-500", icon: Award };
  if (points >= 1000) return { name: "Civic Guardian", color: "ring-amber-500", bg: "bg-amber-500", icon: Shield };
  if (points >= 500) return { name: "Active Citizen", color: "ring-blue-500", bg: "bg-blue-500", icon: Activity };
  return { name: "Rising Star", color: "ring-emerald-500", bg: "bg-emerald-500", icon: Activity };
}

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams.username).toLowerCase();
  const router = useRouter();
  
  const { profile, issues, stories, loading, error, isOwnProfile } = useProfile(username);
  const { isFollowing } = useFollow(profile?.id || "");
  const [activeTab, setActiveTab] = useState("issues");
  const [filterMode, setFilterMode] = useState("all"); // all, reported, verified, resolved

  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [networkModalTab, setNetworkModalTab] = useState<"followers" | "following">("followers");

  const { scrollY } = useScroll();
  const coverY = useTransform(scrollY, [0, 500], [0, 150]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <MapPin className="w-10 h-10 text-zinc-600" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Profile not found</h1>
        <p className="text-zinc-400 mb-6">This user may have changed their username or deleted their account.</p>
        <button onClick={() => router.push('/feed')} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-white transition-colors">
          Return to Feed
        </button>
      </div>
    );
  }

  const userBadge = getBadgeInfo(profile.points || 0);
  const placeholderGradient = getUsernameColor(profile.username || "user");
  const joinedDate = profile.createdAt ? new Date((profile.createdAt as any).seconds ? (profile.createdAt as any).toDate() : profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently";

  // Filter issues based on active tab and filter mode
  let displayIssues = [...issues];
  if (activeTab === "verified") {
    // Ideally we'd fetch verified issues. For now, filter local if we have that logic or show empty.
    displayIssues = []; 
  } else if (activeTab === "issues") {
    if (filterMode === "resolved") displayIssues = issues.filter(i => i.status === "resolved");
    // Add other filters as needed
  }

  return (
    <SwipeToBack>
      <div className="min-h-screen bg-background pb-20 pt-16 md:pt-0">
        
        {/* ── COVER PHOTO AREA ── */}
        <div className="relative w-full h-[180px] md:h-[300px] overflow-hidden group">
          <motion.div style={{ y: coverY }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
            {profile.coverPhotoURL ? (
              <img src={profile.coverPhotoURL} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full opacity-60" style={{ background: placeholderGradient }} />
            )}
          </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {isOwnProfile && (
          <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Edit Cover
          </button>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-8">
        
        {/* ── PROFILE HEADER SECTION ── */}
        <div className="relative -mt-12 sm:-mt-16 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left mb-10">
          
          {/* Avatar Area */}
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative group/avatar shrink-0 z-10 mx-auto md:mx-0"
          >
            <div className={`w-[72px] h-[72px] md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background bg-zinc-900 ${userBadge.color}`}>
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl md:text-4xl font-bold text-zinc-500">
                  {profile.displayName?.charAt(0) || "U"}
                </div>
              )}
            </div>
            
            {/* Verified Badge */}
            {profile.isVerified && (
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-blue-500 border-4 border-background rounded-full flex items-center justify-center" title={profile.verifiedReason || "Verified Citizen"}>
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}

            {isOwnProfile && (
              <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity border-4 border-transparent">
                <Edit3 className="w-6 h-6 text-white" />
              </button>
            )}
          </motion.div>

          {/* Profile Info Area */}
          <div className="flex-1 pt-2 md:pt-16">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white flex items-center justify-center md:justify-start gap-2">
                  {profile.displayName}
                  {profile.isVerified && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
                </h1>
                <p className="text-lg text-zinc-400 font-medium mb-3">@{profile.username}</p>
                
                {profile.verifiedReason && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium rounded-lg mb-3">
                    🏛️ {profile.verifiedReason}
                  </div>
                )}

                {profile.bio && (
                  <p className="text-white/90 text-sm md:text-base mb-4 max-w-2xl leading-relaxed whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-zinc-400">
                  {(profile.ward || profile.city) && (
                    <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                      <MapPin className="w-4 h-4" /> 
                      {profile.ward ? `${profile.ward}, ` : ''}{profile.city || 'India'}
                    </span>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors">
                      <LinkIcon className="w-4 h-4" /> {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Civic since {joinedDate}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 shrink-0">
                {isOwnProfile ? (
                  <>
                    <button onClick={() => router.push('/settings')} className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-colors border border-zinc-700">
                      Edit Profile
                    </button>
                    <button className="bg-zinc-800 hover:bg-zinc-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-zinc-700">
                      <Share className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <FollowButton targetUserId={profile.id} targetUsername={profile.username} size="lg" />
                    <button className="bg-zinc-800 text-zinc-500 w-11 h-11 rounded-full flex items-center justify-center cursor-not-allowed border border-zinc-800" title="Messaging coming soon">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="bg-zinc-800 hover:bg-zinc-700 text-white w-11 h-11 rounded-full flex items-center justify-center transition-colors border border-zinc-700">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:flex items-center justify-center md:justify-start gap-4 md:gap-6 mt-8 p-4 bg-zinc-900/50 rounded-2xl border border-white/5 backdrop-blur-md w-full md:w-auto">
              <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('issues')}>
                <div className="text-xl font-black text-white">
                  <AnimatedCounter value={issues.length} />
                </div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Issues</div>
              </div>
              <div className="hidden md:block w-px h-8 bg-zinc-800" />
              <div 
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  setNetworkModalTab("followers");
                  setIsNetworkModalOpen(true);
                }}
              >
                <div className="text-xl font-black text-white">
                  <AnimatedCounter value={profile.followersCount || 0} />
                </div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Followers</div>
              </div>
              <div className="hidden md:block w-px h-8 bg-zinc-800" />
              <div 
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  setNetworkModalTab("following");
                  setIsNetworkModalOpen(true);
                }}
              >
                <div className="text-xl font-black text-white">
                  <AnimatedCounter value={profile.followingCount || 0} />
                </div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Following</div>
              </div>
              <div className="hidden md:block w-px h-8 bg-zinc-800" />
              <div className="text-center cursor-pointer hover:opacity-80 transition-opacity group relative">
                <div className="text-xl font-black text-yellow-500 flex items-center justify-center gap-1">
                  <AnimatedCounter value={profile.points || 0} />
                </div>
                <div className="text-xs font-bold text-yellow-500/70 uppercase tracking-wider">Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MUTUAL CONNECTIONS ── */}
        {!isOwnProfile && (
          <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-zinc-400 mb-8 border-b border-white/5 pb-8">
            <Users className="w-4 h-4" />
            <span>Followed by community members you might know</span>
          </div>
        )}

        {/* ── STORIES ROW ── */}
        {stories.length > 0 && (
          <div className="mb-10">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Active Stories</h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {stories.map(story => (
                <div key={story.id} className="relative w-20 h-20 shrink-0 rounded-full p-1 bg-gradient-to-tr from-yellow-400 to-fuchsia-600 cursor-pointer hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full border-2 border-background overflow-hidden bg-zinc-800">
                    {story.mediaUrl ? (
                      <img src={story.mediaUrl} alt="Story" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-xs font-bold text-white text-center p-1">
                        Text Story
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PINNED ISSUE ── */}
        {profile.pinnedIssueId && activeTab === "issues" && (
          <div className="mb-10">
            <div className="flex items-center gap-2 text-blue-400 font-bold mb-4">
              <MapPin className="w-5 h-5 fill-current" /> Pinned Issue
            </div>
            {/* Find the pinned issue in our array or show loading placeholder */}
            {issues.find(i => i.id === profile.pinnedIssueId) ? (
              <div className="max-w-2xl">
                <IssueCard issue={issues.find(i => i.id === profile.pinnedIssueId)!} index={0} />
              </div>
            ) : (
              <div className="h-48 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 text-sm">
                Pinned issue loading...
              </div>
            )}
          </div>
        )}

        {/* ── TAB NAVIGATION ── */}
        <div className="relative flex w-full overflow-x-auto border-b border-white/10 mb-8 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {tab.id === "issues" && (
                <span className="ml-2 bg-zinc-800 text-zinc-300 py-0.5 px-2 rounded-full text-xs">{issues.length}</span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="profileTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-[400px]"
          >
            
            {activeTab === "issues" && (
              <div>
                <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                  {['all', 'reported', 'verified', 'resolved'].map(filter => (
                    <button 
                      key={filter}
                      onClick={() => setFilterMode(filter)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                        filterMode === filter ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-white/5'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {profile.isPrivate && !isFollowing && !isOwnProfile ? (
                  <div className="py-20 text-center border border-white/5 rounded-3xl bg-zinc-900/30">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                      <Shield className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">This profile is private</h3>
                    <p className="text-zinc-500 mb-6">Follow @{profile.username} to see their issues and activity.</p>
                  </div>
                ) : displayIssues.length > 0 ? (
                  <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3">
                    {displayIssues.map((issue, i) => (
                      <IssueCard key={issue.id} issue={issue} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border border-white/5 rounded-3xl bg-zinc-900/30">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                      <MapPin className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No issues to show</h3>
                    <p className="text-zinc-500">
                      {filterMode === 'all' 
                        ? `${isOwnProfile ? "You haven't" : `@${profile.username} hasn't`} reported any issues yet.`
                        : `No ${filterMode} issues found.`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="max-w-2xl mx-auto py-8">
                {profile.isPrivate && !isFollowing && !isOwnProfile ? (
                  <div className="py-20 text-center border border-white/5 rounded-3xl bg-zinc-900/30">
                    <Shield className="w-8 h-8 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Activity is private</h3>
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                    {[
                      { action: "Earned a new badge", text: "Civic Guardian", icon: Shield, color: "bg-amber-500 text-white", time: "2 days ago" },
                      { action: "Verified an issue", text: "Broken Streetlight on MG Road", icon: CheckCircle2, color: "bg-green-500 text-white", time: "5 days ago" },
                      { action: "Joined the community", text: joinedDate, icon: Users, color: "bg-blue-500 text-white", time: "Joined" },
                    ].map((item, i) => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md ${item.color}`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs font-bold text-zinc-500">{item.time}</div>
                          </div>
                          <div className="text-sm text-zinc-300">{item.action}</div>
                          <div className="font-bold text-white mt-1">{item.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "verified" && (
              <div className="py-20 text-center text-zinc-500">
                <CheckCircle2 className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <p>Verified issues will appear here.</p>
              </div>
            )}

            {activeTab === "circles" && (
              <div className="py-20 text-center text-zinc-500">
                <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <p>Community circles will appear here.</p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Network Modal */}
        <FollowNetworkModal
          isOpen={isNetworkModalOpen}
          onClose={() => setIsNetworkModalOpen(false)}
          userId={profile.id!}
          initialTab={networkModalTab}
        />
      </div>
      </div>
    </SwipeToBack>
  );
}
