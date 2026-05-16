import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { flushQueue } from "./queue";
import { toast } from "sonner";

interface OfflineCtx {
  online: boolean;
}
const Ctx = createContext<OfflineCtx>({ online: true });

export function OfflineSyncProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = async () => {
      setOnline(true);
      const n = await flushQueue();
      if (n > 0) toast.success(`Sync: ${n}`);
    };
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    // initial flush
    if (navigator.onLine) flushQueue().catch(() => {});
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return <Ctx.Provider value={{ online }}>{children}</Ctx.Provider>;
}

export function useOnline() {
  return useContext(Ctx).online;
}
