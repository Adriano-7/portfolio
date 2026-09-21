import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

import { AssociationShowcase, type Association } from "@/components/ui/AssociationShowcase";

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

const associations: Association[] = [
  {
    org: "ESN Porto",
    role: "IT manager",
    when: "2025 – 2026",
    text: "Led the IT department of the Porto section of Europe's largest student association, which welcomes 3500+ exchange students each semester. Built the section's public website, an asset requisition platform and a scholarship evaluation platform, and a model that forecasts ESN Card demand. Won the Lobos d'Ouro award for best national IT initiative.",
    photos: [
      {
        src: "/associations/esn/esn-team-pool.webp",
        alt: "ESN Porto retreat team building",
        caption: "ESN Porto retreat team building",
      },
      {
        src: "/associations/esn/esn-vigo-trip.webp",
        alt: "ESN trip to Vigo",
        caption: "Trip to Vigo with exchange students",
      },
      {
        src: "/associations/esn/esn-lisbon-praca.webp",
        alt: "Trip to Lisbon",
        caption: "Trip to Lisbon with exchange students",
      },
      {
        src: "/associations/esn/esn-ski-trip.webp",
        alt: "ESN Serra da Estrela snow trip",
        caption: "Organizing team of the ESN trip to Serra da Estrela",
      },
      {
        src: "/associations/esn/esn-sports-padel.webp",
        alt: "ESN Porto padel tournament",
        caption: "ESN Porto padel tournament with international students",
      },
      {
        src: "/associations/esn/esn-porto-ribeira.webp",
        alt: "ESN Porto welcoming international students",
        caption: "Giving a city tour in Porto to international students during the welcome week",
      },
    ],
  },
  {
    org: "SINF",
    role: "Head of the program department",
    when: "2025",
    text: "Ran the program of Semana de Informática: 11 talks and 8 workshops, the largest line-up in six years. Speaker outreach, scheduling and on-site logistics with a team of volunteers.",
    photos: [
      {
        src: "/associations/sinf/sinf-podium-presentation.webp",
        alt: "Opening Steven Pemberton's talk at FEUP",
        caption: "Opening Steven Pemberton's talk at FEUP",
      },
      {
        src: "/associations/sinf/sinf-team-clifford-stoll.webp",
        alt: "Photo with Steven Pemberton after his talk at SINF",
        caption: "Photo with Steven Pemberton after his talk at SINF",
      },
    ],
  },
  {
    org: "ENEI",
    role: "Program department",
    when: "2024 – 2025",
    text: "Recruited speakers and curated 25 talks and 21 workshops for the national meeting of informatics students.",
    photos: [
      {
        src: "/associations/enei/enei-stage-team.webp",
        alt: "ENEI program team photo with Mike Pound",
        caption: "ENEI program team photo with Mike Pound, keynote speaker at ENEI"
      },
      {
        src: "/associations/enei/enei-speaker-team.webp",
        alt: "Photo with Eddie Aftandilian ",
        caption: "Photo with Eddie Aftandilian, keynote speaker at ENEI"
      },
      {
        src: "/associations/enei/enei-celebration.webp",
        alt: "ENEI's last meeting celebration with the team",
        caption: "ENEI's last meeting celebration with the team"
      },
      {
        src: "/associations/sinf/sinf-auditorium-discussion.webp",
        alt: "Interacting with Mike Pound after his talk at SINF",
        caption: "Interacting with Mike Pound after his talk at SINF"
      },
    ],
  },
  {
    org: "NIAEFEUP",
    role: "UNI development team",
    when: "2023 – 2025",
    text: "One of the three-person UI/UX team that led the redesign of UNI, the open-source Flutter app University of Porto students use every day, then part of the team implementing it.",
    href: "https://github.com/NIAEFEUP/uni",
    hrefLabel: "UNI on GitHub",
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
            class imbalance degrades synthetic tabular data generation as a student researcher.
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
          <h2 className="mono mb-5 text-muted">Outside the lab</h2>
          <AssociationShowcase associations={associations} />
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
