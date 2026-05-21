import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/classes/") && request.method === "DELETE") {
          const classId = url.pathname.split("/").pop();
          if (classId && classId !== "classes") {
            const { api, supabaseClient } = await import("./lib/supabase/api");
            
            // Get token from Authorization header
            const authHeader = request.headers.get("Authorization");
            const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
            
            if (!token) {
              return new Response(JSON.stringify({ error: "No token provided" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
              });
            }

            try {
              // Verify token with Supabase
              const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
              if (authError || !user) throw new Error("Not authenticated");

              // Initialize authenticated client for RLS-compliant operations
              const { createClient } = await import("@supabase/supabase-js");
              
              const rawUrl = import.meta.env.VITE_SUPABASE_URL;
              const supabaseUrl = rawUrl?.replace(/\/+$/, "").replace(/\/rest\/v1\/?$/, "");
              const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

              const authenticatedSupabase = createClient(
                supabaseUrl || "https://placeholder.supabase.co",
                supabaseKey || "placeholder",
                {
                  global: { headers: { Authorization: `Bearer ${token}` } },
                }
              );

              // 1. Delete associated results
              const { error: resultsError } = await authenticatedSupabase
                .from("results")
                .delete()
                .eq("class_id", classId);
              if (resultsError) throw new Error(`Failed to delete results: ${resultsError.message}`);

              // 2. Delete associated students
              const { error: studentsError } = await authenticatedSupabase
                .from("students")
                .delete()
                .eq("class_id", classId);
              if (studentsError) throw new Error(`Failed to delete students: ${studentsError.message}`);

              // 3. Delete the class itself
              const { error: classError } = await authenticatedSupabase
                .from("classes")
                .delete()
                .eq("id", classId)
                .eq("teacher_id", user.id);
              if (classError) throw new Error(`Failed to delete class: ${classError.message}`);
              
              return new Response(null, { status: 204 });
            } catch (error: any) {
              console.error("Delete class error:", error);
              return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
                status: error.message === "Not authenticated" ? 401 : 500,
                headers: { "Content-Type": "application/json" },
              });
            }
          }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
