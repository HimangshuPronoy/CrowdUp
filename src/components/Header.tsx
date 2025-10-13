"use client";

import { Home, Search, Plus, MessageCircle, User, Bell, ChevronDown, PanelRight, Bookmark } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl rounded-2xl border transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5"
          : "bg-white/95 backdrop-blur-sm shadow-md"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-black">Crowd</span>
            <span className="text-2xl font-bold text-orange-500">Up</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 transition-transform hover:scale-110">
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

        {/* Navigation Icons */}
        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className={`rounded-full transition-all hover:scale-110 ${
              isActive("/") ? "bg-orange-500 text-white hover:bg-orange-600" : ""
            }`}
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/search")}
            className={`rounded-full transition-all hover:scale-110 ${
              isActive("/search") ? "bg-orange-500 text-white hover:bg-orange-600" : ""
            }`}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/create")}
            className="rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-all hover:scale-110"
          >
            <Plus className="h-5 w-5" />
          </Button>
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/bookmarks")}
              className={`rounded-full transition-all hover:scale-110 ${
                isActive("/bookmarks") ? "bg-orange-500 text-white hover:bg-orange-600" : ""
              }`}
            >
              <Bookmark className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/messages")}
            className={`rounded-full transition-all hover:scale-110 ${
              isActive("/messages") ? "bg-orange-500 text-white hover:bg-orange-600" : ""
            }`}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/profile/${profile?.username || 'user'}`)}
            className={`rounded-full transition-all hover:scale-110 ${
              pathname.startsWith("/profile") ? "bg-orange-500 text-white hover:bg-orange-600" : ""
            }`}
          >
            <User className="h-5 w-5" />
          </Button>
          {/* Side Panel Toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open quick panel"
            onClick={() => window.dispatchEvent(new Event("open-sidepanel"))}
            className="rounded-full transition-all hover:scale-110"
          >
            <PanelRight className="h-5 w-5" />
          </Button>
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="relative">
                <Button variant="ghost" size="icon" className="rounded-full transition-all hover:scale-110">
                  <Bell className="h-5 w-5" />
                </Button>
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white animate-pulse">
                  3
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 rounded-full hover:bg-gray-100 transition-all">
                    <Avatar className="h-8 w-8 bg-orange-500 ring-2 ring-orange-200 transition-all hover:ring-4">
                      <AvatarFallback className="bg-orange-500 text-white">
                        {profile?.full_name?.[0] || profile?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-semibold">{profile?.full_name || "User"}</p>
                      <p className="text-xs text-gray-500">@{profile?.username || "user"}</p>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push(`/profile/${profile?.username}`)}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/bookmarks")}>
                    Bookmarks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/activity")}>
                    Activity
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push("/auth/login")}
                className="rounded-full"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/auth/signup")}
                className="rounded-full bg-orange-500 hover:bg-orange-600"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}