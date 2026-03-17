"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AtlasMessage = {
  id: string;
  role: "user" | "atlas";
  content: string;
};

type AtlasContextType = {
  isOpen: boolean;
  openAtlas: () => void;
  closeAtlas: () => void;
  toggleAtlas: () => void;
  input: string;
  setInput: (value: string) => void;
  messages: AtlasMessage[];
  sendMessage: () => void;
};

const AtlasContext = createContext<AtlasContextType | null>(null);

export function AtlasProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInputState] = useState("");
  const [messages, setMessages] = useState<AtlasMessage[]>([
    {
      id: "atlas-welcome",
      role: "atlas",
      content:
        "ATLAS ready. Ask about jobs, staging, assets, inventory, workforce, finance, workspace, or navigation.",
    },
  ]);

  useEffect(() => {
    const savedInput = sessionStorage.getItem("atlas-input");
    const savedMessages = sessionStorage.getItem("atlas-messages");

    if (savedInput) {
      setInputState(savedInput);
    }

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("atlas-input", input);
  }, [input]);

  useEffect(() => {
    sessionStorage.setItem("atlas-messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openAtlas = useCallback(() => setIsOpen(true), []);
  const closeAtlas = useCallback(() => setIsOpen(false), []);
  const toggleAtlas = useCallback(() => setIsOpen((prev) => !prev), []);

  const setInput = useCallback((value: string) => {
    setInputState(value);
  }, []);

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();

    const userMessage: AtlasMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    let reply =
      "ATLAS shell only for now. Conversational reasoning and deeper actions will be wired next.";

    const routeMap: Record<string, string> = {
      dashboard: "/dashboard",
      jobs: "/jobs",
      staging: "/staging",
      assets: "/assets",
      inventory: "/inventory",
      workforce: "/workforce",
      communications: "/communications",
      media: "/media",
      finance: "/finance",
      workspace: "/workspace",
    };

    for (const [keyword, route] of Object.entries(routeMap)) {
      if (lower.includes(keyword)) {
        window.location.href = route;
        reply = `Navigating to ${keyword}.`;
        break;
      }
    }

    const atlasReply: AtlasMessage = {
      id: crypto.randomUUID(),
      role: "atlas",
      content: reply,
    };

    setMessages((prev) => [...prev, userMessage, atlasReply]);
    setInputState("");
    setIsOpen(true);
  }, [input]);

  const value = useMemo(
    () => ({
      isOpen,
      openAtlas,
      closeAtlas,
      toggleAtlas,
      input,
      setInput,
      messages,
      sendMessage,
    }),
    [isOpen, openAtlas, closeAtlas, toggleAtlas, input, setInput, messages, sendMessage]
  );

  return <AtlasContext.Provider value={value}>{children}</AtlasContext.Provider>;
}

export function useAtlas() {
  const context = useContext(AtlasContext);

  if (!context) {
    throw new Error("useAtlas must be used inside AtlasProvider");
  }

  return context;
}