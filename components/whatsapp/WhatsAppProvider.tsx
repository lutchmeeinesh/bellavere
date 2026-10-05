"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

/** What the floating WhatsApp button shows right now. */
export type WhatsAppState = {
  /** Hide the floating button (e.g. where a page has its own WhatsApp card). */
  hidden: boolean;
  /** Pre-filled message; null = the default message of the current language. */
  message: string | null;
};

export type WhatsAppOverride = { hidden?: boolean; message?: string };

const DEFAULT_STATE: WhatsAppState = { hidden: false, message: null };

type Entry = { id: string } & WhatsAppOverride;

interface WhatsAppContextValue {
  state: WhatsAppState;
  set: (id: string, override: WhatsAppOverride) => void;
  clear: (id: string) => void;
}

const WhatsAppContext = createContext<WhatsAppContextValue | null>(null);

/**
 * Holds the floating WhatsApp button's state for the public site
 * (app/[locale]/(site)/layout.tsx). Pages and components adjust it with
 * useWhatsAppOverride() while they are mounted: the button is hidden if any
 * mounted override hides it, and uses the message of the most recently
 * mounted override that sets one.
 */
export function WhatsAppProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);

  const set = useCallback((id: string, override: WhatsAppOverride) => {
    setEntries((current) => [
      ...current.filter((entry) => entry.id !== id),
      { id, ...override },
    ]);
  }, []);

  const clear = useCallback((id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const state = useMemo<WhatsAppState>(() => {
    const withMessage = entries.filter((entry) => entry.message !== undefined);
    return {
      hidden: entries.some((entry) => entry.hidden === true),
      message: withMessage.at(-1)?.message ?? null,
    };
  }, [entries]);

  const value = useMemo(() => ({ state, set, clear }), [state, set, clear]);

  return (
    <WhatsAppContext.Provider value={value}>{children}</WhatsAppContext.Provider>
  );
}

/**
 * Sets the floating button's override while the calling component is
 * mounted, and clears it on unmount. Pass null for no override. Only the
 * values matter, so an inline object is fine:
 *
 *   useWhatsAppOverride({ message: t("whatsappMessage", { amount }) });
 *   useWhatsAppOverride({ hidden: true });
 *
 * Outside a WhatsAppProvider (e.g. the owner portal) it does nothing.
 */
export function useWhatsAppOverride(
  override: { hidden?: boolean; message?: string } | null,
): void {
  const context = useContext(WhatsAppContext);
  const set = context?.set;
  const clear = context?.clear;
  const id = useId();
  const active = override !== null;
  const hidden = override?.hidden;
  const message = override?.message;

  useEffect(() => {
    if (!set || !clear || !active) return;
    set(id, {
      ...(hidden !== undefined ? { hidden } : {}),
      ...(message !== undefined ? { message } : {}),
    });
    return () => clear(id);
  }, [set, clear, id, active, hidden, message]);
}

/** The floating button's current state ({ hidden: false, message: null } outside a provider). */
export function useWhatsAppState(): WhatsAppState {
  return useContext(WhatsAppContext)?.state ?? DEFAULT_STATE;
}
