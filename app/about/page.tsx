"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { getAboutContent, getHomeContent } from "@/lib/api";

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

function getHtmlContent(content?: string | { html?: string }) {
  if (!content) return "";

  if (typeof content === "string") {
    return content;
  }

  return content.html || "";
}

function extractPlainText(input: string) {
  if (!input) return "";

  if (typeof window !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, "text/html");
    const text = doc.body.textContent || "";
    return text.replace(/\s+/g, " ").trim();
  }

  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getShortText(text: string, maxLength = 420) {
  if (!text) return "";

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength).trim()}...`;
}

export default function AboutPage() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeRes, aboutRes] = await Promise.all([
          getHomeContent(),
          getAboutContent(),
        ]);

        if (homeRes?.data) setHome(homeRes.data);
        if (aboutRes?.data) setAbout(aboutRes.data);
      } catch (error) {
        console.error("FETCH ABOUT PAGE ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const htmlContent = useMemo(() => {
    return getHtmlContent(about?.content);
  }, [about]);

  const plainText = useMemo(() => {
    return extractPlainText(htmlContent);
  }, [htmlContent]);

  const pageTitle = about?.title || "About IMRWG";

  const pageSubtitle =
    about?.subtitle || "International Mekong Research Working Group";

  const summary =
    about?.description ||
    getShortText(plainText) ||
    "A collaborative research network advancing knowledge, partnerships, and sustainable solutions for the Mekong region.";

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen overflow-hidden bg-[#eef5ff]">

        <section className="relative py-10 md:py-16">
          <Container>
            <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[340px_minmax(0,1fr)]">
              <aside className="lg:sticky lg:top-8 lg:self-start">
                <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                  <div className="bg-gradient-to-br from-[#123a7a] to-[#0b5ec9] p-6 text-white">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-lime-300">
                      Overview
                    </p>

                    <h2 className="mt-3 text-2xl font-black leading-tight">
                      Research collaboration for the Mekong region
                    </h2>
                  </div>

                  <div className="space-y-5 p-6">
                    <p className="break-words text-sm leading-7 text-slate-600">
                      {summary}
                    </p>

                    <div className="h-px bg-slate-100" />

                    <div className="grid gap-3">
                      <div className="rounded-2xl bg-lime-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-200 text-lg">
                            🌿
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-950">
                              Sustainable research
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              Supporting resilient environmental and social systems.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-200 text-lg">
                            🌏
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-950">
                              Regional cooperation
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              Connecting people, institutions, and knowledge.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              <article className="min-w-0 overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.09)]">
                <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 md:px-10">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-lime-600">
                    About IMRWG
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950 md:text-3xl">
                    Background and purpose
                  </h2>
                </div>

                <div className="min-w-0 px-6 py-8 md:px-10 md:py-10 lg:px-12">
                  {loading ? (
                    <div className="space-y-5">
                      <div className="h-8 w-64 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-10/12 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-8/12 animate-pulse rounded bg-slate-100" />
                    </div>
                  ) : htmlContent ? (
                    <div
                      className="
                        min-w-0 max-w-none break-words text-[16px] leading-8 text-slate-700 md:text-[18px] md:leading-9
                        [&_*]:max-w-full
                        [&_h1]:mb-5 [&_h1]:mt-8 [&_h1]:break-words [&_h1]:text-4xl [&_h1]:font-black [&_h1]:leading-tight [&_h1]:text-slate-950
                        [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:break-words [&_h2]:text-3xl [&_h2]:font-black [&_h2]:leading-tight [&_h2]:text-slate-950
                        [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:break-words [&_h3]:text-2xl [&_h3]:font-extrabold [&_h3]:leading-tight [&_h3]:text-slate-950
                        [&_p]:mb-5 [&_p]:break-words
                        [&_span]:break-words
                        [&_strong]:font-extrabold [&_strong]:text-slate-950
                        [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc
                        [&_ol]:mb-6 [&_ol]:ml-6 [&_ol]:list-decimal
                        [&_li]:mb-2 [&_li]:break-words
                        [&_a]:break-words [&_a]:font-semibold [&_a]:text-blue-700 [&_a]:underline
                        [&_img]:my-8 [&_img]:h-auto [&_img]:max-h-[520px] [&_img]:w-full [&_img]:rounded-3xl [&_img]:object-cover [&_img]:shadow-lg
                        [&_table]:my-6 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto
                        [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-950 [&_pre]:p-5 [&_pre]:text-white
                        [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-lime-400 [&_blockquote]:bg-lime-50 [&_blockquote]:p-5 [&_blockquote]:italic
                      "
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                  ) : (
                    <div className="rounded-2xl bg-slate-50 p-8 text-center">
                      <h2 className="text-2xl font-black text-slate-950">
                        Nội dung About chưa được cập nhật
                      </h2>
                      <p className="mt-3 text-slate-600">
                        Bạn có thể thêm nội dung trong trang quản trị About.
                      </p>
                    </div>
                  )}
                </div>
              </article>
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