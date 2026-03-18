import { NextResponse } from "next/server";
import { getRecentInventoryTransactions } from "@/services/inventory-transactions.service";

export async function GET() {
  try {
    const data = await getRecentInventoryTransactions("buildpod-org-001");

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch inventory transactions",
      },
      { status: 500 }
    );
  }
}