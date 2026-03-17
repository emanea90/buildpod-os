import { AtlasCommandPanel } from "./atlas-command-panel";
import { AtlasFab } from "./atlas-fab";
import { SidebarNav } from "./sidebar-nav";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <SidebarNav />

        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar />
          <div className="flex-1 p-8">{children}</div>
        </div>
      </div>

      <AtlasFab />
      <AtlasCommandPanel />
    </div>
  );
}