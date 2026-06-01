"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { getAboutContentBySlug, getHomeContent } from "@/lib/api";

type HomeContent = {
  siteName?: string;
  headerLogo?: string;
  partnerLogos?: string[] | null;
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;
};

type AboutContent = {
  title?: string;
  subtitle?: string;
  description?: string;
  mission?: string;
  vision?: string;
  content?: string | { html?: string };
};

type CollaborationArea = {
  title: string;
  desc: string;
};

const collaborationAreas: CollaborationArea[] = [
  {
    title: "Research collaboration",
    desc: "Joint studies, fieldwork, academic exchange, and shared research outputs.",
  },
  {
    title: "Training & education",
    desc: "Workshops, capacity building, student activities, and knowledge transfer.",
  },
  {
    title: "Events & networks",
    desc: "Conferences, seminars, technical meetings, and regional cooperation.",
  },
];

function getHtmlContent(content?: string | { html?: string }) {
  if (!content) return "";
  if (typeof content === "string") return content;
  return content.html || "";
}

function getImageUrl(url?: string) {
  if (!url) return "";

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-roym.onrender.com";
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

export default function PartenairesAboutPage() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const [homeRes, aboutRes] = await Promise.all([
          getHomeContent(),
          getAboutContentBySlug("partners"),
        ]);

        if (homeRes?.data) setHome(homeRes.data);
        if (aboutRes?.data) setAbout(aboutRes.data);
      } catch (error) {
        console.error("FETCH PARTENAIRES ABOUT ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, []);

  const htmlContent = useMemo(() => getHtmlContent(about?.content), [about]);

  const partnerLogos = Array.isArray(home?.partnerLogos)
    ? home.partnerLogos
    : [];

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#eef3f7] py-10">
        <Container>
          <div className="space-y-8">
            <section className="rounded-[28px] bg-white p-8 shadow-md md:p-10">
              <div className="mb-8">
                <Link
                  href="/about"
                  className="mb-6 inline-flex rounded-full bg-[#eef6ff] px-5 py-3 text-sm font-bold text-[#0f6fb8] transition hover:bg-[#0f6fb8] hover:text-white"
                >
                  ← Back to About
                </Link>

                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#7ab648]">
                      Partenaires
                    </p>

                    <h1 className="text-[42px] font-bold leading-tight text-[#2c3e50] md:text-[52px]">
                      Partner logos
                    </h1>

                    <p className="mt-3 max-w-3xl text-[17px] leading-8 text-gray-600">
                      Institutions and organizations collaborating with IMRWG.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f4faee] px-6 py-4 text-center">
                    <p className="text-sm font-semibold text-gray-500">
                      Total partners
                    </p>
                    <p className="mt-1 text-3xl font-bold text-[#7ab648]">
                      {partnerLogos.length}
                    </p>
                  </div>
                </div>
              </div>

              {partnerLogos.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {partnerLogos.map((logo, index) => (
                    <div
                      key={index}
                      className="flex h-[150px] items-center justify-center rounded-2xl border border-slate-200 bg-[#f8fbff] p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
                    >
                      <img
                        src={getImageUrl(logo)}
                        alt={`Partner logo ${index + 1}`}
                        className="max-h-[90px] max-w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-gray-50 p-10 text-center text-gray-500">
                  Chưa có logo đối tác. Bạn có thể thêm ở admin Home.
                </div>
              )}
            </section>

            <section className="rounded-[28px] bg-white p-8 shadow-md md:p-10">
              <div className="mb-7">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#7ab648]">
                  Collaboration
                </p>

                <h2 className="text-[34px] font-bold text-[#2c3e50]">
                  What partners contribute
                </h2>

                <p className="mt-3 max-w-3xl text-[16px] leading-7 text-gray-600">
                  Our partners support research, education, events, data
                  sharing, and regional knowledge exchange.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {collaborationAreas.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-6 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <h3 className="text-[21px] font-bold text-[#2c3e50]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-[15px] leading-7 text-slate-600">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {!loading && htmlContent && (
              <section className="rounded-[28px] bg-white p-8 shadow-md md:p-10">
                <div className="mb-6">
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#7ab648]">
                    Details
                  </p>

                  <h2 className="text-[34px] font-bold text-[#2c3e50]">
                    About our partners
                  </h2>
                </div>

                <article
                  className="
                    max-w-none text-[17px] leading-8 text-gray-700
                    [&_h1]:mb-5 [&_h1]:mt-8 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-[#2c3e50]
                    [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-[#2c3e50]
                    [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-[#2c3e50]
                    [&_p]:mb-5
                    [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc
                    [&_ol]:mb-6 [&_ol]:ml-6 [&_ol]:list-decimal
                    [&_li]:mb-2
                    [&_a]:font-semibold [&_a]:text-[#0f6fb8] [&_a]:underline
                    [&_img]:my-8 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-2xl [&_img]:object-cover
                    [&_table]:my-6 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto
                  "
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </section>
            )}

            {loading && (
              <section className="rounded-[28px] bg-white p-8 shadow-md md:p-10">
                <div className="rounded-xl bg-gray-50 p-10 text-center text-gray-500">
                  Đang tải nội dung Partenaires...
                </div>
              </section>
            )}
          </div>
        </Container>
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