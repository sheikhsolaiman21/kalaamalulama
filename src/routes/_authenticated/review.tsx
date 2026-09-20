import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Check, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  categoriesQuery,
  fatawaQuery,
  pendingSubmissionsQuery,
  scholarsQuery,
  slugify,
  topicsQuery,
  type Submission,
} from "@/lib/fatawa";

export const Route = createFileRoute("/_authenticated/review")({
  head: () => ({
    meta: [
      { title: "Review submissions — Ulama Library" },
      { name: "description", content: "Approve or decline videos suggested by readers." },
      { property: "og:title", content: "Review submissions — Ulama Library" },
      { property: "og:description", content: "Curator queue for reader-suggested scholar videos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const queryClient = useQueryClient();
  const { data: pending = [], isLoading } = useQuery(pendingSubmissionsQuery);

  useEffect(() => {
    supabase.rpc("claim_admin");
  }, []);

  const approve = useMutation({
    mutationFn: async (s: Submission) => {
      let scholarId: string | null = null;
      if (s.scholar_name?.trim()) {
        const slug = slugify(s.scholar_name);
        const { data: existing } = await supabase
          .from("scholars")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (existing) scholarId = existing.id;
        else {
          const { data, error } = await supabase
            .from("scholars")
            .insert({ name: s.scholar_name.trim(), slug })
            .select("id")
            .single();
          if (error) throw error;
          scholarId = data.id;
        }
      }

      let topicId: string | null = null;
      if (s.topic_name?.trim()) {
        const slug = slugify(s.topic_name);
        const { data: existing } = await supabase
          .from("topics")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (existing) topicId = existing.id;
        else {
          const { data, error } = await supabase
            .from("topics")
            .insert({ name: s.topic_name.trim(), slug })
            .select("id")
            .single();
          if (error) throw error;
          topicId = data.id;
        }
      }

      const { error: insertError } = await supabase.from("fatawa").insert({
        title: s.title,
        summary_transcript: s.summary_transcript,
        video_url: s.video_url,
        scholar_id: scholarId,
        topic_id: topicId,
        content_type: s.category_slug || "fatwa",
      });
      if (insertError) throw insertError;

      const { error } = await supabase
        .from("submissions")
        .update({ status: "approved" })
        .eq("id", s.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingSubmissionsQuery.queryKey });
      queryClient.invalidateQueries({ queryKey: fatawaQuery.queryKey });
      queryClient.invalidateQueries({ queryKey: scholarsQuery.queryKey });
      queryClient.invalidateQueries({ queryKey: topicsQuery.queryKey });
      queryClient.invalidateQueries({ queryKey: categoriesQuery.queryKey });
      toast.success("Added to the library");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const decline = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("submissions")
        .update({ status: "declined" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingSubmissionsQuery.queryKey });
      toast.success("Declined");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-script text-xl text-gold">Curator desk</p>
          <h1 className="mt-2 text-4xl">Submissions</h1>
        </div>
        <Link
          to="/admin"
          className="shrink-0 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-gold hover:text-gold"
        >
          Add entry
        </Link>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Videos suggested by readers. Approving adds the entry to the public catalog.
      </p>

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && pending.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No suggestions waiting right now.
          </p>
        )}
        {pending.map((s) => (
          <article key={s.id} className="rounded-lg border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-xl leading-snug">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {[s.scholar_name, s.topic_name, s.category_slug].filter(Boolean).join(" · ") ||
                "No details given"}
            </p>
            {s.summary_transcript && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {s.summary_transcript}
              </p>
            )}
            <a
              href={s.video_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-gold hover:underline"
            >
              Watch the video <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {(s.submitter_name || s.submitter_email) && (
              <p className="mt-3 text-xs text-muted-foreground">
                Sent by {s.submitter_name ?? "anonymous"}
                {s.submitter_email ? ` · ${s.submitter_email}` : ""}
              </p>
            )}
            <div className="mt-5 flex gap-2">
              <Button size="sm" onClick={() => approve.mutate(s)} disabled={approve.isPending}>
                <Check className="h-4 w-4" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => decline.mutate(s.id)}
                disabled={decline.isPending}
              >
                <X className="h-4 w-4" /> Decline
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
