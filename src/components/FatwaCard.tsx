import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { toEmbedUrl, type Fatwa, type Scholar, type Topic } from "@/lib/fatawa";

export function FatwaCard({
  fatwa,
  scholar,
  topic,
}: {
  fatwa: Fatwa;
  scholar?: Scholar | undefined;
  topic?: Topic | undefined;
}) {
  const [playing, setPlaying] = useState(false);
  const embed = toEmbedUrl(fatwa.instagram_url);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-colors hover:border-primary/40">
      <div className="relative aspect-square w-full bg-surface">
        {playing && embed ? (
          <iframe
            src={embed}
            title={fatwa.title}
            className="h-full w-full"
            loading="lazy"
            allow="encrypted-media; picture-in-picture; clipboard-write"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            disabled={!embed}
            className="flex h-full w-full flex-col items-center justify-center gap-3 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 hairline-grid" aria-hidden />
            <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Play className="h-5 w-5 translate-x-[1px]" />
            </span>
            <span className="relative text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {embed ? "Play on Instagram" : "Link unavailable"}
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {scholar && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              {scholar.name}
            </span>
          )}
          {topic && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
              {topic.name}
            </span>
          )}
        </div>

        <h2 className="font-display text-xl leading-snug">{fatwa.title}</h2>

        {fatwa.summary_transcript && (
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
            {fatwa.summary_transcript}
          </p>
        )}

        <a
          href={fatwa.instagram_url}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs font-medium text-primary hover:underline"
        >
          View original post <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}
