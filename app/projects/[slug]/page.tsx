"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import {
  API_URL,
  getHomeContent,
  getProjectBySlug,
  type ProjectItem,
} from "@/lib/api";

type HomeContent = {
  siteName?: string;
  headerLogo?: string;
  partnerLogos?: string[] | null;
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;
};

type ProjectDetailItem = ProjectItem & {
  content?: string;
  heroImage?: string;
  imageUrl?: string;
  summary?: string;
  createdAt?: string;
};

function normalizeHome(data: any): HomeContent | null {
  if (data?.data) return data.data;
  if (data?.home) return data.home;
  if (data) return data;
  return null;
}

function normalizeProject(data: any): ProjectDetailItem | null {
  const item = data?.data || data?.project || data?.item || data?.result || data;

  if (!item || typeof item !== "object") return null;

  return {
    ...item,
    title: item.title || "Untitled project",
    description: item.description || item.summary || "",
    image: item.image || item.heroImage || item.imageUrl || "",
    publishedAt: item.publishedAt || item.createdAt || "",
    status: item.status || "In Progress",
    category: item.category || "Research",
    researchArea: item.researchArea || item.category || "General",
    yearRange:
      item.yearRange ||
      (item.publishedAt
        ? String(item.publishedAt).slice(0, 4)
        : item.createdAt
        ? String(item.createdAt).slice(0, 4)
        : "Updating"),
    membersCount: String(item.membersCount || "0"),
    bullets: Array.isArray(item.bullets) ? item.bullets : [],
  };
}

