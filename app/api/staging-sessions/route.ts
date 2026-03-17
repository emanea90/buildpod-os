import { NextResponse } from "next/server";
import { getAllStagingSessions } from "../../../services/staging-sessions.service";

export async function GET() {
  try {
    const organizationId = "buildpod-org-001";

    const sessions = await getAllStagingSessions(organizationId);

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch staging sessions",
      },
      { status: 500 }
    );
  }
}