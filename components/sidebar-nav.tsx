"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Boxes,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Package,
  Plane,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/staging", label: "Staging", icon: ClipboardList },
  { href: "/assets", label: "Assets", icon: Plane },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/workforce", label: "Workforce", icon: Users },
  { href: "/communications", label: "Communications", icon: MessageSquare },
  { href: "/media", label: "Media", icon: ImageIcon },
  { href: "/finance", label: "Finance", icon: DollarSign },
  { href: "/workspace", label: "Workspace", icon: Boxes },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-screen flex-col border-r border-border bg-sidebar px-3 py-5 transition-all duration-200 ${
        collapsed ? "w-24" : "w-72"
      }`}
    >
      <div className="mb-8 flex items-center justify-between px-2">
        <div className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-4"}`}>
          <div className="flex h-14 w-14 items-center justify-center">
            <img
              src="/buildpod-os-logo.png"
              alt="BuildPod OS"
              className="h-14 w-14 object-contain"
            />
          </div>

          {!collapsed && (
            <div>
              <div className="text-base font-semibold tracking-wide text-foreground">
                BuildPod OS
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                v1.0 Axis
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:border-accent hover:text-accent"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:border-accent hover:text-accent"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                collapsed ? "justify-center" : "gap-3"
              } ${
                active
                  ? "bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(212,175,55,0.22)]"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}