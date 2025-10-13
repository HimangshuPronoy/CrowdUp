"use client";

import { TrendingUp, Users, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const router = useRouter();
  const [trendingOpen, setTrendingOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);

  const trendingGroups = [
    { name: "Instagram", followers: "15.4K", growth: "+12%", initial: "I", color: "bg-gradient-to-br from-purple-500 to-pink-500", id: "instagram" },
    { name: "WhatsApp", followers: "12.3K", growth: "+8%", initial: "W", color: "bg-green-500", id: "whatsapp" },
    { name: "Spotify", followers: "9.8K", growth: "+15%", initial: "S", color: "bg-green-600", id: "spotify" },
    { name: "Discord", followers: "8.7K", growth: "+5%", initial: "D", color: "bg-indigo-500", id: "discord" },
  ];

  return (
    <div className="space-y-4 sticky top-24">
      {/* Community Feed */}
      <div className="rounded-xl border bg-gradient-to-br from-orange-50 to-orange-100 p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          <h3 className="font-bold text-lg">Community Feed</h3>
        </div>
        <p className="text-sm text-gray-600">
          Latest feedback and suggestions from the community
        </p>
      </div>

      {/* Trending Groups */}
      <div className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
        <button
          onClick={() => setTrendingOpen(!trendingOpen)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <h3 className="font-bold text-lg">Trending Group</h3>
          </div>
          <ChevronDown 
            className={cn(
              "h-5 w-5 text-gray-400 transition-transform duration-300",
              !trendingOpen && "-rotate-180"
            )}
          />
        </button>
        
        <div 
          className={cn(
            "overflow-hidden transition-all duration-300",
            trendingOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-6 pb-6 space-y-3">
            {trendingGroups.map((group) => (
              <button
                key={group.name}
                onClick={() => router.push(`/company/${group.id}`)}
                className="w-full flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-all hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <Avatar className={`h-10 w-10 ${group.color} ring-2 ring-gray-100 transition-all hover:ring-4`}>
                    <AvatarFallback className={`${group.color} text-white font-semibold`}>
                      {group.initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{group.name}</p>
                    <p className="text-xs text-gray-500">{group.followers} followers</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">{group.growth}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
        <button
          onClick={() => setStatsOpen(!statsOpen)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            <h3 className="font-bold text-lg">Community</h3>
          </div>
          <ChevronDown 
            className={cn(
              "h-5 w-5 text-gray-400 transition-transform duration-300",
              !statsOpen && "-rotate-180"
            )}
          />
        </button>
        
        <div 
          className={cn(
            "overflow-hidden transition-all duration-300",
            statsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-6 pb-6 space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-orange-50 transition-all">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="font-bold text-orange-500">24.7K</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-orange-50 transition-all">
              <span className="text-sm text-gray-600">Posts Today</span>
              <span className="font-bold text-orange-500">156</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-orange-50 transition-all">
              <span className="text-sm text-gray-600">Companies</span>
              <span className="font-bold text-orange-500">847</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}