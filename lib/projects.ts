import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type ProjectMeta = {
  slug: string;
  title: string;
  tagline: string;
  year: number;
  kind?: string;
  tags: string[];
  stack: string[];
  accent: string;
  featured: boolean;
  order: number;
  repo: string;
  report?: string;
  reportLabel?: string;
  grade?: string;
  credits?: string;
  cover: string;
  coverSm: string;
};

export type Project = ProjectMeta & { content: string };

const DIR = path.join(process.cwd(), "content", "projects");

function load(file: string): Project {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = String(data.slug ?? file.replace(/\.mdx$/, ""));
  return {
    slug,
    title: String(data.title),
    tagline: String(data.tagline ?? ""),
    year: Number(data.year),
    kind: data.kind ? String(data.kind) : undefined,
    tags: (data.tags ?? []) as string[],
    stack: (data.stack ?? []) as string[],
    accent: String(data.accent ?? "#f5a524"),
    featured: Boolean(data.featured),
    order: Number(data.order ?? 999),
    repo: String(data.repo ?? ""),
    report: data.report ? String(data.report) : undefined,
    reportLabel: data.reportLabel ? String(data.reportLabel) : undefined,
    grade: data.grade ? String(data.grade) : undefined,
    credits: data.credits ? String(data.credits) : undefined,
    cover: `/projects/${slug}/cover.webp`,
    coverSm: `/projects/${slug}/cover-sm.webp`,
    content: content.trim(),
  };
}

let cache: Project[] | null = null;

export function getProjects(): Project[] {
  if (!cache) {
    cache = fs
      .readdirSync(DIR)
      .filter((f) => f.endsWith(".mdx"))
      .map(load)
      .sort((a, b) => a.order - b.order);
  }
  return cache;
}

export function getProjectMetas(): ProjectMeta[] {
  return getProjects().map((p) => {
    const meta: Partial<Project> = { ...p };
    delete meta.content;
    return meta as ProjectMeta;
  });
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}
