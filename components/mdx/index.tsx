import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { FigureImage } from "@/components/ui/FigureImage";

export function Lead({ children }: { children: ReactNode }) {
  return (
    <div className="!mt-0 !text-[1.125rem] !leading-[1.65] !text-fg [&>p]:!mt-0 [&>p]:!text-[1.125rem] [&>p]:!leading-[1.65] [&>p]:!text-fg">
      {children}
    </div>
  );
}

export function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-10">
      <FigureImage src={src} alt={alt} caption={caption} />
      {caption && <figcaption className="mono mt-3 normal-case tracking-normal text-muted">{caption}</figcaption>}
    </figure>
  );
}

export function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full border-collapse text-left text-[0.95rem]">
        <thead>
          <tr className="bg-white/[0.04]">
            {head.map((h) => (
              <th key={h} className="mono px-4 py-3 font-normal text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-white/[0.07]">
              {r.map((c, j) => (
                <td key={j} className={`px-4 py-3 align-top ${j === 0 ? "text-fg" : "text-[#cfcfcf]"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Transcript({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <section className="my-8 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
      <header className="border-b border-white/10 bg-white/[0.03] px-5 py-4">
        <h3 className="!mt-0 !text-base !font-medium !text-fg">{title}</h3>
        <p className="mono !mb-0 !mt-1 text-xs normal-case tracking-normal text-muted">{meta}</p>
      </header>
      <div className="space-y-4 px-5 py-5">{children}</div>
    </section>
  );
}

const transcriptTone = {
  offer: "border-[#f5a524]/35 bg-[#f5a524]/[0.07]",
  reply: "border-sky-300/25 bg-sky-300/[0.05]",
  private: "border-violet-300/25 bg-violet-300/[0.05]",
  system: "border-white/10 bg-white/[0.03]",
} as const;

export function TranscriptMessage({
  speaker,
  label,
  tone = "system",
  children,
}: {
  speaker: string;
  label?: string;
  tone?: keyof typeof transcriptTone;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4">
      <div className="mono pt-2 text-[0.68rem] uppercase tracking-[0.12em] text-muted">
        <span className="block text-fg">{speaker}</span>
        {label && <span className="mt-0.5 block">{label}</span>}
      </div>
      <div
        className={`rounded-lg border px-4 py-3 text-[0.95rem] leading-7 text-[#d4d4d4] [&_p]:!my-0 [&_p+p]:!mt-2 [&_code]:rounded [&_code]:bg-black/20 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_code]:text-fg ${transcriptTone[tone]}`}
      >
        {children}
      </div>
    </div>
  );
}

export function TranscriptOutcome({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-emerald-300/25 bg-emerald-300/[0.06] px-4 py-3 text-[0.95rem] leading-7 text-[#d4d4d4] [&_p]:!my-0 [&_strong]:font-medium [&_strong]:text-emerald-200">
      {children}
    </div>
  );
}

function A(props: ComponentPropsWithoutRef<"a">) {
  const external = props.href?.startsWith("http");
  return <a {...props} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} />;
}

export function Video({
  src,
  caption,
  poster,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
}: {
  src: string;
  caption?: string;
  poster?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}) {
  return (
    <figure className="my-10">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
        <video
          src={src}
          poster={poster}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          preload="metadata"
          className="block aspect-video w-full"
        />
      </div>
      {caption && <figcaption className="mono mt-3 normal-case tracking-normal text-muted">{caption}</figcaption>}
    </figure>
  );
}

export const mdxComponents: MDXComponents = {
  Lead,
  Figure,
  Table,
  Transcript,
  TranscriptMessage,
  TranscriptOutcome,
  Video,
  video: Video,
  a: A,
};
