import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading };
}

export async function ensureCuratorRole() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return false;

  const { data: existing, error: readError } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (readError) throw readError;
  if (existing) return true;

  const { error } = await supabase.from("user_roles").insert({
    user_id: userData.user.id,
    role: "admin",
  });
  if (error) throw error;
  return true;
}
