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
  ["Modelling", ["PyTorch", "HF Transformers", "scikit-learn"]],
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
    text: (
      <>
        <p>My previous experiences meant a lot to me, but I felt I had done what I set out to do and was ready to try something different. That brought me to ESN Porto, and joining turned out to be one of the best decisions I made.</p>
        <p>I met people from different backgrounds, courses, and nationalities. Being part of that community made me feel European in a way I hadn’t before.</p>
        <p>After one semester, I took on the role of IT manager. Together, we developed the new ESN Porto website and a requisitions app to track the section’s inventory. We also built a scholarship evaluation platform used to review hundreds of applications, automated event descriptions, and created the website for the International Erasmus Games. During that time, we won the Lobos d’Ouro award for Best National IT Initiative.</p>
        <p>Alongside my IT work, I helped organise 21 events, including trips, city tours, sports activities, and cultural nights.</p>
      </>
    ),
    photos: [
      {
        src: "/associations/esn/esn-team-pool.webp",
        alt: "ESN Porto retreat team building",
        caption: "ESN Porto retreat team building",
      },
      {
        src: "/associations/esn/esn-ski-trip.webp",
        alt: "ESN Serra da Estrela snow trip",
        caption: "Organizing team of the ESN trip to Serra da Estrela",
      },
      {
        src: "/associations/esn/esn-lisbon-praca.webp",
        alt: "Trip to Lisbon",
        caption: "Trip to Lisbon with exchange students",
      },
      {
        src: "/associations/esn/esn-vigo-trip.webp",
        alt: "ESN trip to Vigo",
        caption: "Trip to Vigo with exchange students",
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
    text: (
      <>
        <p>Together, we recruited speakers and curated the programme for SINF, the annual informatics week at the Faculty of Engineering of the University of Porto. We delivered the largest programme in six years, featuring 11 talks and 8 workshops over four days, up from 4 talks and 2 workshops in the previous edition.</p>
        <p>
          That edition also featured SINF’s first major international speaker,{" "}
          <a
            href="https://en.wikipedia.org/wiki/Steven_Pemberton"
            target="_blank"
            rel="noreferrer"
            className="text-fg underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white/70"
          >
            Steven Pemberton
          </a>
          . I had the opportunity to welcome him to Porto and talk with him about what it was like to live through the early days of the internet, the origins of Python, and how he sees the future of technology.
        </p>
      </>
    ),
    photos: [
      {
        src: "/associations/sinf/DJI_20251021161509_0007_D.jpg",
        alt: "Pedro Coelho speaking at SINF",
        caption: "Pedro Coelho's talk at SINF",
      },
      {
        src: "/associations/sinf/DSC_0787.jpg",
        alt: "Steven Pemberton speaking at SINF",
        caption: "Steven Pemberton's talk at SINF",
      },
      {
        src: "/associations/sinf/sinf-podium-presentation.webp",
        alt: "Opening Steven Pemberton's talk at SINF",
        caption: "Opening Steven Pemberton's talk at SINF",
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
    text: "ENEI was my first experience organising a conference. Throughout the year, I helped recruit speakers and shape the programme for this national student technology conference in Porto, featuring 25 talks and 21 workshops.\n\nAs part of the programme team, I worked on speaker outreach, scheduling, and logistics. It taught me that a first “no” isn’t always final, and that following up can sometimes open a door that seemed closed. I also got to work with incredible people along the way.",
    photos: [
      {
        src: "/associations/enei/enei-celebration.webp",
        alt: "ENEI's last meeting celebration with the team",
        caption: "ENEI's last meeting celebration with the team"
      },
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
        src: "/associations/enei/sinf-auditorium-discussion.webp",
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
          <p>
            Outside of research and code, you can usually find me playing tennis with friends or
            listening to podcasts, especially{" "}
            <a
              href="https://www.acquired.fm"
              target="_blank"
              rel="noreferrer"
              className="text-fg underline decoration-white/30 underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
            >
              Acquired 
            </a>{" "}
            and{" "}
            <a
              href="https://therestishistory.com"
              target="_blank"
              rel="noreferrer"
              className="text-fg underline decoration-white/30 underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
            >
              The Rest Is History
            </a>
            .
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

        <section className="relative mt-20 bg-bg" aria-labelledby="community-heading">
          <h2 id="community-heading" className="mb-8 text-xl font-medium tracking-[-0.02em]">Community & volunteering</h2>
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
