import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type ProjectReport = {
  label: string;
  href: string;
};

export type ProjectMeta = {
  slug: string;
  title: string;
  tagline: string;
  year: number;
  kind?: string;
  tags: string[];
  stack: string[];
  accent: string;
  order: number;
  repo: string;
  reports: ProjectReport[];
  grade?: string;
  credits?: string;
  cover: string;
  coverSm: string;
  cardCover?: string;
  hidden?: boolean;
};

export type Project = ProjectMeta & { content: string };

const DIR = path.join(process.cwd(), "content", "projects");

// frontmatter lists a report as `{ file, label }`; `file` is a PDF served from
// public/projects/<slug>/, or an absolute URL if it lives somewhere else.
function reports(data: Record<string, unknown>, slug: string): ProjectReport[] {
  const list = Array.isArray(data.reports) ? data.reports : [];
  return list.map((r, i) => {
    const { file, label } = (r ?? {}) as { file?: unknown; label?: unknown };
    const src = String(file ?? "");
    if (!src) throw new Error(`${slug}: reports[${i}] has no file`);
    return {
      label: String(label ?? "report"),
      href: /^https?:\/\//.test(src) ? src : `/projects/${slug}/${src}`,
    };
  });
}

function load(file: string): Project {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = String(data.slug ?? file.replace(/\.mdx$/, ""));
  const coverFile = String(data.cover ?? "cover.webp");
  const coverSmFile = String(data.coverSm ?? coverFile);
  const cover = `/projects/${slug}/${coverFile}`;
  const coverSm = `/projects/${slug}/${coverSmFile}`;
  return {
    slug,
    title: String(data.title),
    tagline: String(data.tagline ?? ""),
    year: Number(data.year),
    kind: data.kind ? String(data.kind) : undefined,
    tags: (data.tags ?? []) as string[],
    stack: (data.stack ?? []) as string[],
    accent: String(data.accent ?? "#f5a524"),
    order: Number(data.order ?? 999),
    repo: String(data.repo ?? ""),
    reports: reports(data, slug),
    grade: data.grade ? String(data.grade) : undefined,
    credits: data.credits ? String(data.credits) : undefined,
    cover,
    coverSm,
    cardCover: fs.existsSync(path.join(process.cwd(), "public", "projects", slug, "cover-static.webp"))
      ? `/projects/${slug}/cover-static.webp`
      : cover,
    hidden: Boolean(data.hidden || data.draft),
    content: content.trim(),
  };
}

let cache: Project[] | null = null;

export function getProjects(): Project[] {
  // re-read in dev so adding or deleting an .mdx file shows up without restarting the server
  if (!cache || process.env.NODE_ENV === "development") {
    cache = fs
      .readdirSync(DIR)
      .filter((f) => f.endsWith(".mdx"))
      .map(load)
      .filter((p) => !p.hidden)
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
