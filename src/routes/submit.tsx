import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, isValidUrl } from "@/lib/fatawa";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Suggest a video — Kalaam al ulama" },
      {
        name: "description",
        content:
          "Share a beneficial video from a trusted scholar. Every suggestion is reviewed before it joins the library.",
      },
      { property: "og:title", content: "Suggest a video — Kalaam al ulama" },
      {
        property: "og:description",
        content: "Send a scholar's video for review and it may be added to the public library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubmitPage,
});

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-all focus:border-gold focus:shadow-gold-focus";

function SubmitPage() {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [form, setForm] = useState({
    title: "",
    video_url: "",
    scholar_name: "",
    topic_name: "",
    category_slug: "",
    summary_transcript: "",
    submitter_name: "",
    submitter_email: "",
  });
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const send = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("submissions").insert({
        title: form.title.trim(),
        video_url: form.video_url.trim(),
        scholar_name: form.scholar_name.trim() || null,
        topic_name: form.topic_name.trim() || null,
        category_slug: form.category_slug || null,
        summary_transcript: form.summary_transcript.trim() || null,
        submitter_name: form.submitter_name.trim() || null,
        submitter_email: form.submitter_email.trim() || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => setDone(true),
    onError: (e: Error) => toast.error(e.message),
  });

  const urlValid = !form.video_url || isValidUrl(form.video_url);
  const canSend = form.title.trim() && form.video_url.trim() && urlValid && !send.isPending;

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
        <h1 className="mt-6 text-3xl">Jazakallahu khayran</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your suggestion has been sent for review. Once approved it will appear in the library.
        </p>
        <Button
          variant="outline"
          className="mt-8"
          onClick={() => {
            setDone(false);
            setForm({
              title: "",
              video_url: "",
              scholar_name: "",
              topic_name: "",
              category_slug: "",
              summary_transcript: "",
              submitter_name: "",
              submitter_email: "",
            });
          }}
        >
          Suggest another
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <p className="font-script text-xl text-gold">Contribute</p>
      <h1 className="mt-2 text-4xl">Suggest a video</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Share a beneficial video from a trusted scholar — YouTube, TikTok, Instagram, Facebook or
        Vimeo. Every suggestion is reviewed before it joins the library.
      </p>

      <form
        className="mt-8 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) send.mutate();
        }}
      >
        <Field label="Question or title" required>
          <input className={fieldClass} value={form.title} onChange={set("title")} required />
        </Field>

        <Field label="Video link" required>
          <input
            className={fieldClass}
            value={form.video_url}
            onChange={set("video_url")}
            placeholder="https://…"
            required
          />
          {!urlValid && (
            <p className="text-xs text-destructive">Please paste a full link starting with https://</p>
          )}
        </Field>

        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="Scholar">
            <input className={fieldClass} value={form.scholar_name} onChange={set("scholar_name")} />
          </Field>
          <Field label="Topic">
            <input className={fieldClass} value={form.topic_name} onChange={set("topic_name")} />
          </Field>
          <Field label="Category">
            <select
              className={fieldClass}
              value={form.category_slug}
              onChange={set("category_slug")}
              aria-label="Category"
            >
              <option value="">Not sure</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Summary (optional)">
          <textarea
            rows={5}
            className="w-full rounded-lg border border-input bg-card p-3 text-sm leading-relaxed outline-none transition-all focus:border-gold focus:shadow-gold-focus"
            value={form.summary_transcript}
            onChange={set("summary_transcript")}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Your name (optional)">
            <input className={fieldClass} value={form.submitter_name} onChange={set("submitter_name")} />
          </Field>
          <Field label="Your email (optional)">
            <input
              type="email"
              className={fieldClass}
              value={form.submitter_email}
              onChange={set("submitter_email")}
            />
          </Field>
        </div>

        <Button type="submit" disabled={!canSend} className="h-11 px-6">
          {send.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Send for review
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      {children}
    </div>
  );
}
