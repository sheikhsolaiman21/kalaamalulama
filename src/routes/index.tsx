import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FatwaCard } from "@/components/FatwaCard";
import {
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  fatawaQuery,
  scholarsQuery,
  topicsQuery,
  type ContentType,
} from "@/lib/fatawa";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ulama Library — Knowledge from trusted scholars" },
      {
        name: "description",
        content:
          "Explore a curated library of fatawa, advice, reminders, motivation, and lectures from trusted scholars.",
      },
      { property: "og:title", content: "Ulama Library — Scholar-led knowledge" },
      {
        property: "og:description",
        content: "Search and filter a curated library of scholar-led answers, advice, and reminders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Catalog,
});

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      type="button"
      onClick={onClick}
      className={`rounded-full font-normal ${active ? "border-gold bg-gold text-gold-foreground hover:bg-gold/90" : ""}`}
    >
      {label}
    </Button>
  );
}

function Catalog() {
  const [search, setSearch] = useState("");
  const [scholarIds, setScholarIds] = useState<string[]>([]);
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);

  const { data: fatawa = [], isLoading, error } = useQuery(fatawaQuery);
  const { data: scholars = [] } = useQuery(scholarsQuery);
  const { data: topics = [] } = useQuery(topicsQuery);

  const scholarById = useMemo(() => new Map(scholars.map((s) => [s.id, s])), [scholars]);
  const topicById = useMemo(() => new Map(topics.map((t) => [t.id, t])), [topics]);

  const toggle = <T extends string>(list: T[], set: (v: T[]) => void, id: T) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fatawa.filter((f) => {
      if (scholarIds.length && (!f.scholar_id || !scholarIds.includes(f.scholar_id))) return false;
      if (topicIds.length && (!f.topic_id || !topicIds.includes(f.topic_id))) return false;
      if (contentTypes.length && !contentTypes.includes(f.content_type)) return false;
      if (!q) return true;
      return (
        f.title.toLowerCase().includes(q) ||
        (f.summary_transcript ?? "").toLowerCase().includes(q)
      );
    });
  }, [fatawa, search, scholarIds, topicIds, contentTypes]);

  const hasFilters = search || scholarIds.length > 0 || topicIds.length > 0 || contentTypes.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <section className="max-w-2xl">
        <p className="font-script text-xl text-gold">
          Knowledge from the ulama
        </p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
          Seek knowledge from trusted scholars.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Explore questions, fatawa, advice, reminders, and lectures—organized by scholar and topic
          so every answer is easy to return to.
        </p>
      </section>

      <section className="sticky top-16 z-30 -mx-3 mt-10 space-y-5 rounded-lg border border-border bg-surface/95 p-4 shadow-xl backdrop-blur-xl sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions and answers…"
            aria-label="Search the library"
            className="h-12 w-full rounded-lg border border-gold/45 bg-card pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-gold focus:shadow-gold-focus"
          />
        </div>

        <div className="space-y-3">
          <FilterRow
            label="Scholars"
            items={scholars}
            selected={scholarIds}
            onToggle={(id) => toggle(scholarIds, setScholarIds, id)}
          />
          <FilterRow
            label="Type"
            items={CONTENT_TYPES.map((type) => ({ id: type, name: CONTENT_TYPE_LABELS[type] }))}
            selected={contentTypes}
            onToggle={(id) => toggle(contentTypes, setContentTypes, id as ContentType)}
          />
          <FilterRow
            label="Topics"
            items={topics}
            selected={topicIds}
            onToggle={(id) => toggle(topicIds, setTopicIds, id)}
          />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length} of {fatawa.length}
          </p>
          {hasFilters && (
            <Button
              variant="link"
              size="sm"
              type="button"
              onClick={() => {
                setSearch("");
                setScholarIds([]);
                setTopicIds([]);
                setContentTypes([]);
              }}
              className="font-script text-lg text-gold"
            >
              <X className="h-3.5 w-3.5" /> Clear All Filters
            </Button>
          )}
        </div>
      </section>

      <section className="mt-10">
        {error && (
          <p className="rounded-lg border border-border bg-card p-6 text-sm text-destructive">
            Could not load the library. Please refresh and try again.
          </p>
        )}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-xl border border-border bg-surface" />
            ))}
          </div>
        )}
        {!isLoading && filtered.length === 0 && !error && (
          <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No entries match your filters yet.
          </p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <FatwaCard
              key={f.id}
              fatwa={f}
              scholar={f.scholar_id ? scholarById.get(f.scholar_id) : undefined}
              topic={f.topic_id ? topicById.get(f.topic_id) : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function FilterRow({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: { id: string; name: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {items.map((item) => (
        <Chip
          key={item.id}
          label={item.name}
          active={selected.includes(item.id)}
          onClick={() => onToggle(item.id)}
        />
      ))}
    </div>
  );
}
