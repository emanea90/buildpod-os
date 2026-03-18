import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json(
    {
      error: "Session status is auto-derived from staging item state and cannot be manually overridden.",
    },
    { status: 405 }
  );
}