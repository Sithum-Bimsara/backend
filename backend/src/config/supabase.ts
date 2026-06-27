import { createClient } from "@supabase/supabase-js";
import ws from "ws";

if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = ws;
}

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);