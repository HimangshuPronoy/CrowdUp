"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, ExternalLink, Send } from "lucide-react";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, getCurrentUserId } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";

interface AppData {
  id: string;
  name: string;
  description: string;
  app_url: string | null;
  logo_url: string | null;
  category: string;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  users: {
    username: string;
    display_name: string;
  };
  companies: {
    name: string;
    display_name: string;
  } | null;
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  users: {
    username: string;
    display_name: string;
  };
}

export default function AppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [app, setApp] = useState<AppData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApp();
    fetchReviews();
    if (currentUser) {
      fetchUserReview();
    }
  }, [id]);

  const fetchApp = async () => {
    const { data, error } = await supabase
      .from("apps")
      .select(`
        *,
        users (username, display_name),
        companies (name, display_name)
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      setApp(data as AppData);
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("app_reviews")
      .select(`
        *,
        users (username, display_name)
      `)
      .eq("app_id", id)
      .order("created_at", { ascending: false });

    if (data) {
      setReviews(data as Review[]);
    }
  };

  const fetchUserReview = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const { data } = await supabase
      .from("app_reviews")
      .select(`
        *,
        users (username, display_name)
      `)
      .eq("app_id", id)
      .eq("user_id", userId)
      .single();

    if (data) {
      setUserReview(data as Review);
      setRating((data as any).rating);
      setReviewText((data as any).review_text || "");
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      alert("Please select a rating");
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    setSubmitting(true);

    // @ts-ignore - Supabase type issue
    const { error } = await supabase.from("app_reviews").upsert({
      app_id: id,
      user_id: userId,
      rating,
      review_text: reviewText.trim() || null,
    });

    if (!error) {
      // Update app average rating
      const { data: allReviews } = await supabase
        .from("app_reviews")
        .select("rating")
        .eq("app_id", id);

      if (allReviews) {
        const avg = allReviews.reduce((sum, r: any) => sum + r.rating, 0) / allReviews.length;
        // @ts-ignore - Supabase type issue
        await supabase
          .from("apps")
          .update({
            average_rating: Math.round(avg * 100) / 100,
            total_reviews: allReviews.length,
          })
          .eq("id", id);
      }

      fetchApp();
      fetchReviews();
      fetchUserReview();
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading app...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
          <div className="text-center py-12 bg-white rounded-2xl border">
            <p className="text-gray-600 mb-4">App not found</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        {/* App Header */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* App Logo */}
            {app.logo_url ? (
              <img
                src={app.logo_url}
                alt={app.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-4xl font-bold">
                {app.name.charAt(0)}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{app.name}</h1>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                      {app.category}
                    </Badge>
                    {app.companies && (
                      <button
                        onClick={() => router.push(`/company/${app.companies!.name}`)}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        by {app.companies.display_name}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= app.average_rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {app.average_rating.toFixed(1)} ({app.total_reviews} reviews)
                    </span>
                  </div>
                </div>

                {app.app_url && (
                  <Button
                    onClick={() => window.open(app.app_url!, "_blank")}
                    className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit App
                  </Button>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">{app.description}</p>

              <button
                onClick={() => router.push(`/profile/${app.users.username}`)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:opacity-70"
              >
                Created by <span className="font-semibold">{app.users.display_name}</span>
                <span>• {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>

          {/* Add/Edit Review */}
          {currentUser ? (
            <div className="mb-8 pb-8 border-b">
              <h3 className="font-semibold mb-4">
                {userReview ? "Edit Your Review" : "Write a Review"}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Share your experience with this app..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="mb-3 resize-none"
                rows={4}
              />
              <Button
                onClick={handleSubmitReview}
                disabled={submitting || !rating}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
              </Button>
            </div>
          ) : (
            <div className="mb-8 pb-8 border-b text-center">
              <p className="text-gray-600 mb-4">Sign in to leave a review</p>
              <Button
                onClick={() => router.push("/auth/signin")}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
              >
                Sign In
              </Button>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reviews yet. Be the first to review!
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-orange-500">
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                      {review.users.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => router.push(`/profile/${review.users.username}`)}
                        className="font-semibold hover:underline"
                      >
                        {review.users.display_name}
                      </button>
                      <span className="text-sm text-gray-500">
                        • {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {review.review_text && (
                      <p className="text-gray-700">{review.review_text}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
