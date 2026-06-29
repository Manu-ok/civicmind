"use client";

import { useState } from "react";
import { useCircles } from "@/lib/hooks/useCircles";
import { CircleCard } from "@/components/circles/CircleCard";
import { CreateCircleModal } from "@/components/circles/CreateCircleModal";
import { Users, Search, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CirclesPage() {
  const { myCircles, discoverableCircles, loading, joinCircle, leaveCircle, refresh } = useCircles();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDiscover = discoverableCircles.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.ward.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-6 pb-24 md:pb-12 max-w-7xl mx-auto px-4 md:px-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" /> Your Circles
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-2">Connect with your community and stay updated on local issues.</p>
        </div>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Create Circle
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* MY CIRCLES */}
          <section>
            <h2 className="text-xl font-black text-white mb-6">Circles you&apos;ve joined</h2>
            {myCircles.length === 0 ? (
              <div className="bg-slate-50 dark:bg-zinc-950 border border-white/5 border-dashed rounded-3xl p-10 text-center">
                <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">You haven&apos;t joined any circles yet</h3>
                <p className="text-slate-500 dark:text-zinc-500 mb-6 max-w-md mx-auto">Discover official community groups or start your own to get connected.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCircles.map(circle => (
                  <CircleCard 
                    key={circle.id} 
                    circle={circle} 
                    isMember={true} 
                    onJoinLeave={leaveCircle}
                  />
                ))}
              </div>
            )}
          </section>

          {/* DISCOVER CIRCLES */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-8 border-t border-white/5">
              <h2 className="text-xl font-black text-white">Discover in your city</h2>
              
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search circles or wards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white dark:bg-zinc-900 border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-full md:w-64"
                />
              </div>
            </div>

            {filteredDiscover.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-zinc-500 font-medium">
                No circles found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDiscover.map(circle => (
                  <CircleCard 
                    key={circle.id} 
                    circle={circle} 
                    isMember={false} 
                    onJoinLeave={joinCircle}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      )}

      <CreateCircleModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={refresh}
      />
    </div>
  );
}
