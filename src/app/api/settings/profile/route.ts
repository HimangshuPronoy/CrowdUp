import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { z } from "zod";

const profileUpdateSchema = z.object({
  display_name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = profileUpdateSchema.parse(body);

    // Get user ID from session/auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from token or session
    // For now, expect userId in body (you should validate session properly)
    const { userId } = body;
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Sanitize bio to prevent XSS
    const sanitizedBio = validatedData.bio
      ?.replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, "")
      .trim();

    // Update user profile
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await (supabase
      .from("users") as any)
      .update({
        display_name: validatedData.display_name,
        bio: sanitizedBio || null,
        avatar_url: validatedData.avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
