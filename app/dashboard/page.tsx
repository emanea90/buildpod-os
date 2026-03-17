import { AppShell } from "../../components/app-shell";
import { getDashboardJobs } from "@/services/dashboard.service";

export default async function DashboardPage() {
  const organizationId = "buildpod-org-001";
  const jobs = await getDashboardJobs(organizationId);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Readiness Dashboard
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Operational readiness overview across jobs, staging, and assets
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="grid grid-cols-5 gap-4 border-b border-border px-6 py-4 text-sm font-semibold text-foreground">
            <div>Job</div>
            <div>Job Status</div>
            <div>Staging Status</div>
            <div>Asset</div>
            <div>Readiness</div>
          </div>

          {jobs.length === 0 ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
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
                  className="grid grid-cols-5 gap-4 border-b border-border px-6 py-5 text-sm last:border-b-0"
                >
                  <div>
                    <div className="font-medium text-foreground">{job.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {job.id}
                    </div>
                  </div>

                  <div className="capitalize text-foreground">
                    {job.status.replaceAll("_", " ")}
                  </div>

                  <div className="capitalize text-foreground">
                    {latestSession
                      ? latestSession.status.replaceAll("_", " ")
                      : "No staging session"}
                  </div>

                  <div className="text-foreground">
                    {latestSession?.target_asset
                      ? latestSession.target_asset.name
                      : "No asset linked"}
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        readiness === "Ready"
                          ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
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
    </AppShell>
  );
}