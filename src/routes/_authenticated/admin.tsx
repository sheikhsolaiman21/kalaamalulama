import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ensureCuratorRole } from "@/lib/auth";
import {
  categoriesQuery,
  fatawaQuery,
  scholarsQuery,
  slugify,
  isValidUrl,
  topicsQuery,
} from "@/lib/fatawa";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Add knowledge — Kalaam al ulama" },
      {
        name: "description",
        content:
          "Add a scholar's answer, advice, reminder, motivation, or lecture to the library.",
      },
      { property: "og:title", content: "Add knowledge — Kalaam al ulama" },
      {
        property: "og:description",
        content: "Add scholar-led knowledge with a category, topic, summary, and source.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-all focus:border-gold focus:shadow-gold-focus";

function AdminPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: scholars = [] } = useQuery(scholarsQuery);
  const { data: topics = [] } = useQuery(topicsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [scholarId, setScholarId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [contentType, setContentType] = useState("fatwa");
  const [newScholar, setNewScholar] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Make sure the curator account holds the admin role before writing.
  useEffect(() => {
    ensureCuratorRole().catch((e: Error) => toast.error(e.message));
  }, []);

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

  const addCategory = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name: name.trim(), slug: slugify(name) })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setNewCategory("");
      setContentType(data.slug);
      queryClient.invalidateQueries({ queryKey: categoriesQuery.queryKey });
      toast.success("Category added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveFatwa = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("fatawa").insert({
        title: title.trim(),
        summary_transcript: summary.trim() || null,
        video_url: url.trim(),
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
      queryClient.invalidateQueries({ queryKey: fatawaQuery.queryKey });
      toast.success("Entry saved to the library");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const urlValid = !url || isValidUrl(url);
  const canSave = title.trim() && url.trim() && urlValid && !saveFatwa.isPending;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-script text-xl text-gold">Curator desk</p>
          <h1 className="mt-2 text-4xl">Add to the library</h1>
        </div>
        <Link
          to="/review"
          className="shrink-0 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-gold hover:text-gold"
        >
          Review submissions
        </Link>
        <Button variant="outline" size="sm" onClick={signOut} className="shrink-0">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Add the scholar, category, question, answer, and source. It appears in the{" "}
        <Link to="/" className="text-gold hover:underline">
          catalog
        </Link>{" "}
        immediately.
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
            placeholder="YouTube, TikTok, Instagram, Facebook, Vimeo…"
            required
          />
          {!urlValid && (
            <p className="text-xs text-destructive">
              Please paste a full link starting with https://
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <PickerField
            label="Category"
            value={contentType}
            onChange={setContentType}
            options={categories.map((c) => ({ id: c.slug, name: c.name }))}
            allowEmpty={false}
            newValue={newCategory}
            onNewValue={setNewCategory}
            onAdd={() => newCategory.trim() && addCategory.mutate(newCategory)}
            adding={addCategory.isPending}
            addLabel="New category name"
          />
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
            className="w-full rounded-lg border border-input bg-card p-3 text-sm leading-relaxed outline-none transition-all focus:border-gold focus:shadow-gold-focus"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A concise written answer, lesson, or summary…"
          />
        </div>

        <Button type="submit" disabled={!canSave} className="h-11 px-6">
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
  allowEmpty = true,
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
  allowEmpty?: boolean;
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
        {allowEmpty && <option value="">Not specified</option>}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input
          className="h-9 flex-1 rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-gold"
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
