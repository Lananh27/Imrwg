"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { getHomeContent } from "@/lib/api";

type HomeContent = {
  siteName?: string;
  headerLogo?: string;
  partnerLogos?: string[] | null;
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;
};

type AboutSubPageProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  compact?: boolean;
  children: React.ReactNode;
};

export default function AboutSubPage({
  eyebrow,
  title,
  subtitle,
  compact = false,
  children,
}: AboutSubPageProps) {
  const [home, setHome] = useState<HomeContent | null>(null);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await getHomeContent();
        if (res?.data) setHome(res.data);
      } catch (error) {
        console.error("FETCH HOME ERROR:", error);
      }
    };

    fetchHome();
  }, []);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#eef5ff]">
        <section className="relative overflow-hidden bg-white">
          <div className="absolute left-[-160px] top-[-160px] h-[320px] w-[320px] rounded-full bg-lime-300/25 blur-3xl" />
          <div className="absolute right-[-180px] top-[-120px] h-[380px] w-[380px] rounded-full bg-blue-400/15 blur-3xl" />

          <Container>
            <div
              className={`relative mx-auto max-w-5xl px-4 text-center ${
                compact ? "py-10 md:py-14" : "py-16 md:py-24"
              }`}
            >
              <span className="inline-flex items-center rounded-full border border-lime-300 bg-lime-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-lime-700 shadow-sm">
                {eyebrow}
              </span>

              <h1
                className={`mx-auto mt-5 max-w-4xl font-black leading-tight tracking-tight text-slate-950 ${
                  compact ? "text-4xl md:text-5xl" : "text-4xl md:text-6xl"
                }`}
              >
                {title}
              </h1>

              <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                {subtitle}
              </p>

              <div className="mx-auto mt-6 h-1.5 w-24 rounded-full bg-lime-400" />
            </div>
          </Container>
        </section>

        <section className={compact ? "py-8 md:py-10" : "py-10 md:py-16"}>
          <Container>
            <div className="mx-auto max-w-6xl px-4">
              <div
                className={`rounded-[28px] border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] ${
                  compact ? "p-6 md:p-8" : "p-6 md:p-10 lg:p-12"
                }`}
              >
                {children}
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer
        footerLogo={home?.footerLogo}
        footerMailingText={home?.footerMailingText}
        footerContactText={home?.footerContactText}
        footerSocialText={home?.footerSocialText}
      />
    </>
  );
}