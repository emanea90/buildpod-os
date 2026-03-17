import { getDashboardJobs } from "@/services/dashboard.service";

export default async function DashboardPage() {
  const organizationId = "buildpod-org-001";
  const jobs = await getDashboardJobs(organizationId);

  return (
    <main className="min-h-screen bg-white p-8 text-black">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold">BuildPod OS Dashboard</h1>
        <p className="mb-8 text-sm text-gray-600">
          Operational readiness overview
        </p>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="grid grid-cols-5 gap-4 border-b bg-gray-50 px-4 py-3 text-sm font-semibold">
            <div>Job</div>
            <div>Job Status</div>
            <div>Staging Status</div>
            <div>Asset</div>
            <div>Readiness</div>
          </div>

          {jobs.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500">
              No jobs found.
            </div>
          ) : (
            jobs.map((job) => {
              const latestSession = job.staging_sessions[0];
              const readiness =
                job.status === "ready" && latestSession?.status === "completed"
                  ? "Ready"
                  : "Not Ready";

              return (
                <div
                  key={job.id}
                  className="grid grid-cols-5 gap-4 border-b px-4 py-4 text-sm last:border-b-0"
                >
                  <div>
                    <div className="font-medium">{job.title}</div>
                    <div className="text-xs text-gray-500">{job.id}</div>
                  </div>

                  <div className="capitalize">{job.status.replaceAll("_", " ")}</div>

                  <div className="capitalize">
                    {latestSession
                      ? latestSession.status.replaceAll("_", " ")
                      : "No staging session"}
                  </div>

                  <div>
                    {latestSession?.target_asset
                      ? latestSession.target_asset.name
                      : "No asset linked"}
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        readiness === "Ready"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {readiness}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}