"use client";

import { Home, Search, Plus, MessageCircle, User, Bell, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl rounded-2xl border transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5"
          : "bg-white/95 backdrop-blur-sm shadow-md"
      }`}
    >
      <div className="flex items-center justify-between px-8 py-3.5">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-black">Crowd</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Up</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 transition-transform hover:scale-110 shadow-lg shadow-orange-500/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </button>

        {/* Navigation Icons - Container with better spacing */}
        <nav className="flex items-center gap-4 rounded-2xl bg-gray-50/80 px-6 py-2.5 border border-gray-200/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className={`rounded-xl transition-all hover:scale-105 h-10 w-10 ${
              isActive("/") ? "bg-gray-300 text-gray-900 hover:bg-gray-400" : "hover:bg-gray-200"
            }`}
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/search")}
            className={`rounded-xl transition-all hover:scale-105 h-10 w-10 ${
              isActive("/search") ? "bg-gray-300 text-gray-900 hover:bg-gray-400" : "hover:bg-gray-200"
            }`}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/create")}
            className="rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 transition-all hover:scale-105 shadow-lg shadow-orange-500/30 h-10 w-10"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/messages")}
            className={`rounded-xl transition-all hover:scale-105 h-10 w-10 ${
              isActive("/messages") ? "bg-gray-300 text-gray-900 hover:bg-gray-400" : "hover:bg-gray-200"
            }`}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/profile/lorenzo")}
            className={`rounded-xl transition-all hover:scale-105 h-10 w-10 ${
              pathname.startsWith("/profile") ? "bg-gray-300 text-gray-900 hover:bg-gray-400" : "hover:bg-gray-200"
            }`}
          >
            <User className="h-5 w-5" />
          </Button>
        </nav>

        {/* User Section with Notification */}
        <div className="flex items-center gap-3">
          {/* Notification Bell - Far Right */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl transition-all hover:scale-105 hover:bg-gray-100 h-10 w-10"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-xs text-white font-medium animate-pulse shadow-lg shadow-orange-500/40">
              3
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2.5 rounded-xl hover:bg-gray-100 transition-all px-3 py-2 h-auto">
                <Avatar className="h-9 w-9 bg-gradient-to-br from-yellow-400 to-orange-500 ring-2 ring-orange-200 transition-all hover:ring-4">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-semibold">L</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Lorenzo Adacher</p>
                  <p className="text-xs text-gray-500">@Loacky</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push("/profile/lorenzo")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}