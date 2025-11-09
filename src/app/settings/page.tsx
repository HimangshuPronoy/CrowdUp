"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">Manage your account settings and preferences</p>

        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
          
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-orange-200">
                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-3xl">L</AvatarFallback>
              </Avatar>
              <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <p className="font-semibold mb-1">Profile Picture</p>
              <p className="text-sm text-gray-600 mb-2">Upload a new profile picture</p>
              <Button variant="outline" size="sm" className="hover:border-orange-500 hover:text-orange-500 transition-colors">
                Change Photo
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Lorenzo Adacher" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="@Loacky" className="mt-2" />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                defaultValue="Product designer & tech enthusiast. Passionate about creating better user experiences." 
                className="mt-2 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue="San Francisco, CA" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" defaultValue="lorenzo.design" className="mt-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-semibold">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email updates about your activity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-semibold">Comment Replies</p>
                <p className="text-sm text-gray-600">Get notified when someone replies to your comments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">Post Upvotes</p>
                <p className="text-sm text-gray-600">Get notified when your posts receive upvotes</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Privacy Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-semibold">Public Profile</p>
                <p className="text-sm text-gray-600">Make your profile visible to everyone</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">Show Activity</p>
                <p className="text-sm text-gray-600">Display your recent activity on your profile</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Account</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">Change Password</p>
              <Button variant="outline" size="sm" className="hover:border-orange-500 hover:text-orange-500 transition-colors">
                Update Password
              </Button>
            </div>
            <div className="pt-4 border-t">
              <p className="font-semibold mb-2 text-red-600">Delete Account</p>
              <p className="text-sm text-gray-600 mb-3">Permanently delete your account and all data</p>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">
            Cancel
          </Button>
          <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30 transition-all hover:scale-105">
            Save Changes
          </Button>
        </div>
      </main>
    </div>
  );
}