"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getDataContentBySlug, getHomeContent } from "@/lib/api";

type HomeContent = {
  siteName?: string;
  headerLogo?: string;
  partnerLogos?: string[] | null;
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;
};

type CardItem = {
  title: string;
  value: string;
  note: string;
};

type TableRow = {
  label: string;
  value: string;
  note: string;
};

type FileItem = {
  title: string;
  description: string;
  type: string;
  url: string;
};

type ChartItem = {
  label: string;
  value: string;
};

type DataPage = {
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  cards: CardItem[];
  tableRows: TableRow[];
  files: FileItem[];
  chartItems: ChartItem[];
};

const defaultData: DataPage = {
  title: "Conference Data",
  subtitle: "Key information, materials, and records from IMRWG events.",
  description:
    "Explore conference-related data including event summaries, sessions, participants, research topics, and supporting materials.",
  heroImage: "",
  cards: [
    {
      title: "Conferences",
      value: "24+",
      note: "Regional and international events",
    },
    {
      title: "Countries",
      value: "6",
      note: "Mekong countries involved",
    },
    {
      title: "Research topics",
      value: "48+",
      note: "Covered across sessions",
    },
  ],
  tableRows: [
    {
      label: "Annual Research Conference",
      value: "2026",
      note: "Regional knowledge exchange and dataset sharing.",
    },
    {
      label: "Mekong Policy Dialogue",
      value: "2025",
      note: "Connecting research outputs with institutional partners.",
    },
    {
      label: "Water Systems Workshop",
      value: "2024",
      note: "Technical sessions on climate, hydrology, and GIS.",
    },
  ],
  files: [
    {
      title: "Conference summary report",
      description: "Overview document of key sessions and findings.",
      type: "PDF",
      url: "",
    },
    {
      title: "Session dataset",
      description: "Structured data from conference sessions.",
      type: "Dataset",
      url: "",
    },
  ],
  chartItems: [
    { label: "Workshops", value: "12" },
    { label: "Panels", value: "8" },
    { label: "Datasets", value: "15" },
  ],
};

