import { supabase } from "@/integrations/supabase/client";

export type Scholar = { id: string; name: string; slug: string };
export type Topic = { id: string; name: string; slug: string };
export type Category = { id: string; name: string; slug: string };

/** Slug of a category, e.g. "fatwa" or a custom one the admin created. */
export type ContentType = string;

export type Fatwa = {
  id: string;
  title: string;
  summary_transcript: string | null;
  video_url: string;
  scholar_id: string | null;
  topic_id: string | null;
  content_type: ContentType;
  created_at: string;
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

export const categoriesQuery = {
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase.from("categories").select("id,name,slug").order("name");
    if (error) throw error;
    return data ?? [];
  },
};

/** Human label for a category slug, falling back to a prettified slug. */
export function categoryLabel(slug: string, categories: Category[]): string {
  const found = categories.find((c) => c.slug === slug);
  if (found) return found.name;
  return slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export const fatawaQuery = {
  queryKey: ["fatawa"],
  queryFn: async (): Promise<Fatwa[]> => {
    const { data, error } = await supabase
      .from("fatawa")
      .select("id,title,summary_transcript,video_url,scholar_id,topic_id,content_type,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

/** Turns a video link from any supported platform into an embeddable player URL. */
export function toEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  const path = parsed.pathname;

  if (host.endsWith("instagram.com")) {
    const m = path.match(/\/(p|reel|reels|tv)\/([^/]+)/);
    if (!m) return null;
    const kind = m[1] === "reels" ? "reel" : m[1];
    return `https://www.instagram.com/${kind}/${m[2]}/embed`;
  }

  if (host === "youtu.be") {
    const id = path.slice(1).split("/")[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const v = parsed.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    const m = path.match(/\/(shorts|embed|live|v)\/([^/]+)/);
    if (m) return `https://www.youtube.com/embed/${m[2]}`;
    return null;
  }

  if (host.endsWith("tiktok.com")) {
    const m = path.match(/\/video\/(\d+)/) ?? path.match(/^\/t\/([\w-]+)/);
    if (m) return `https://www.tiktok.com/embed/v2/${m[1]}`;
    return null;
  }

  if (host.endsWith("vimeo.com")) {
    const id = path.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }

  if (host.endsWith("facebook.com") || host === "fb.watch") {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.trim())}&show_text=false`;
  }

  if (host.endsWith("dailymotion.com")) {
    const m = path.match(/\/video\/([^/_]+)/);
    return m ? `https://www.dailymotion.com/embed/video/${m[1]}` : null;
  }

  return null;
}

/** True for any well-formed link — unsupported hosts still open in a new tab. */
export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export type Submission = {
  id: string;
  title: string;
  summary_transcript: string | null;
  video_url: string;
  scholar_name: string | null;
  topic_name: string | null;
  category_slug: string | null;
  submitter_name: string | null;
  submitter_email: string | null;
  note: string | null;
  status: string;
  created_at: string;
};

export const pendingSubmissionsQuery = {
  queryKey: ["submissions", "pending"],
  queryFn: async (): Promise<Submission[]> => {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Submission[];
  },
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
