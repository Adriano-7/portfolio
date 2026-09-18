import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name}, MSc in Artificial Intelligence at the University of Porto.`,
};

const skills: [string, string[]][] = [
  ["Modelling", ["PyTorch", "HF Transformers", "PEFT / LoRA", "Diffusers", "vLLM", "scikit-learn", "XGBoost"]],
  ["Domains", ["LLM agents", "NLP", "Computer vision", "Reinforcement learning", "Graph ML", "Synthetic data"]],
  ["Languages", ["Python", "C++", "C", "Java", "JavaScript", "Dart"]],
  ["Systems", ["FastAPI", "React / Next.js", "Flutter", "SLURM", "Docker", "Git", "Figma"]],
];

const timeline: { when: string; what: string; where: string }[] = [
  { when: "2024 – 2026", what: "MSc in Artificial Intelligence · thesis on open-weight LLMs as negotiation agents (18/20)", where: "FCUP / FEUP, University of Porto" },
  { when: "Jul – Oct 2025", what: "Student researcher: class imbalance in synthetic tabular data generation", where: "FEUP · LIACC · Fraunhofer AICOS Portugal" },
  { when: "Feb – Jun 2024", what: "Software engineering intern: store automations and multilingual email templates", where: "Jumpseller, Porto" },
  { when: "2021 – 2024", what: "BSc in Informatics and Computing Engineering", where: "FEUP, University of Porto" },
];

const associations: { org: string; role: string; when: string; text: string; href?: string; hrefLabel?: string }[] = [
  {
    org: "ESN Porto",
    role: "IT manager",
    when: "2025 – 2026",
    text: "Led the IT department of the Porto section of Europe's largest student association, which welcomes 3500+ exchange students each semester. Built the section's public website, an asset requisition platform and a scholarship evaluation platform, and a model that forecasts ESN Card demand. Won the Lobos d'Ouro award for best national IT initiative.",
    href: "https://github.com/Adriano-7/fcup-time-series-proj",
    hrefLabel: "forecasting project",
  },
  {
    org: "NIAEFEUP",
    role: "UNI development team",
    when: "2023 – 2025",
    text: "One of the three-person UI/UX team that led the redesign of UNI, the open-source Flutter app University of Porto students use every day, then part of the team implementing it.",
    href: "https://github.com/NIAEFEUP/uni",
    hrefLabel: "UNI on GitHub",
  },
  {
    org: "SINF",
    role: "Head of the program department",
    when: "2025",
    text: "Ran the program of Semana de Informática: 11 talks and 8 workshops, the largest line-up in six years. Speaker outreach, scheduling and on-site logistics with a team of volunteers.",
  },
  {
    org: "ENEI",
    role: "Program department",
    when: "2024 – 2025",
    text: "Recruited speakers and curated 25 talks and 21 workshops for the national meeting of informatics students.",
  },
];

export default function AboutPage() {
  return (
    <Reveal>
      <div className="mx-auto max-w-3xl px-5 pb-32 pt-28 md:px-8 md:pt-36">
        <p className="mono mb-6 text-muted">
          <Link href="/" className="text-fg/80 hover:text-fg">
            ← works
          </Link>
        </p>

        <h1 className="text-[clamp(1.9rem,5.4vw,3.2rem)] font-medium leading-[1.12] tracking-[-0.025em]">
          I&apos;m {site.firstName}, a {site.role} based in {site.location}.
        </h1>

        <div className="mt-8 space-y-5 text-[1.1rem] leading-[1.7] text-[#cfcfcf]">
          <p>
            I recently finished my MSc in Artificial Intelligence at the University of Porto. My thesis
            benchmarked open-weight language models as negotiation agents and measured whether inference-time
            techniques like Self-Refine and team deliberation are worth their cost. Before that I studied how
            class imbalance degrades synthetic tabular data generation as a student researcher with LIACC and
            Fraunhofer AICOS.
          </p>
          <p>
            I like problems where the model is only half the work: building the benchmark, running the sweep
            on a cluster, and being honest about what the numbers actually say. Most of the projects on this
            site come with the full experiment code and a written report.
          </p>
        </div>

        <section className="mt-16">
          <h2 className="mono mb-5 text-muted">Timeline</h2>
          <ol className="divide-y divide-white/10 border-y border-white/10">
            {timeline.map((t) => (
              <li key={t.what} className="grid gap-1 py-4 md:grid-cols-[130px_1fr]">
                <span className="mono text-muted-2">{t.when}</span>
                <div>
                  <p className="text-fg">{t.what}</p>
                  <p className="text-sm text-muted">{t.where}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16">
          <h2 className="mono mb-5 text-muted">Outside the lab</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {associations.map((a) => (
              <div key={a.org} className="rounded-2xl border border-white/10 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="mono text-accent">{a.org}</p>
                  <p className="mono text-muted-2">{a.when}</p>
                </div>
                <p className="mt-2 text-fg">{a.role}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{a.text}</p>
                {a.href && (
                  <a
                    href={a.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm text-fg/80 underline decoration-white/30 underline-offset-4 hover:decoration-accent"
                  >
                    {a.hrefLabel} ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mono mb-5 text-muted">Toolbox</h2>
          <div className="space-y-4">
            {skills.map(([group, items]) => (
              <div key={group} className="grid gap-2 md:grid-cols-[130px_1fr]">
                <span className="mono text-muted-2">{group}</span>
                <div className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <span key={s} className="rounded-full border border-white/12 px-3 py-1 text-sm text-fg/85">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mono mb-5 text-muted">Contact</h2>
          <div className="flex flex-wrap gap-3">
            {site.email && (
              <a href={`mailto:${site.email}`} className="pill">
                {site.email}
              </a>
            )}
            <a href={site.github} target="_blank" rel="noreferrer" className="pill !bg-transparent !text-fg ring-1 ring-white/15">
              github ↗
            </a>
            {site.linkedin && (
              <a href={site.linkedin} target="_blank" rel="noreferrer" className="pill !bg-transparent !text-fg ring-1 ring-white/15">
                linkedin ↗
              </a>
            )}
            {site.cv && (
              <a href={site.cv} target="_blank" rel="noreferrer" className="pill !bg-transparent !text-fg ring-1 ring-white/15">
                cv ↗
              </a>
            )}
          </div>
        </section>
      </div>
    </Reveal>
  );
}
