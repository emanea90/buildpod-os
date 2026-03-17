import { NextResponse } from "next/server";
import { getAllJobs } from "../../../services/jobs.service";

export async function GET() {
  try {
    const organizationId = "buildpod-org-001";

    const jobs = await getAllJobs(organizationId);

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch jobs",
      },
      { status: 500 }
    );
  }
}