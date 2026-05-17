import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { flushQueue } from "./queue";
import { toast } from "sonner";

interface OfflineCtx {
  online: boolean;
  syncing: boolean;
}
const Ctx = createContext<OfflineCtx>({ online: true, syncing: false });

export function OfflineSyncProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    
    const runSync = async () => {
      setSyncing(true);
      try {
        const n = await flushQueue();
        if (n > 0) toast.success(`Sync: ${n}`);
      } catch (err) {
        console.error("Sync failed", err);
      } finally {
        setSyncing(false);
      }
    };

    const handleOnline = () => {
      setOnline(true);
      runSync();
    };

    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // initial flush
    if (navigator.onLine) {
      runSync();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return <Ctx.Provider value={{ online, syncing }}>{children}</Ctx.Provider>;
}

export function useOffline() {
  return useContext(Ctx);
}

export function useOnline() {
  return useContext(Ctx).online;
}
