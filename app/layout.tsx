import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { getProjectMetas } from "@/lib/projects";
import { site } from "@/lib/site";
import { SceneRoot } from "@/components/canvas/SceneRoot";
import { Header } from "@/components/ui/Header";
import { Menu } from "@/components/ui/Menu";
import { Loader } from "@/components/ui/Loader";
import { RouteSync } from "@/components/ui/RouteSync";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Lightbox } from "@/components/ui/Lightbox";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — portfolio`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: { type: "website", siteName: site.name, title: site.name, description: site.description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const projects = getProjectMetas();
  return (
    // no height on <html>: pinning it to the viewport freezes the ResizeObserver
    // Lenis uses to track the page height, which caps scrolling on long pages
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <Suspense fallback={null}>
          <RouteSync />
        </Suspense>
        <SmoothScroll />
        <SceneRoot projects={projects} />
        <main className="relative z-10">{children}</main>
        <Header />
        <Menu />
        <Loader count={projects.length} />
        <Lightbox />
        <Analytics />
      </body>
    </html>
  );
}
