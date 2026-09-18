import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="!mt-0 !text-[1.25rem] !leading-[1.55] !text-fg md:!text-[1.45rem]">{children}</p>
  );
}

export function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-10">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="block w-full" />
      </div>
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

function A(props: ComponentPropsWithoutRef<"a">) {
  const external = props.href?.startsWith("http");
  return <a {...props} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} />;
}

export const mdxComponents: MDXComponents = { Lead, Figure, Table, a: A };
