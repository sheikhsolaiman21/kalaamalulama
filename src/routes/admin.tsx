import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  fatawaQuery,
  scholarsQuery,
  slugify,
  toEmbedUrl,
  topicsQuery,
  type ContentType,
} from "@/lib/fatawa";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Add knowledge — Ulama Library" },
      {
        name: "description",
        content:
          "Add a scholar's answer, advice, reminder, motivation, or lecture to the library.",
      },
      { property: "og:title", content: "Add knowledge — Ulama Library" },
      {
        property: "og:description",
        content: "Add scholar-led knowledge with a content type, topic, summary, and source.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors focus:border-primary";

function AdminPage() {
  const queryClient = useQueryClient();
  const { data: scholars = [] } = useQuery(scholarsQuery);
  const { data: topics = [] } = useQuery(topicsQuery);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [scholarId, setScholarId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [contentType, setContentType] = useState<ContentType>("fatwa");
  const [newScholar, setNewScholar] = useState("");
  const [newTopic, setNewTopic] = useState("");

  const addScholar = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("scholars")
        .insert({ name: name.trim(), slug: slugify(name) })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setNewScholar("");
      setScholarId(data.id);
      queryClient.invalidateQueries({ queryKey: scholarsQuery.queryKey });
      toast.success("Scholar added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addTopic = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("topics")
        .insert({ name: name.trim(), slug: slugify(name) })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setNewTopic("");
      setTopicId(data.id);
      queryClient.invalidateQueries({ queryKey: topicsQuery.queryKey });
      toast.success("Topic added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveFatwa = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("fatawa").insert({
        title: title.trim(),
        summary_transcript: summary.trim() || null,
        instagram_url: url.trim(),
        scholar_id: scholarId || null,
        topic_id: topicId || null,
        content_type: contentType,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setSummary("");
      setUrl("");
      setContentType("fatwa");
      queryClient.invalidateQueries({ queryKey: fatawaQuery.queryKey });
      toast.success("Entry saved to the library");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const urlValid = !url || Boolean(toEmbedUrl(url));
  const canSave = title.trim() && url.trim() && urlValid && !saveFatwa.isPending;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-4xl">Add to the library</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Add the scholar, category, question, answer, and source. It appears in the{" "}
        <Link to="/" className="text-primary hover:underline">
          catalog
        </Link>{" "}
        immediately. This page is open to anyone right now.
      </p>

      <form
        className="mt-8 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) saveFatwa.mutate();
        }}
      >
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Question or title
          </label>
          <input
            id="title"
            className={fieldClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
             placeholder="Can I combine prayers while travelling?"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Video source link
          </label>
          <input
            id="url"
            className={fieldClass}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/…"
            required
          />
          {!urlValid && (
            <p className="text-xs text-destructive">
              That doesn&apos;t look like a supported post or reel link.
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="content-type" className="text-sm font-medium">Category</label>
            <select
              id="content-type"
              className={fieldClass}
              value={contentType}
              onChange={(event) => setContentType(event.target.value as ContentType)}
            >
              {CONTENT_TYPES.map((type) => (
                <option key={type} value={type}>{CONTENT_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>
          <PickerField
            label="Scholar"
            value={scholarId}
            onChange={setScholarId}
            options={scholars}
            newValue={newScholar}
            onNewValue={setNewScholar}
            onAdd={() => newScholar.trim() && addScholar.mutate(newScholar)}
            adding={addScholar.isPending}
            addLabel="New scholar name"
          />
          <PickerField
            label="Topic"
            value={topicId}
            onChange={setTopicId}
            options={topics}
            newValue={newTopic}
            onNewValue={setNewTopic}
            onAdd={() => newTopic.trim() && addTopic.mutate(newTopic)}
            adding={addTopic.isPending}
            addLabel="New topic name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="summary" className="text-sm font-medium">
            Answer or summary
          </label>
          <textarea
            id="summary"
            rows={6}
            className="w-full rounded-lg border border-input bg-card p-3 text-sm leading-relaxed outline-none transition-colors focus:border-primary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A concise written answer, lesson, or summary…"
          />
        </div>

        <Button
          type="submit"
          disabled={!canSave}
          className="h-11 px-6"
        >
          {saveFatwa.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save to library
        </Button>
      </form>
    </div>
  );
}

function PickerField({
  label,
  value,
  onChange,
  options,
  newValue,
  onNewValue,
  onAdd,
  adding,
  addLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
  newValue: string;
  onNewValue: (v: string) => void;
  onAdd: () => void;
  adding: boolean;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <select
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        <option value="">Not specified</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input
          className="h-9 flex-1 rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-primary"
          value={newValue}
          onChange={(e) => onNewValue(e.target.value)}
          placeholder={addLabel}
        />
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onAdd}
          disabled={adding || !newValue.trim()}
          className="shrink-0"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
