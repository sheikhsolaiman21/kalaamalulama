import { ArrowUpRight, BookOpen, Play } from "lucide-react";
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="group h-full min-h-72 w-full whitespace-normal rounded-lg p-0 text-left shadow-card hover:border-primary/50 hover:bg-card"
        >
          <article className="flex h-full w-full flex-col p-6">
            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <span>{typeLabel}</span>
              <BookOpen className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
            <h2 className="mt-7 font-display text-2xl leading-snug sm:text-3xl">{fatwa.title}</h2>
            {fatwa.summary_transcript && (
              <p className="mt-4 line-clamp-3 text-sm font-normal leading-relaxed text-muted-foreground">
                {fatwa.summary_transcript}
              </p>
            )}
            <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-border pt-5">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {scholar?.name ?? "Scholar not specified"}
                </p>
                {topic && <p className="mt-1 text-xs font-normal text-muted-foreground">{topic.name}</p>}
              </div>
              <span className="text-xs font-medium text-primary">Read & watch</span>
            </div>
          </article>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto p-0 sm:rounded-lg">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex flex-col p-6 sm:p-9 lg:min-h-[640px]">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <span className="rounded-full border border-border px-2.5 py-1">{typeLabel}</span>
              {topic && <span>{topic.name}</span>}
            </div>
            <DialogTitle className="mt-6 max-w-3xl font-display text-3xl font-normal leading-tight sm:text-4xl">
              {fatwa.title}
            </DialogTitle>
            <DialogDescription className="mt-3 text-sm font-medium text-foreground">
              {scholar?.name ?? "Scholar not specified"}
            </DialogDescription>
            <div className="mt-8 border-t border-border pt-7">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Answer</p>
              <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-foreground">
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
