"use client";

import Header from "@/components/Header";
import { MessageCircle, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center">
                <MessageCircle className="h-12 w-12 text-orange-500" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Send className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-3">Messages Coming Soon!</h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Direct messaging feature is currently in development. Soon you'll be able to chat with other community members and company representatives.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="p-4 bg-gray-50 rounded-lg">
              <MessageCircle className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-semibold mb-1">Direct Messages</p>
              <p className="text-xs text-gray-600">Chat with users privately</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-semibold mb-1">Group Chats</p>
              <p className="text-xs text-gray-600">Create discussion groups</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Send className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-semibold mb-1">Real-time</p>
              <p className="text-xs text-gray-600">Instant message delivery</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
            >
              Back to Home
            </Button>
            <Button
              onClick={() => window.location.href = '/create'}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Create a Post Instead
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
