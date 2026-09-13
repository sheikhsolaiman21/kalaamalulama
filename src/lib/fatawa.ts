import { supabase } from "@/integrations/supabase/client";

export type Scholar = { id: string; name: string; slug: string };
export type Topic = { id: string; name: string; slug: string };
export type Category = { id: string; name: string; slug: string };
export const CONTENT_TYPES = ["fatwa", "advice", "motivation", "reminder", "lecture"] as const;
export type ContentType = string;

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  fatwa: "Fatwa",
  advice: "Advice",
  motivation: "Motivation",
  reminder: "Reminder",
  lecture: "Lecture",
};

/** Human label for any category slug, including ones added later. */
export function contentTypeLabel(slug: string): string {
  return (
    CONTENT_TYPE_LABELS[slug] ??
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export type Fatwa = {
  id: string;
  title: string;
  summary_transcript: string | null;
  instagram_url: string;
  scholar_id: string | null;
  topic_id: string | null;
  content_type: ContentType;
  created_at: string;
};

export const categoriesQuery = {
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase.from("categories").select("id,name,slug").order("created_at");
    if (error) throw error;
    return data ?? [];
  },
};


export const scholarsQuery = {
  queryKey: ["scholars"],
  queryFn: async (): Promise<Scholar[]> => {
    const { data, error } = await supabase.from("scholars").select("id,name,slug").order("name");
    if (error) throw error;
    return data ?? [];
  },
};

export const topicsQuery = {
  queryKey: ["topics"],
  queryFn: async (): Promise<Topic[]> => {
    const { data, error } = await supabase.from("topics").select("id,name,slug").order("name");
    if (error) throw error;
    return data ?? [];
  },
};

export const fatawaQuery = {
  queryKey: ["fatawa"],
  queryFn: async (): Promise<Fatwa[]> => {
    const { data, error } = await supabase
      .from("fatawa")
      .select("id,title,summary_transcript,instagram_url,scholar_id,topic_id,content_type,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((item) => ({
      ...item,
      content_type: item.content_type || "fatwa",
    }));
  },
};


/** Turns any Instagram post/reel link into its embeddable player URL. */
export function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (!parsed.hostname.includes("instagram.com")) return null;
    const match = parsed.pathname.match(/\/(p|reel|reels|tv)\/([^/]+)/);
    if (!match) return null;
    const kind = match[1] === "reels" ? "reel" : match[1];
    return `https://www.instagram.com/${kind}/${match[2]}/embed`;
  } catch {
    return null;
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
