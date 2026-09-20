import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getProject, getProjects } from "@/lib/projects";
import { mdxComponents } from "@/components/mdx";
import { Reveal } from "@/components/ui/Reveal";
import { HeroCover } from "@/components/ui/HeroCover";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.tagline,
    openGraph: { title: p.title, description: p.tagline, images: [{ url: p.cover, width: 1280, height: 800 }] },
  };
}

export default async function WorkPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const all = getProjects();
  const idx = all.findIndex((p) => p.slug === slug);
  const next = all[(idx + 1) % all.length];

  return (
    <Reveal>
      <article className="mx-auto max-w-3xl px-5 pb-32 pt-28 md:px-8 md:pt-36">
        <p className="mono mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
          <Link href="/" className="text-fg/80 hover:text-fg">
            ← works
          </Link>
          <span aria-hidden>/</span>
          <span>{project.kind}</span>
          <span aria-hidden>·</span>
          <span>{project.year}</span>
          {project.grade && (
            <>
              <span aria-hidden>·</span>
              <span className="text-accent">{project.grade}</span>
            </>
          )}
        </p>
        <h1 className="text-[clamp(2rem,6vw,3.6rem)] font-medium leading-[1.05] tracking-[-0.025em]">
          {project.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{project.tagline}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <span key={s} className="mono rounded-full border border-white/12 px-3 py-1.5 text-fg/80">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={project.repo} target="_blank" rel="noreferrer" className="pill">
            github ↗
          </a>
          {project.reports.map((r) => (
            <a key={r.href} href={r.href} target="_blank" rel="noreferrer" className="pill !bg-transparent !text-fg ring-1 ring-white/15">
              {r.label} ↗
            </a>
          ))}
        </div>

        <HeroCover slug={project.slug} src={project.cover} />

        {project.credits && <p className="mono mt-4 normal-case tracking-normal text-muted-2">{project.credits}</p>}

        <div className="prose mt-6">
          <MDXRemote source={project.content} components={mdxComponents} options={{ blockJS: false }} />
        </div>

        <footer className="mt-24 border-t border-white/10 pt-8">
          <p className="mono text-muted">next case study</p>
          <Link href={`/work/${next.slug}`} className="mt-2 block text-2xl font-medium tracking-[-0.02em] hover:text-accent">
            {next.title} →
          </Link>
        </footer>
      </article>
    </Reveal>
  );
}
