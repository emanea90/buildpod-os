import { NextResponse } from "next/server";
import { handleStagingScan } from "../../../../../services/staging-scan.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await handleStagingScan(id, body.scanned_value ?? "");

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        result: "error",
        message: error instanceof Error ? error.message : "Failed to process scan.",
      },
      { status: 500 }
    );
  }
}