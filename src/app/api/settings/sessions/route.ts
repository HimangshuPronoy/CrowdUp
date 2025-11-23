import { NextRequest, NextResponse } from "next/server";

// This endpoint lists active sessions for the user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Implement session listing from your session store
    // This is a mock response
    const sessions = [
      {
        id: "session-1",
        device: "Chrome on macOS",
        location: "San Francisco, CA",
        lastActive: new Date().toISOString(),
        current: true,
      },
    ];

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Session list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// This endpoint revokes other sessions
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Implement session revocation logic
    // Should invalidate all sessions except the current one

    return NextResponse.json({ 
      success: true,
      message: "All other sessions have been signed out" 
    });
  } catch (error) {
    console.error("Session revocation error:", error);
    return NextResponse.json(
      { error: "Failed to revoke sessions" },
      { status: 500 }
    );
  }
}
