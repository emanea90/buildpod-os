import { AppShell } from "../../components/app-shell";

export default function JobsPage() {
  return (
    <AppShell>
      <div className="rounded-3xl border border-border bg-card p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <h2 className="text-3xl font-bold text-foreground">Jobs</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Module shell ready. Build this one deeper next.
        </p>
      </div>
    </AppShell>
  );
}