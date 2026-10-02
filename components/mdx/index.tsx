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
    <section className="transcript my-10 overflow-hidden rounded-sm bg-[#171717]">
      <header className="border-b border-white/10 px-5 py-6 sm:px-7">
        <h3 className="!m-0 !text-lg !font-medium !leading-snug !tracking-[-0.015em] !text-fg">{title}</h3>
        <p className="!mb-0 !mt-3 !text-xs !leading-relaxed !text-[#a3a3a3]">{meta}</p>
      </header>
      <div className="px-5 sm:px-7">{children}</div>
    </section>
  );
}

type TranscriptTone = "offer" | "reply" | "private" | "system";

export function TranscriptMessage({
  speaker,
  label,
  tone = "system",
  children,
}: {
  speaker: string;
  label?: string;
  tone?: TranscriptTone;
  children: ReactNode;
}) {
  return (
    <div data-tone={tone} className="grid gap-3 border-b border-white/[0.08] py-6 last:border-b-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
      <div className="min-w-0 text-xs leading-relaxed">
        <span className="block font-medium text-fg">{speaker}</span>
        {label && <span className="mt-1 block text-[#a3a3a3]">{label}</span>}
      </div>
      <div
        className="min-w-0 [overflow-wrap:anywhere] [&_p]:!my-0 [&_p]:!text-[0.95rem] [&_p]:!leading-7 [&_p+p]:!mt-3 [&_code]:!rounded-none [&_code]:!bg-transparent [&_code]:!p-0 [&_code]:!text-[0.8rem] [&_code]:!text-[#a3a3a3]"
      >
        {children}
      </div>
    </div>
  );
}

export function TranscriptOutcome({ children }: { children: ReactNode }) {
  return (
    <div className="py-6 [&_p]:!my-0 [&_p]:!text-sm [&_p]:!leading-6 [&_p]:!text-[#a3a3a3] [&_strong]:!font-medium [&_strong]:!text-fg">
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
