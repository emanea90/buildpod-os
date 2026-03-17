import { AppShell } from "../../components/app-shell";

export default function CommunicationsPage() {
  return (
    <AppShell>
      <div className="rounded-3xl border border-border bg-card p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <h2 className="text-3xl font-bold text-foreground">Communications</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Job-bound messaging between dispatch, warehouse, foreman, inspectors, managers, and owners will live here.
        </p>
      </div>
    </AppShell>
  );
}