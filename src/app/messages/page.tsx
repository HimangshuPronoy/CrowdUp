"use client";

import Header from "@/components/Header";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function MessagesPage() {
  const conversations = [
    { id: 1, name: "Chico", username: "@chico", initials: "C", unread: true, preview: "Hey, today here we right that definitely I..." },
  ];

  const messages = [
    {
      id: 1,
      sender: "Chico",
      text: "Bro, today here we right that definitely I think we finally cracked that use! how bout.",
      time: "2h ago",
      isOwn: false,
    },
    {
      id: 2,
      sender: "You",
      text: "It's like not until the grid bubbling the whole product feels smooth, funny how that works.",
      time: "1h ago",
      isOwn: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-8">
        <h1 className="text-4xl font-bold mb-6">Messages</h1>
        <p className="text-gray-600 mb-8">Connect and Communicate with the community</p>

        <div className="flex gap-6 h-[600px]">
          {/* Conversations List */}
          <div className="w-80 rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-4 border-b">
              <h2 className="font-bold">Conversations</h2>
            </div>
            <div className="overflow-y-auto">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer bg-orange-50 transition-all"
                >
                  <Avatar className="h-12 w-12 bg-gray-800">
                    <AvatarFallback className="bg-gray-800 text-white">
                      {conv.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm">{conv.name}</p>
                      {conv.unread && (
                        <span className="text-xs text-orange-600 font-medium">unread</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{conv.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 rounded-xl border bg-white flex flex-col shadow-sm hover:shadow-md transition-all">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b">
              <Avatar className="h-10 w-10 bg-gray-800">
                <AvatarFallback className="bg-gray-800 text-white">C</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Chico</p>
                <p className="text-xs text-green-600 font-medium">Active Now</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 bg-gray-800 flex-shrink-0">
                    <AvatarFallback className="bg-gray-800 text-white text-xs">
                      {message.isOwn ? "Y" : "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-md rounded-2xl px-4 py-2 ${
                      message.isOwn ? "bg-gray-100" : "bg-white border"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="type a message..."
                  className="rounded-full"
                />
                <Button size="icon" className="rounded-full bg-orange-500 hover:bg-orange-600 transition-all hover:scale-110">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}