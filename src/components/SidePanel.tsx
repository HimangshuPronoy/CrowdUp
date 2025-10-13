"use client";

import { useEffect, useState } from "react";
import { X, Filter, Sparkles, Compass, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export const SidePanel = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("open-sidepanel", openHandler as EventListener);
    window.addEventListener("keydown", closeOnEsc);
    return () => {
      window.removeEventListener("open-sidepanel", openHandler as EventListener);
      window.removeEventListener("keydown", closeOnEsc);
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-[60] transition-all ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-[380px] max-w-[85vw] translate-x-full border-l bg-white/80 backdrop-blur-xl shadow-2xl shadow-black/10 transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b bg-white/70 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-violet-500" />
            <p className="text-sm font-semibold">Quick Panel</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="space-y-6 px-5 py-5">
          {/* Actions Card */}
          <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-orange-500" />
              Suggested actions
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                { label: "Create Post", desc: "Share feedback", color: "from-orange-500 to-pink-500" },
                { label: "Trending", desc: "Hot topics", color: "from-violet-500 to-indigo-500" },
                { label: "Discover", desc: "Find groups", color: "from-emerald-500 to-teal-500" },
                { label: "Messages", desc: "Chat now", color: "from-sky-500 to-cyan-500" },
              ].map((a) => (
                <button
                  key={a.label}
                  className="group rounded-xl border p-3 text-left transition-colors hover:bg-gray-50"
                  onClick={() => {
                    const to =
                      a.label === "Create Post"
                        ? "/create"
                        : a.label === "Trending"
                        ? "/trending"
                        : a.label === "Discover"
                        ? "/search"
                        : "/messages";
                    window.location.href = to;
                  }}
                >
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${a.color} opacity-90`} />
                  <p className="mt-2 text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-gray-500">{a.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Filter className="h-4 w-4 text-orange-500" /> Filters
            </div>
            <div className="mt-3 space-y-3">
              {[
                "Bug Reports",
                "Feature Requests",
                "Complaints",
                "Top Voted",
              ].map((f) => (
                <label key={f} className="flex items-center justify-between rounded-lg border p-2 hover:bg-gray-50">
                  <span className="text-sm">{f}</span>
                  <input type="checkbox" className="size-4 accent-orange-500" defaultChecked={f === "Top Voted"} />
                </label>
              ))}
            </div>
            <Button className="mt-3 w-full rounded-full bg-orange-500 hover:bg-orange-600">Apply</Button>
          </div>

          {/* Explore */}
          <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Compass className="h-4 w-4 text-orange-500" /> Explore
            </div>
            <div className="mt-3 space-y-2">
              {[
                { t: "Top Communities", href: "/trending" },
                { t: "Latest Companies", href: "/search" },
                { t: "Your Messages", href: "/messages" },
              ].map((i) => (
                <button
                  key={i.t}
                  onClick={() => (window.location.href = i.href)}
                  className="group flex w-full items-center justify-between rounded-lg border p-2 text-left hover:bg-gray-50"
                >
                  <span className="text-sm">{i.t}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SidePanel;