function imageUrl(url?: string | null) {
  if (!url || !url.trim()) return "";

  if (url.startsWith("http")) return url;

  if (url.startsWith("/images")) return url;

  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function formatDate(date?: string) {
  if (!date) return "";

  try {
    return new Date(date).toLocaleDateString("vi-VN");
  } catch {
    return date;
  }
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [home, setHome] = useState<HomeContent | null>(null);
  const [project, setProject] = useState<ProjectDetailItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      try {
        setLoading(true);

        const [homeRes, projectRes] = await Promise.all([
          getHomeContent(),
          getProjectBySlug(slug),
        ]);

        const homeData = normalizeHome(homeRes);
        const projectData = normalizeProject(projectRes);

        setHome(homeData);
        setProject(projectData);

        console.log("PROJECT DETAIL HOME DATA:", homeRes);
        console.log("PROJECT DETAIL DATA:", projectRes);
      } catch (error) {
        console.error("FETCH PROJECT DETAIL ERROR:", error);
        setHome(null);
        setProject(null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const bullets = useMemo(() => {
    if (!project?.bullets) return [];
    return Array.isArray(project.bullets) ? project.bullets : [];
  }, [project]);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#eef3f7] py-10">
        <Container>
          <div className="mb-6">
            <Link
              href="/projects"
              className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0f6fb8] shadow-sm transition hover:bg-[#0f6fb8] hover:text-white"
            >
              ← Back to Projects
            </Link>
          </div>

          {loading ? (
            <section className="rounded-[28px] bg-white p-10 text-center shadow-md">
              <p className="text-lg font-semibold text-gray-500">
                Đang tải project...
              </p>
            </section>
          ) : !project ? (
            <section className="rounded-[28px] bg-white p-10 text-center shadow-md">
              <h1 className="text-3xl font-black text-[#2c3e50]">
                Project not found
              </h1>

              <p className="mt-3 text-gray-500">
                Không tìm thấy project theo slug này.
              </p>
            </section>
          ) : (
            <article className="overflow-hidden rounded-[32px] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="relative min-h-[360px] bg-[#dbeafe]">
                {project.image ? (
                  <img
                    src={imageUrl(project.image)}
                    alt={project.title}
                    className="h-[360px] w-full object-cover md:h-[460px]"
                  />
                ) : (
                  <div className="flex h-[360px] items-center justify-center text-xl font-black text-[#2c3e50] md:h-[460px]">
                    No project image
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <div className="mb-4 flex flex-wrap gap-3">
                    <span className="rounded-full bg-[#64bd3a] px-4 py-2 text-sm font-black text-white">
                      {project.status || "In Progress"}
                    </span>

                    <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-black text-[#0f2342]">
                      {project.category || "Research"}
                    </span>

                    {project.researchArea ? (
                      <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-black text-[#0f2342]">
                        {project.researchArea}
                      </span>
                    ) : null}
                  </div>

                  <h1 className="max-w-5xl text-[36px] font-black leading-tight text-white md:text-[52px]">
                    {project.title}
                  </h1>

                  {project.subtitle ? (
                    <p className="mt-4 max-w-4xl text-[18px] font-medium leading-8 text-white/90">
                      {project.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  <section className="rounded-[24px] bg-[#f8fbff] p-6">
                    <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#7ab648]">
                      Project Overview
                    </p>

                    <h2 className="text-[30px] font-black text-[#2c3e50]">
                      Description
                    </h2>

                    <p className="mt-4 whitespace-pre-line text-[17px] leading-8 text-[#52657f]">
                      {project.description ||
                        "Project description is being updated."}
                    </p>
                  </section>

                  {project.content ? (
                    <section className="mt-8 rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                      <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#7ab648]">
                        Article
                      </p>

                      <h2 className="text-[30px] font-black text-[#2c3e50]">
                        Project article
                      </h2>

                      <div className="mt-5 whitespace-pre-line text-[17px] leading-8 text-[#52657f]">
                        {project.content}
                      </div>
                    </section>
                  ) : null}

                  {bullets.length > 0 ? (
                    <section className="mt-8 rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                      <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#7ab648]">
                        Highlights
                      </p>

                      <h2 className="text-[30px] font-black text-[#2c3e50]">
                        Key points
                      </h2>

                      <ul className="mt-5 space-y-3">
                        {bullets.map((item, index) => (
                          <li
                            key={index}
                            className="flex gap-3 rounded-2xl bg-[#f8fbff] p-4 text-[16px] leading-7 text-[#2c3e50]"
                          >
                            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7ab648] text-xs font-black text-white">
                              {index + 1}
                            </span>

                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>

                <aside className="space-y-5">
                  <div className="rounded-[24px] bg-[#0f2342] p-6 text-white">
                    <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-white/60">
                      Project Info
                    </p>

                    <div className="space-y-4">
                      <InfoItem
                        label="Status"
                        value={project.status || "In Progress"}
                      />

                      <InfoItem
                        label="Year"
                        value={project.yearRange || "Updating"}
                      />

                      <InfoItem
                        label="Members"
                        value={`${project.membersCount || "0"} members`}
                      />

                      <InfoItem
                        label="Published"
                        value={formatDate(project.publishedAt) || "Updating"}
                      />

                      <InfoItem
                        label="Research Area"
                        value={project.researchArea || "General"}
                      />
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-xl font-black text-[#2c3e50]">
                      Quick actions
                    </h3>

                    <div className="mt-5 space-y-3">
                      {project.readMoreLink &&
                      !project.readMoreLink.startsWith("/projects/") ? (
                        <a
                          href={project.readMoreLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex w-full items-center justify-center rounded-xl bg-[#0f6fb8] px-5 py-3 font-black text-white transition hover:bg-[#0b5b96]"
                        >
                          Open related link ↗
                        </a>
                      ) : null}

                      <Link
                        href="/projects"
                        className="flex w-full items-center justify-center rounded-xl border border-[#0f6fb8] px-5 py-3 font-black text-[#0f6fb8] transition hover:bg-[#eef6ff]"
                      >
                        View all projects
                      </Link>
                    </div>
                  </div>
                </aside>
              </div>
            </article>
          )}
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">
        {label}
      </p>

      <p className="mt-1 text-[16px] font-bold leading-7 text-white">
        {value}
      </p>
    </div>
  );
}