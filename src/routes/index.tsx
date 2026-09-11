import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { FatwaCard } from "@/components/FatwaCard";
import { fatawaQuery, scholarsQuery, topicsQuery } from "@/lib/fatawa";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fatawa Library — Browse Instagram rulings by scholar and topic" },
      {
        name: "description",
        content:
          "Search a curated catalog of Instagram fatawa. Filter by scholar or topic, read the transcript summary, and watch the original clip.",
      },
      { property: "og:title", content: "Fatawa Library — Instagram rulings, organized" },
      {
        property: "og:description",
        content: "Search and filter a curated catalog of Instagram fatawa by scholar and topic.",
      },
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
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-sm transition-colors " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")
      }
    >
      {label}
    </button>
  );
}

function Catalog() {
  const [search, setSearch] = useState("");
  const [scholarIds, setScholarIds] = useState<string[]>([]);
  const [topicIds, setTopicIds] = useState<string[]>([]);

  const { data: fatawa = [], isLoading, error } = useQuery(fatawaQuery);
  const { data: scholars = [] } = useQuery(scholarsQuery);
  const { data: topics = [] } = useQuery(topicsQuery);

  const scholarById = useMemo(() => new Map(scholars.map((s) => [s.id, s])), [scholars]);
  const topicById = useMemo(() => new Map(topics.map((t) => [t.id, t])), [topics]);

  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fatawa.filter((f) => {
      if (scholarIds.length && (!f.scholar_id || !scholarIds.includes(f.scholar_id))) return false;
      if (topicIds.length && (!f.topic_id || !topicIds.includes(f.topic_id))) return false;
      if (!q) return true;
      return (
        f.title.toLowerCase().includes(q) ||
        (f.summary_transcript ?? "").toLowerCase().includes(q)
      );
    });
  }, [fatawa, search, scholarIds, topicIds]);

  const hasFilters = search || scholarIds.length > 0 || topicIds.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <section className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {fatawa.length} rulings archived
        </p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
          A quiet, searchable home for Instagram fatawa.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Every clip is filed under its scholar and topic, with a short transcript summary so you
          can find the answer before you press play.
        </p>
      </section>

      <section className="mt-10 space-y-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles and transcripts…"
            aria-label="Search fatawa"
            className="h-12 w-full rounded-lg border border-input bg-card pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
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
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setScholarIds([]);
                setTopicIds([]);
              }}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>
      </section>

      <section className="mt-8">
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
            No fatawa match your filters yet.
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
