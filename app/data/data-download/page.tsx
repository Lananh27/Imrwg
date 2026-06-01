"use client";

import { useEffect, useMemo, useState } from "react";
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
  title: "Data Download",
  subtitle: "Download documents, datasets, reports, and supporting materials.",
  description:
    "Find and download available resources from IMRWG, including reports, datasets, documents, and conference materials.",
  heroImage: "",
  cards: [
    {
      title: "Total files",
      value: "12",
      note: "Available resources",
    },
    {
      title: "Categories",
      value: "4",
      note: "Reports, datasets, slides, documents",
    },
    {
      title: "Updated",
      value: "2026",
      note: "Latest resource collection",
    },
  ],
  tableRows: [],
  files: [
    {
      title: "Conference summary report",
      description: "Summary document for conference activities and outcomes.",
      type: "PDF",
      url: "",
    },
    {
      title: "Research dataset",
      description: "Dataset package for research and analysis.",
      type: "CSV",
      url: "",
    },
    {
      title: "Learning materials",
      description: "Educational document and supporting resources.",
      type: "DOC",
      url: "",
    },
  ],
  chartItems: [],
};

export default function DataDownloadPage() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [data, setData] = useState<DataPage>(defaultData);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeType, setActiveType] = useState("All");

  useEffect(() => {
    async function fetchPageData() {
      try {
        const [homeRes, dataRes] = await Promise.all([
          getHomeContent(),
          getDataContentBySlug("data-download"),
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
        console.error("FETCH DATA DOWNLOAD ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPageData();
  }, []);

  const fileTypes = useMemo(() => {
    const types = data.files
      .map((file) => file.type?.trim())
      .filter((type): type is string => Boolean(type));

    return ["All", ...Array.from(new Set(types))];
  }, [data.files]);

  const filteredFiles = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return data.files.filter((file) => {
      const matchType = activeType === "All" || file.type === activeType;

      const matchSearch =
        !keyword ||
        file.title.toLowerCase().includes(keyword) ||
        file.description.toLowerCase().includes(keyword) ||
        file.type.toLowerCase().includes(keyword);

      return matchType && matchSearch;
    });
  }, [activeType, data.files, searchText]);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#f7f8fb] text-slate-900">
        <section className="border-b border-slate-200 bg-white px-6 py-14">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Downloads
              </p>

              <h1 className="mt-4 text-4xl font-black text-slate-950 md:text-5xl">
                {data.title}
              </h1>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                {data.subtitle}
              </p>

              {loading ? (
                <p className="mt-4 text-sm font-semibold text-slate-400">
                  Loading documents...
                </p>
              ) : null}
            </div>

            <div className="mt-10 rounded-2xl border border-slate-200 bg-[#f7f8fb] p-4">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search documents by name, type, or description..."
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-base font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {fileTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveType(type)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      activeType === type
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Available documents
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {filteredFiles.length} document
                  {filteredFiles.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <p className="max-w-xl text-sm leading-6 text-slate-500">
                {data.description}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="hidden grid-cols-[1fr_120px_140px] border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold uppercase tracking-[0.08em] text-slate-500 md:grid">
                <div>Document name</div>
                <div>Type</div>
                <div className="text-right">Action</div>
              </div>

              {filteredFiles.map((file, index) => (
                <div
                  key={`${file.title}-${index}`}
                  className="grid gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0 hover:bg-slate-50 md:grid-cols-[1fr_120px_140px] md:items-center"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                        📄
                      </div>

                      <div>
                        <h3 className="font-black text-slate-950">
                          {file.title || "Untitled document"}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {file.description || "No description"}
                        </p>

                        <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 md:hidden">
                          {file.type || "File"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                      {file.type || "File"}
                    </span>
                  </div>

                  <div className="md:text-right">
                    {file.url ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-400">
                        No file
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {filteredFiles.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                    🔎
                  </div>
                  <h3 className="text-xl font-black text-slate-800">
                    No documents found
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Try another keyword or choose another file type.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {data.cards.slice(0, 3).map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-3xl font-black text-blue-600">
                    {item.value}
                  </p>
                  <h3 className="mt-2 font-black text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {item.note}
                  </p>
                </div>
              ))}
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