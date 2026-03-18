import { NextResponse } from "next/server";
import { releaseStagingSession } from "../../../../../services/staging-governance.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const released = await releaseStagingSession(id, body.release_note ?? null);

    return NextResponse.json({
      success: true,
      data: released,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to release staging session",
      },
      { status: 400 }
    );
  }
}