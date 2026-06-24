import { FeedItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, UserPlus, CheckCircle2, AtSign, ArrowUpRight } from "lucide-react";

export function FeedItemCard({ item }: { item: FeedItem }) {
  const router = useRouter();

  const timeAgo = item.createdAt 
    ? formatDistanceToNow(new Date((item.createdAt as any).seconds ? (item.createdAt as any).toDate() : item.createdAt), { addSuffix: true })
    : "Just now";

  if (item.type === "followed_you") {
    return (
      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-4 mb-4 flex items-center gap-4 cursor-pointer hover:bg-zinc-900/80 transition-colors group" onClick={() => router.push(`/profile/${item.actorUsername}`)}>
        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform">
          <UserPlus className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
              {item.actorPhotoURL ? (
                <img src={item.actorPhotoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                  {item.actorDisplayName.charAt(0)}
                </div>
              )}
            </div>
            <span className="font-bold text-white text-sm">{item.actorDisplayName}</span>
            {item.actorIsVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
            <span className="text-zinc-500 text-sm">started following you</span>
          </div>
          <div className="text-xs font-medium text-zinc-600">{timeAgo}</div>
        </div>
      </div>
    );
  }

  if (item.type === "mentioned_you" || item.type === "issue_commented") {
    return (
      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-4 mb-4 cursor-pointer hover:bg-zinc-900/80 transition-colors" onClick={() => router.push(`/issues/${item.issueId}`)}>
        <div className="flex items-center gap-3 mb-3">
           <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
              {item.actorPhotoURL ? (
                <img src={item.actorPhotoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-500">
                  {item.actorDisplayName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-white text-sm truncate">{item.actorDisplayName}</span>
                <span className="text-zinc-500 text-sm truncate">{item.type === "mentioned_you" ? "mentioned you in a comment" : "commented on your issue"}</span>
              </div>
              <div className="text-xs font-medium text-zinc-600">{timeAgo}</div>
            </div>
        </div>
        
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 mb-3 text-sm text-zinc-300">
          &quot;{item.commentPreview}...&quot;
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
          <ArrowUpRight className="w-4 h-4" />
          View on {item.issueTitle}
        </div>
      </div>
    );
  }

  // issue_reported or default issue display
  return (
    <div className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden mb-6 hover:border-white/10 transition-colors cursor-pointer group" onClick={() => router.push(`/issues/${item.issueId}`)}>
      <div className="p-4 flex items-center gap-3 border-b border-white/5">
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); router.push(`/profile/${item.actorUsername}`); }}>
          {item.actorPhotoURL ? (
            <img src={item.actorPhotoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-500">
              {item.actorDisplayName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold text-white text-sm truncate hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); router.push(`/profile/${item.actorUsername}`); }}>
              {item.actorDisplayName}
            </span>
            {item.actorIsVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
          </div>
          <div className="text-xs font-medium text-zinc-500">Reported an issue • {timeAgo}</div>
        </div>
      </div>
      
      {item.issueThumbnail && (
        <div className="w-full h-64 bg-zinc-900 relative">
          <img src={item.issueThumbnail} alt="Issue" className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          {item.issueSeverity === "high" || item.issueSeverity === "critical" ? (
            <span className="px-2.5 py-1 bg-red-500/10 text-red-500 text-xs font-black tracking-wide rounded-full uppercase">{item.issueSeverity}</span>
          ) : (
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 text-xs font-black tracking-wide rounded-full uppercase">{item.issueSeverity || 'Normal'}</span>
          )}
          <span className="text-xs font-bold text-zinc-500 capitalize px-2.5 py-1 bg-zinc-900 rounded-full border border-white/5">{item.issueCategory?.replace('_', ' ')}</span>
        </div>
        
        <h3 className="text-xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors line-clamp-2">{item.issueTitle}</h3>
        
        <div className="flex items-center gap-6 text-zinc-500 font-bold text-sm">
          <button className="flex items-center gap-2 hover:text-red-500 transition-colors"><Heart className="w-5 h-5" /> Upvote</button>
          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors"><MessageCircle className="w-5 h-5" /> Discuss</button>
          <button className="flex items-center gap-2 hover:text-green-500 transition-colors ml-auto"><Share2 className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}
