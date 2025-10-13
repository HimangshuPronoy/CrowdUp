"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Company } from "@/types/database";

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    company: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to create a post");
      router.push("/auth/login");
      return;
    }
    fetchCompanies();
  }, [user]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (data) setCompanies(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to create a post");
      return;
    }

    if (!formData.type || !formData.company || !formData.title || !formData.description) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const typeMap: Record<string, string> = {
        bug: "Bug Report",
        feature: "Feature Request",
        complaint: "Complaint"
      };

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          company_id: formData.company,
          type: typeMap[formData.type],
          title: formData.title,
          description: formData.description,
        });

      if (error) throw error;

      toast.success("Post created successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-24 pb-8">
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-2">Create a Post</h1>
          <p className="text-gray-600 mb-8">Share your feedback with the community</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post Type */}
            <div>
              <Label htmlFor="type" className="text-base font-semibold mb-2 block">
                Post Type
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select post type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">🐛 Bug Report</SelectItem>
                  <SelectItem value="feature">💡 Feature Request</SelectItem>
                  <SelectItem value="complaint">⚠️ Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company */}
            <div>
              <Label htmlFor="company" className="text-base font-semibold mb-2 block">
                Company/App
              </Label>
              <Select value={formData.company} onValueChange={(value) => setFormData({ ...formData, company: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select company..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-base font-semibold mb-2 block">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Brief summary of your feedback..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your feedback..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                className="resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 gap-2"
                disabled={loading}
              >
                <Send className="h-4 w-4" />
                {loading ? "Publishing..." : "Publish Post"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="h-12"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}