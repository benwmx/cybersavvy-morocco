import { getDB, type QueuedResult } from "./db";
import { api } from "@/lib/supabase/api";

export async function enqueueResult(payload: QueuedResult["payload"]) {
  const db = getDB();
  if (!db) return;
  await db.offline_queue.add({ payload, createdAt: Date.now() });
}

export async function flushQueue(): Promise<number> {
  const db = getDB();
  if (!db) return 0;
  const items = await db.offline_queue.toArray();
  let flushed = 0;
  for (const item of items) {
    try {
      await api.insertResult(item.payload);
      if (item.id != null) await db.offline_queue.delete(item.id);
      flushed++;
    } catch {
      // keep in queue until next flush attempt
    }
  }
  return flushed;
}

export async function saveResult(payload: QueuedResult["payload"]): Promise<"online" | "queued"> {
  const isOnline = typeof navigator === "undefined" ? true : navigator.onLine;
  if (isOnline) {
    try {
      await api.insertResult(payload);
      return "online";
    } catch {
      await enqueueResult(payload);
      return "queued";
    }
  } else {
    await enqueueResult(payload);
    return "queued";
  }
}
