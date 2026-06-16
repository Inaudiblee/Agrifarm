"use client";

import { useEffect } from "react";
import type { ToastType } from "@/lib/toast";

const STYLES: Record<
  ToastType,
  { border: string; bg: string; title: string; icon: string }
> = {
  success: {
    border: "border-green-300",
    bg: "bg-green-50",
    title: "text-green-900",
    icon: "✅",
  },
  error: {
    border: "border-red-300",
    bg: "bg-red-50",
    title: "text-red-900",
    icon: "❌",
  },
  warning: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    title: "text-amber-900",
    icon: "⚠️",
  },
  info: {
    border: "border-sky-300",
    bg: "bg-sky-50",
    title: "text-sky-900",
    icon: "ℹ️",
  },
};

export type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message: string;
};

type AppToastProps = {
  toast: ToastItem | null;
  dismissLabel: string;
  onDismiss: () => void;
};

export function AppToast({ toast, dismissLabel, onDismiss }: AppToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const style = STYLES[toast.type];

  return (
    <div
      className={`app-toast fixed bottom-6 left-1/2 z-[200] px-5 py-4 rounded-2xl shadow-xl border-2 max-w-sm w-[calc(100%-2rem)] -translate-x-1/2 app-toast--visible ${style.border} ${style.bg}`}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none shrink-0" aria-hidden>
          {style.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`m-0 font-black text-base leading-snug ${style.title}`}>{toast.title}</p>
          <p className="m-0 mt-1 text-sm font-semibold text-stone-700 leading-snug">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-stone-400 hover:text-stone-600 font-bold text-lg leading-none"
          style={{ minHeight: "32px", minWidth: "32px" }}
          aria-label={dismissLabel}
        >
          ×
        </button>
      </div>
    </div>
  );
}
