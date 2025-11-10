"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-8">
        <h1 className="text-4xl font-bold mb-6">Messages</h1>
        <p className="text-gray-600 mb-8">Connect and communicate with the community</p>

        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center bg-white rounded-2xl border shadow-sm p-12 max-w-md">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Messages Coming Soon</h2>
              <p className="text-gray-600">
                Direct messaging feature is currently under development. Stay tuned!
              </p>
            </div>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
