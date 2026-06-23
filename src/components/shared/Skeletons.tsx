import { Skeleton } from "@/components/ui/skeleton";

function ShimmerOverlay() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-blue-500/10 to-transparent z-10" />
  );
}

export function IssueCardSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-0 shadow-lg">
      <ShimmerOverlay />
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="flex flex-col space-y-4 p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/50 p-6 shadow-sm">
      <ShimmerOverlay />
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-zinc-900/50 border border-white/5">
      <ShimmerOverlay />
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="relative overflow-hidden flex h-[300px] w-full items-end gap-2 rounded-xl border border-white/5 bg-zinc-900/50 p-6">
      <ShimmerOverlay />
      {[40, 70, 45, 90, 65, 85, 55].map((height, i) => (
        <Skeleton 
          key={i} 
          className="w-full rounded-t-md" 
          style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }} 
        />
      ))}
    </div>
  );
}

export function AgentMessageSkeleton() {
  return (
    <div className="relative overflow-hidden flex w-full justify-start mt-4">
      <ShimmerOverlay />
      <div className="flex max-w-[80%] gap-4 flex-row">
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-24 rounded-md" />
          <div className="px-5 py-4 rounded-2xl bg-zinc-900 border border-white/10 rounded-tl-sm w-64 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
