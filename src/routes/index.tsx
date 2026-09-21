import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FatwaCard } from "@/components/FatwaCard";
import {
  categoriesQuery,
  categoryLabel,
  fatawaQuery,
  scholarsQuery,
  topicsQuery,
} from "@/lib/fatawa";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kalaam al ulama — Knowledge from trusted scholars" },
      {
        name: "description",
        content:
          "Explore a curated library of fatawa, advice, reminders, motivation, and lectures from trusted scholars.",
      },
      { property: "og:title", content: "Kalaam al ulama — Scholar-led knowledge" },
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
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { data: fatawa = [], isLoading, error } = useQuery(fatawaQuery);
  const { data: scholars = [] } = useQuery(scholarsQuery);
  const { data: topics = [] } = useQuery(topicsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);

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
        <p className="font-script text-xl text-gold">Words of the Ulama</p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
          Kalaam al ulama
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Explore questions, fatawa, advice, reminders, and lectures—organized by scholar and topic
          so every answer is easy to return to.
        </p>
      </section>

      <>
        <div className="sticky top-20 z-30 -mx-1 mt-10 rounded-lg bg-surface/95 p-1 shadow-lg backdrop-blur-xl">
          <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            ref={searchRef}
            placeholder="Search questions and answers…"
            aria-label="Search the library"
            className="h-12 w-full rounded-lg border border-gold/45 bg-card pl-11 pr-16 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-gold focus:shadow-gold-focus"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
            /
          </kbd>
          </div>
        </div>

      <section className="-mx-3 mt-4 space-y-5 rounded-lg border border-border bg-surface/95 p-4 shadow-xl sm:p-5">
        <div className="space-y-3">
          <FilterRow
            label="Scholars"
            items={scholars}
            selected={scholarIds}
            onToggle={(id) => toggle(scholarIds, setScholarIds, id)}
          />
          <FilterRow
            label="Type"
            items={categories.map((c) => ({ id: c.slug, name: c.name }))}
            selected={contentTypes}
            onToggle={(id) => toggle(contentTypes, setContentTypes, id)}
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
      </>

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
          <div className="rounded-lg border border-dashed border-border bg-card/70 p-10 text-center">
            <p className="font-display text-xl text-foreground">The shelves are ready.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your own entries from the curator desk, or invite others to suggest videos.
            </p>
            <Link
              to="/submit"
              className="mt-6 inline-flex items-center justify-center rounded-md border border-gold/50 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
            >
              Suggest a video
            </Link>
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f, i) => (
            <div
              key={f.id}
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            >
            <FatwaCard
              key={f.id}
              fatwa={f}
              scholar={f.scholar_id ? scholarById.get(f.scholar_id) : undefined}
              topic={f.topic_id ? topicById.get(f.topic_id) : undefined}
              typeLabel={categoryLabel(f.content_type, categories)}
            />
            </div>
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
