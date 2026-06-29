"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCopy, type Locale } from "@/lib/i18n";
import type { NotifyCategory, NotifyMessageKey, ToastType } from "@/lib/toast";
import { AppToast, type ToastItem } from "./app-toast";

type ShowToastInput = {
  type: ToastType;
  title?: string;
  message: string;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
  notify: (category: NotifyCategory, messageKey: NotifyMessageKey) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const copy = useMemo(() => getCopy(locale), [locale]);

  const dismiss = useCallback(() => setToast(null), []);

  const showToast = useCallback((input: ShowToastInput) => {
    const title = input.title ?? copy.notify.title[input.type];
    setToast({
      id: makeId(),
      type: input.type,
      title,
      message: input.message,
    });
  }, [copy]);

  const notify = useCallback(
    (category: NotifyCategory, messageKey: NotifyMessageKey) => {
      const messages = copy.notify[category] as Record<NotifyMessageKey, string>;
      const message = messages[messageKey];
      if (!message) return;
      showToast({ type: category, message });
    },
    [copy, showToast]
  );

  const value = useMemo(() => ({ showToast, notify }), [showToast, notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AppToast
        toast={toast}
        dismissLabel={copy.notify.dismiss}
        onDismiss={dismiss}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
