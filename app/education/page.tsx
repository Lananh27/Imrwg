"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { getEducationContent, getHomeContent } from "@/lib/api";
import {
  FaArrowRight,
  FaBookOpen,
  FaChalkboardTeacher,
  FaDownload,
  FaRegCalendarAlt,
  FaSearch,
  FaUsers,
} from "react-icons/fa";

type HomeContent = {
  siteName?: string;
  headerLogo?: string;
  partnerLogos?: string[] | null;
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;
};

type EducationStat = {
  value?: string;
  label?: string;
  note?: string;
};

type ProgramItem = {
  title?: string;
  description?: string;
  image?: string;
  tag?: string;
  link?: string;
};

type ResourceItem = {
  title?: string;
  description?: string;
  type?: string;
  image?: string;
  link?: string;
};

type TimelineItem = {
  time?: string;
  title?: string;
  description?: string;
};

type EducationContent = {
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroImage?: string;
  stats?: EducationStat[];
  featuredPrograms?: ProgramItem[];
  resourceItems?: ResourceItem[];
  timelineItems?: TimelineItem[];
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://backend-roym.onrender.com").replace(/\/$/, "");

function imgUrl(url?: string) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

function ensureArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

export default function EducationPage() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [education, setEducation] = useState<EducationContent | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeRes, educationRes] = await Promise.all([
          getHomeContent(),
          getEducationContent(),
        ]);

        if (homeRes?.data) setHome(homeRes.data);
        if (educationRes?.data) setEducation(educationRes.data);
      } catch (error) {
        console.error("FETCH EDUCATION PAGE ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = ensureArray<EducationStat>(education?.stats);
  const programs = ensureArray<ProgramItem>(education?.featuredPrograms);
  const resources = ensureArray<ResourceItem>(education?.resourceItems);
  const timeline = ensureArray<TimelineItem>(education?.timelineItems);

  const resourceTypes = useMemo(() => {
    const types = resources
      .map((item) => item?.type || "")
      .filter(Boolean);
    return ["All", ...Array.from(new Set(types))];
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchesType = activeType === "All" || item.type === activeType;
      const keyword = search.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        (item.title || "").toLowerCase().includes(keyword) ||
        (item.description || "").toLowerCase().includes(keyword) ||
        (item.type || "").toLowerCase().includes(keyword);

      return matchesType && matchesSearch;
    });
  }, [resources, activeType, search]);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#eef3fa] pb-16">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#f6fff3] via-[#eaf9ea] to-[#dff3e3] py-16 md:py-24">
  {/* decor */}
  <div className="absolute -left-10 top-10 h-52 w-52 rounded-full bg-lime-200/40 blur-3xl" />
  <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
  <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-green-100/40 blur-3xl" />

  <Container>
    <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      {/* LEFT */}
      <div className="relative z-10">
        <span className="inline-flex rounded-full border border-lime-400 bg-white px-5 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-lime-700 shadow-sm">
          Education
        </span>

        <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-[#173228] md:text-6xl">
          Learning for a Resilient Mekong Future
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4b6356] md:text-xl">
          Training, resources, and collaborative learning opportunities for researchers,
          students, and institutions.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#featured-programs"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-[#0f52ba] to-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Explore programs
          </a>

          <a
            href="#resources"
            className="inline-flex items-center rounded-xl border border-blue-300 bg-white px-6 py-3 text-sm font-semibold text-[#0f52ba] shadow-sm transition hover:border-blue-400 hover:bg-blue-50"
          >
            View resources
          </a>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative z-10">
        <div className="rounded-[32px] border border-blue-100 bg-white/75 p-4 shadow-[0_20px_60px_rgba(37,99,235,0.14)] backdrop-blur-md">
          <div className="flex min-h-[420px] items-center justify-center rounded-[26px] border border-dashed border-blue-200 bg-gradient-to-br from-[#f8fbff] to-[#e8f1ff]">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0112 20.055a12.083 12.083 0 01-6.16-9.477L12 14zm0 0v6"
                  />
                </svg>
              </div>

              <p className="text-xl font-semibold text-[#294a7a]">
                Education preview image
              </p>
              <p className="mt-2 text-sm text-[#6480a8]">
                Add featured image, banner, or learning visual here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Container>
