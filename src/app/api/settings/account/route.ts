import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { z } from "zod";

const accountDeletionSchema = z.object({
  password: z.string().min(1),
  confirmation: z.literal("DELETE"),
  userId: z.string().uuid(),
});

// Export user data (GDPR compliance)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Fetch all user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    // Fetch user's posts
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId);

    // Fetch user's votes
    const { data: votes } = await supabase
      .from("votes")
      .select("*")
      .eq("user_id", userId);

    const exportData = {
      user: userData,
      posts: posts || [],
      votes: votes || [],
      exportDate: new Date().toISOString(),
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

// Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = accountDeletionSchema.parse(body);

    // TODO: Verify password before deletion
    // This is critical - don't allow account deletion without password verification

    const supabase = createServerSupabaseClient();

    // Soft delete or hard delete based on your requirements
    const { error } = await (supabase
      .from("users") as any)
      .update({
        email: `deleted_${validatedData.userId}@deleted.com`,
        username: `deleted_${validatedData.userId}`,
      })
      .eq("id", validatedData.userId);

    if (error) {
      console.error("Account deletion error:", error);
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 }
      );
    }

    // TODO: Sign out user and invalidate all sessions

    return NextResponse.json({ 
      success: true,
      message: "Account has been deleted successfully" 
    });
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
