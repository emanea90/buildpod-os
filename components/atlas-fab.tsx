"use client";

import { useAtlas } from "./atlas-provider";

export function AtlasFab() {
  const { toggleAtlas } = useAtlas();

  return (
    <button
      onClick={toggleAtlas}
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-accent/50 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_50px_rgba(0,0,0,0.18)] dark:bg-zinc-950"
      aria-label="Open ATLAS"
      type="button"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full animate-[atlasPulse_3.2s_ease-in-out_infinite]">
        <img
          src="/ATLAS-logo.png"
          alt="ATLAS"
          className="h-8 w-8 object-contain brightness-75 dark:brightness-100"
        />
      </div>
    </button>
  );
}