"use client";

import { Circle } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Users, ShieldCheck, Activity, MapPin } from "lucide-react";

interface CircleCardProps {
  circle: Circle;
  isMember?: boolean;
  onJoinLeave?: (circleId: string, isJoining: boolean) => void;
}

export function CircleCard({ circle, isMember = false, onJoinLeave }: CircleCardProps) {
  const router = useRouter();

  return (
    <div 
      className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all cursor-pointer group hover:-translate-y-1"
      onClick={() => router.push(`/circles/${circle.id}`)}
    >
      {/* Cover / Icon Area */}
      <div className="h-32 bg-gradient-to-tr from-blue-500/20 to-fuchsia-500/20 relative flex items-center justify-center border-b border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="w-16 h-16 bg-zinc-900 border-2 border-zinc-800 rounded-2xl flex items-center justify-center text-3xl shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform">
          {circle.iconEmoji}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5 font-black text-white text-lg leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
            {circle.name}
            {circle.isOfficial && <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-4">
          <MapPin className="w-3.5 h-3.5" />
          {circle.ward}, {circle.city}
        </div>

        <div className="flex items-center gap-4 text-sm font-bold text-zinc-400 mb-6">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-500" />
            {circle.memberCount} <span className="font-normal text-zinc-600">members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            {circle.issueCount} <span className="font-normal text-zinc-600">issues</span>
          </div>
        </div>

        {onJoinLeave && (
          <button 
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
              isMember 
                ? "bg-zinc-900 text-zinc-400 hover:bg-red-500/10 hover:text-red-500" 
                : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onJoinLeave(circle.id, !isMember);
            }}
          >
            {isMember ? "Leave Circle" : "Join Circle"}
          </button>
        )}
      </div>
    </div>
  );
}