</section>

        <section id="programs" className="py-16">
          <Container>
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
                  Featured programs
                </span>
                <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
                  Learning pathways and focus areas
                </h2>
              </div>

              <p className="max-w-2xl text-[16px] leading-7 text-slate-600">
                A modern education space to highlight flagship training topics, partner-led learning,
                and pathways for students, young scholars, and professionals.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {programs.map((item, index) => (
                <div
                  key={index}
                  className="group overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1"
                >
                  <div className="relative h-[220px] bg-[linear-gradient(135deg,#dbeafe_0%,#ecfccb_100%)]">
                    {item.image ? (
                      <img
                        src={imgUrl(item.image)}
                        alt={item.title || "Program image"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FaGraduationCap className="text-6xl text-blue-700/60" />
                      </div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-800">
                      {item.tag || "Program"}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900">{item.title || "Untitled"}</h3>
                    <p className="mt-3 text-[15px] leading-7 text-slate-600">
                      {item.description || ""}
                    </p>

                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
                      >
                        Learn more <FaArrowRight />
                      </a>
                    ) : (
                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400">
                        Learn more <FaArrowRight />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section id="resources" className="py-16">
          <Container>
            <div className="rounded-[32px] bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] md:p-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="inline-block rounded-full bg-lime-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.14em] text-lime-700">
                    Resource explorer
                  </span>
                  <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
                    Search and filter learning resources
                  </h2>
                  <p className="mt-3 max-w-2xl text-[16px] leading-7 text-slate-600">
                    A more modern experience: visitors can search materials and filter them by type.
                  </p>
                </div>

                <div className="w-full max-w-md">
                  <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
                    <FaSearch className="text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search resources..."
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {resourceTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeType === type
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredResources.length > 0 ? (
                  filteredResources.map((item, index) => (
                    <div
                      key={index}
                      className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50"
                    >
                      <div className="h-[180px] bg-[linear-gradient(135deg,#dbeafe_0%,#f8fafc_100%)]">
                        {item.image ? (
                          <img
                            src={imgUrl(item.image)}
                            alt={item.title || "Resource image"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <FaBookOpen className="text-5xl text-blue-600/60" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-bold text-slate-900">
                            {item.title || "Untitled resource"}
                          </h3>
                          <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-700">
                            {item.type || "Resource"}
                          </span>
                        </div>

                        <p className="mt-3 flex-1 text-[15px] leading-7 text-slate-600">
                          {item.description || ""}
                        </p>

                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
                          >
                            Open resource <FaDownload />
                          </a>
                        ) : (
                          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400">
                            No link yet <FaDownload />
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-[20px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                    No matching resources found.
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[28px] bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
                <span className="inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.14em] text-amber-700">
                  Upcoming activities
                </span>

                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  Education timeline
                </h2>

                <div className="mt-8 space-y-6">
                  {timeline.length > 0 ? (
                    timeline.map((item, index) => (
                      <div key={index} className="relative border-l-2 border-lime-300 pl-6">
                        <div className="absolute left-[-7px] top-1 h-3 w-3 rounded-full bg-lime-500" />
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
                          <FaRegCalendarAlt />
                          {item.time || "Time"}
                        </div>
                        <h3 className="mt-3 text-xl font-bold text-slate-900">
                          {item.title || "Untitled activity"}
                        </h3>
                        <p className="mt-2 text-[15px] leading-7 text-slate-600">
                          {item.description || ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">No timeline items yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_100%)] p-8 text-white shadow-[0_12px_40px_rgba(15,23,42,0.16)]">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.14em] text-lime-300">
                  <FaUsers />
                  Join the network
                </span>

                <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight md:text-4xl">
                  {education?.ctaTitle || "Ready to learn with IMRWG?"}
                </h2>

                <p className="mt-4 max-w-2xl text-[16px] leading-8 text-white/80">
                  {education?.ctaDescription ||
                    "Join educational activities, access curated learning resources, and collaborate with our network."}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href={education?.ctaButtonLink || "/about"}
                    className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-6 py-3 font-semibold text-slate-900 transition hover:translate-y-[-2px]"
                  >
                    {education?.ctaButtonText || "Explore more"} <FaArrowRight />
                  </a>

                  <a
                    href="/people"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15"
                  >
                    Meet our network
                  </a>
                </div>
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

function FaGraduationCap(props: any) {
  return <FaChalkboardTeacher {...props} />;
}