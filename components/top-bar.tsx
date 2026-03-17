import { Shield } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function TopBar() {
    return (
        <header className="flex h-20 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur">
          <div>
            <p className="text-sm text-muted-foreground">
              Operational command layer
            </p>
          </div>
      
          <div className="flex items-center gap-3">
        
      
            <ThemeToggle />
          </div>
        </header>
      );
    }