export default function ConferenceDataPage() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [data, setData] = useState<DataPage>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPageData() {
      try {
        const [homeRes, dataRes] = await Promise.all([
          getHomeContent(),
          getDataContentBySlug("conference-data"),
        ]);

        const homeData = homeRes?.data || homeRes;
        const page = dataRes?.data;

        if (homeData) {
          setHome(homeData);
        }

        if (page) {
          setData({
            title: page.title || defaultData.title,
            subtitle: page.subtitle || defaultData.subtitle,
            description: page.description || defaultData.description,
            heroImage: page.heroImage || "",
            cards: Array.isArray(page.cards) ? page.cards : defaultData.cards,
            tableRows: Array.isArray(page.tableRows)
              ? page.tableRows
              : defaultData.tableRows,
            files: Array.isArray(page.files) ? page.files : defaultData.files,
            chartItems: Array.isArray(page.chartItems)
              ? page.chartItems
              : defaultData.chartItems,
          });
        }
      } catch (error) {
        console.error("FETCH CONFERENCE DATA ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPageData();
  }, []);

  const totalChart = useMemo(() => {
    return data.chartItems.reduce((total, item) => {
      const number = Number(String(item.value).replace(/[^\d.]/g, ""));
      return total + (Number.isFinite(number) ? number : 0);
    }, 0);
  }, [data.chartItems]);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#f4f7f2] text-slate-900">
        <section className="relative overflow-hidden bg-[#f8fbf7] px-6 py-16 text-slate-900">
          <div className="absolute inset-0 opacity-100">
            <div className="h-full w-full bg-[linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
          </div>

          <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-[#9ac06f]/20 blur-3xl" />
          <div className="absolute bottom-[-150px] right-[-100px] h-[340px] w-[340px] rounded-full bg-cyan-200/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-2 shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#9ac06f]" />
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#557a32]">
                    Data center
                  </span>
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-tight text-[#123342] md:text-6xl">
                  {data.title}
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                  {data.subtitle}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="#conference-records"
                    className="rounded-full bg-[#173f4f] px-6 py-3 font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#0f2a37]"
                  >
                    View records
                  </a>

                  <Link
                    href="/data/data-download"
                    className="rounded-full border border-slate-300 bg-white px-6 py-3 font-bold text-[#173f4f] transition hover:-translate-y-1 hover:border-[#9ac06f] hover:bg-[#f3f9ef]"
                  >
                    Download data
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b2732] p-4 shadow-2xl">
                  <div className="absolute inset-0 opacity-[0.16]">
                    <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:42px_42px]" />
                  </div>

                  <div className="absolute left-[-80px] top-[-80px] h-[220px] w-[220px] rounded-full bg-[#9ac06f]/20 blur-3xl" />
                  <div className="absolute bottom-[-80px] right-[-80px] h-[220px] w-[220px] rounded-full bg-cyan-300/10 blur-3xl" />

                  <div className="relative rounded-[1.5rem] border border-white/10 bg-[#113847]/90 p-5 text-white backdrop-blur">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-lime-200">
                          Conference intelligence
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-white">
                          Research dashboard
                        </h2>
                      </div>

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl text-white shadow-sm">
                        ◈
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {data.cards.slice(0, 3).map((item, index) => (
                        <div
                          key={`${item.title}-${index}`}
                          className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                        >
                          <p className="text-3xl font-black text-[#d7efb6]">
                            {item.value}
                          </p>
                          <p className="mt-2 text-sm font-black text-white">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-white/70">
                            {item.note}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-white">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="font-black">Data distribution</p>
                        <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                          Live content
                        </p>
                      </div>

                      <div className="space-y-4">
                        {data.chartItems.slice(0, 4).map((item, index) => {
                          const rawValue = Number(
                            String(item.value).replace(/[^\d.]/g, "")
                          );

                          const percent =
                            totalChart > 0 && Number.isFinite(rawValue)
                              ? Math.max((rawValue / totalChart) * 100, 8)
                              : 30 + index * 12;

                          return (
                            <div key={`${item.label}-${index}`}>
                              <div className="mb-2 flex justify-between text-sm">
                                <span className="text-white/75">
                                  {item.label}
                                </span>
                                <span className="font-black text-[#d7efb6]">
                                  {item.value}
                                </span>
                              </div>

                              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-[#9ac06f]"
                                  style={{
                                    width: `${Math.min(percent, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {loading ? (
                      <p className="mt-4 text-sm font-semibold text-white/70">
                        Loading latest content...
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl md:block">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Status
                  </p>
                  <p className="mt-1 font-black text-[#173f4f]">
                    Admin editable
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[2rem] bg-white p-8 shadow-sm">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#9ac06f]">
                      Overview
                    </p>
                    <h2 className="mt-4 text-3xl font-black text-[#173f4f] md:text-4xl">
                      Conference records organized for research use.
                    </h2>
                  </div>

                  <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef6e7] text-3xl md:flex">
                    ⟡
                  </div>
                </div>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                  {data.description}
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {data.cards.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                    >
                      <p className="text-4xl font-black text-[#173f4f]">
                        {item.value}
                      </p>
                      <h3 className="mt-3 font-black">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {item.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] bg-[#173f4f] p-8 text-white shadow-sm">
                <div className="absolute right-[-70px] top-[-70px] h-48 w-48 rounded-full bg-[#9ac06f]/30 blur-2xl" />
                <div className="absolute bottom-[-90px] left-[-80px] h-56 w-56 rounded-full bg-cyan-200/10 blur-3xl" />

                <div className="relative">
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-lime-200">
                    Data map
                  </p>
                  <h2 className="mt-4 text-3xl font-black">
                    From conference activity to structured records.
                  </h2>

                  <div className="mt-8 space-y-4">
                    {[
                      "Event information",
                      "Session themes",
                      "Research outputs",
                      "Files and datasets",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center gap-4 rounded-2xl bg-white/10 p-4"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#9ac06f] font-black text-black">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-black">{item}</p>
                          <p className="text-sm text-white/65">
                            Connected content managed from admin.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-2xl border border-white/10 bg-black/15 p-5">
                    <p className="text-sm leading-7 text-white/75">
                      This page is designed for conference data, so the layout
                      focuses on records, files, categories, and research
                      summaries instead of learning programs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div id="conference-records" className="mt-14">
              <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-[#9ac06f]">
                    Records
                  </p>
                  <h2 className="mt-3 text-3xl font-black text-[#173f4f]">
                    Conference record index
                  </h2>
                </div>

                <p className="max-w-xl text-sm leading-6 text-slate-500">
                  Each row can represent an event, session, dataset, or
                  conference output. The content below is fully editable from
                  admin.
                </p>
              </div>

              <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
                <div className="grid bg-[#173f4f] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white/80 md:grid-cols-[1.1fr_180px_1.4fr]">
                  <div>Record name</div>
                  <div className="hidden md:block">Year / Value</div>
                  <div className="hidden md:block">Summary</div>
                </div>

                {data.tableRows.map((row, index) => (
                  <div
                    key={`${row.label}-${index}`}
                    className="grid gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0 hover:bg-[#f8fbf5] md:grid-cols-[1.1fr_180px_1.4fr] md:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef6e7] font-black text-[#557a32]">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">
                          {row.label}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 md:hidden">
                          {row.value}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:block">
                      <span className="inline-flex rounded-full bg-[#eef6e7] px-4 py-2 text-sm font-black text-[#557a32]">
                        {row.value}
                      </span>
                    </div>

                    <p className="text-sm leading-6 text-slate-600">
                      {row.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[2rem] bg-white p-8 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#9ac06f]">
                  Categories
                </p>
                <h2 className="mt-4 text-3xl font-black text-[#173f4f]">
                  Data categories
                </h2>

                <div className="mt-8 space-y-5">
                  {data.chartItems.map((item, index) => {
                    const rawValue = Number(
                      String(item.value).replace(/[^\d.]/g, "")
                    );

                    const percent =
                      totalChart > 0 && Number.isFinite(rawValue)
                        ? Math.max((rawValue / totalChart) * 100, 10)
                        : 45;

                    return (
                      <div key={`${item.label}-${index}`}>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-bold text-slate-700">
                            {item.label}
                          </p>
                          <p className="font-black text-[#173f4f]">
                            {item.value}
                          </p>
                        </div>

                        <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#173f4f] to-[#9ac06f]"
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-8 shadow-sm">
                <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#9ac06f]">
                      Resources
                    </p>
                    <h2 className="mt-4 text-3xl font-black text-[#173f4f]">
                      Conference files
                    </h2>
                  </div>

                  <Link
                    href="/data/data-download"
                    className="rounded-full bg-[#173f4f] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-[#0c2634]"
                  >
                    View all downloads
                  </Link>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {data.files.map((file, index) => (
                    <div
                      key={`${file.title}-${index}`}
                      className="group rounded-[1.4rem] border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-[#9ac06f] hover:bg-[#f7fbf3]"
                    >
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <span className="rounded-full bg-[#173f4f] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
                          {file.type || "File"}
                        </span>
                        <span className="text-2xl">▣</span>
                      </div>

                      <h3 className="text-xl font-black text-[#173f4f]">
                        {file.title}
                      </h3>

                      <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-600">
                        {file.description}
                      </p>

                      {file.url ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-5 inline-flex rounded-full bg-[#9ac06f] px-5 py-3 text-sm font-black text-black transition group-hover:bg-[#b9dc8d]"
                        >
                          Open resource
                        </a>
                      ) : (
                        <span className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-400">
                          No link yet
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-14 overflow-hidden rounded-[2rem] bg-[#0b2732] text-white shadow-sm">
              <div className="grid lg:grid-cols-[1fr_0.8fr]">
                <div className="p-8 md:p-10">
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-lime-200">
                    Explore more
                  </p>
                  <h2 className="mt-4 max-w-2xl text-3xl font-black md:text-4xl">
                    Continue exploring IMRWG data resources.
                  </h2>
                  <p className="mt-5 max-w-2xl leading-8 text-white/70">
                    Move from conference summaries to attendance statistics,
                    research datasets, or downloadable materials.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
  href="/data/attendance-statistics"
  className="rounded-full bg-[#b9dc8d] px-5 py-3 font-black text-[#173f4f] transition hover:-translate-y-1 hover:bg-[#cbe8a9]"
>
  Attendance statistics
</Link>

                    <Link
                      href="/data/research-dataset"
                      className="rounded-full border border-white/20 px-5 py-3 font-black text-white transition hover:-translate-y-1 hover:bg-white/10"
                    >
                      Research dataset
                    </Link>
                  </div>
                </div>

                <div className="relative min-h-[260px] bg-[#173f4f]">
                  {data.heroImage ? (
                    <img
                      src={data.heroImage}
                      alt={data.title}
                      className="h-full w-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="flex h-full min-h-[260px] items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-4xl">
                          📁
                        </div>
                        <p className="font-black text-white/80">
                          Conference archive
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-[#0b2732]/50 to-transparent" />
                </div>
              </div>
            </div>
          </div>
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