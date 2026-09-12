import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CONTENT_TYPE_LABELS,
  toEmbedUrl,
  type Fatwa,
  type Scholar,
  type Topic,
} from "@/lib/fatawa";

export function FatwaCard({
  fatwa,
  scholar,
  topic,
}: {
  fatwa: Fatwa;
  scholar?: Scholar | undefined;
  topic?: Topic | undefined;
}) {
  const embed = toEmbedUrl(fatwa.instagram_url);
  const typeLabel = CONTENT_TYPE_LABELS[fatwa.content_type];
  const [saved, setSaved] = useState(false);
  const isFeatured = fatwa.title.toLowerCase().includes("combining prayers while travelling");

  useEffect(() => {
    const bookmarks = JSON.parse(window.localStorage.getItem("ulama-bookmarks") ?? "[]") as string[];
    setSaved(bookmarks.includes(fatwa.id));
  }, [fatwa.id]);

  const toggleSaved = () => {
    setSaved((current) => {
      const bookmarks = JSON.parse(window.localStorage.getItem("ulama-bookmarks") ?? "[]") as string[];
      const next = current ? bookmarks.filter((id) => id !== fatwa.id) : [...new Set([...bookmarks, fatwa.id])];
      window.localStorage.setItem("ulama-bookmarks", JSON.stringify(next));
      return !current;
    });
  };

  return (
    <Dialog>
      <div className="relative h-full">
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="group h-full min-h-80 w-full whitespace-normal rounded-lg border-border/80 bg-card/95 p-0 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:bg-sepia"
          >
            <article className="flex h-full w-full flex-col p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3 pr-9 text-xs uppercase text-muted-foreground">
                <span className="font-script text-lg normal-case text-gold">{typeLabel}</span>
                <BookOpen className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
              <h2 className={`mt-7 font-display text-2xl leading-snug transition-all duration-300 sm:text-3xl ${isFeatured ? "group-hover:title-amber-glow group-hover:text-gold" : ""}`}>
                {fatwa.title}
              </h2>
              {fatwa.summary_transcript && (
                <p className={`mt-5 line-clamp-3 font-display text-sm font-normal leading-relaxed text-muted-foreground ${fatwa.content_type === "advice" ? "first-letter:float-left first-letter:mr-2 first-letter:font-script first-letter:text-5xl first-letter:leading-[0.8] first-letter:text-gold" : ""}`}>
                  {fatwa.summary_transcript}
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-border/80 pt-5">
                <div>
                  <p className="font-script text-xl text-foreground">
                    {scholar?.name ?? "Scholar not specified"}
                  </p>
                  {topic && <p className="mt-1 text-xs font-normal text-muted-foreground">{topic.name}</p>}
                </div>
                <span className="text-xs font-medium text-gold">Read & watch</span>
              </div>
            </article>
          </Button>
        </DialogTrigger>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label={saved ? `Remove ${fatwa.title} from bookmarks` : `Bookmark ${fatwa.title}`}
          aria-pressed={saved}
          onClick={toggleSaved}
          className={`absolute right-4 top-4 z-10 rounded-full hover:bg-secondary ${saved ? "text-gold drop-shadow-[0_0_8px_var(--gold)]" : "text-muted-foreground"}`}
        >
          <Star className={saved ? "fill-current" : ""} />
        </Button>
      </div>

      <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto border-gold/30 bg-popover p-0 shadow-2xl sm:rounded-lg">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex flex-col p-6 sm:p-9 lg:min-h-[640px]">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <span className="font-script text-xl normal-case text-gold">{typeLabel}</span>
              {topic && <span>{topic.name}</span>}
            </div>
            <DialogTitle className="mt-6 max-w-3xl font-display text-3xl font-normal leading-tight sm:text-4xl">
              {fatwa.title}
            </DialogTitle>
            <DialogDescription className="mt-3 font-script text-2xl text-gold">
              {scholar?.name ?? "Scholar not specified"}
            </DialogDescription>
            <div className="mt-8 border-t border-border pt-7">
              <p className="text-xs uppercase text-muted-foreground">Answer</p>
              <p className="mt-4 whitespace-pre-wrap font-display text-base leading-8 text-foreground sm:text-lg">
                {fatwa.summary_transcript || "A written summary has not been added yet. Watch the original recording for the complete answer."}
              </p>
            </div>
            <a
              href={fatwa.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-medium text-primary hover:underline"
            >
              Open original source <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="flex min-h-[540px] items-center justify-center border-t border-border bg-surface p-3 lg:border-l lg:border-t-0">
            {embed ? (
              <iframe
                src={embed}
                title={`${fatwa.title} recording`}
                className="h-[620px] max-h-[76vh] w-full rounded-md bg-card"
                loading="lazy"
                allow="encrypted-media; picture-in-picture; clipboard-write"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
                <Play className="h-8 w-8" />
                <p className="text-sm">The recording is unavailable.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
