import { NextResponse } from "next/server";
import { evaluateStagingSession } from "../../../../services/staging-readiness.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    const updated = await evaluateStagingSession(sessionId);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to evaluate staging session",
      },
      { status: 500 }
    );
  }
}