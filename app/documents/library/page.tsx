"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { getHomeContent, getLibraryDocuments } from "@/lib/api";

type LibraryDocument = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  author?: string;
  publishedAt?: string;
  fileType?: string;
  fileUrl?: string;
  coverImage?: string;
  status?: string;
  isFeatured?: boolean;
};

type HomeContent = {
  siteName?: string;
  headerLogo?: string;
  partnerLogos?: string[] | null;
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;
};

function formatDate(value?: string) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString("en-GB");
}

export default function LibraryPage() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeYear, setActiveYear] = useState("All");
  const [activeType, setActiveType] = useState("All");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      const [homeRes, libraryRes] = await Promise.all([
        getHomeContent(),
        getLibraryDocuments({ status: "PUBLISHED" }),
      ]);

      setHome(homeRes?.data || homeRes || null);
      setDocuments(Array.isArray(libraryRes?.data) ? libraryRes.data : []);
    } catch (error) {
      console.error("FETCH LIBRARY ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const values = documents
      .map((item) => item.category)
      .filter((item): item is string => Boolean(item));

    return ["All", ...Array.from(new Set(values))];
  }, [documents]);

  const years = useMemo(() => {
    const values = documents
      .map((item) =>
        item.publishedAt
          ? new Date(item.publishedAt).getFullYear().toString()
          : ""
      )
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values))];
  }, [documents]);

  const fileTypes = useMemo(() => {
    const values = documents
      .map((item) => item.fileType)
      .filter((item): item is string => Boolean(item));

    return ["All", ...Array.from(new Set(values))];
  }, [documents]);

  const featuredDocuments = useMemo(() => {
    return documents.filter((item) => item.isFeatured).slice(0, 4);
  }, [documents]);

  const latestDocuments = useMemo(() => {
    return [...documents]
      .sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return documents.filter((item) => {
      const matchSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        (item.description || "").toLowerCase().includes(keyword) ||
        (item.author || "").toLowerCase().includes(keyword) ||
        (item.category || "").toLowerCase().includes(keyword);

      const matchCategory =
        activeCategory === "All" || item.category === activeCategory;

      const itemYear = item.publishedAt
        ? new Date(item.publishedAt).getFullYear().toString()
        : "";

      const matchYear = activeYear === "All" || itemYear === activeYear;
      const matchType = activeType === "All" || item.fileType === activeType;

      return matchSearch && matchCategory && matchYear && matchType;
    });
  }, [documents, searchText, activeCategory, activeYear, activeType]);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-white px-6 py-14">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.8fr]">
              <div className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white md:p-10">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Documents Library
                </p>

                <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
                  A curated library for research, reports, datasets, and
                  supporting resources.
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200 md:text-lg">
                  Explore materials from IMRWG activities in one place. Browse
                  by category, filter by year or file type, and quickly access
                  detailed information or downloadable files.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                    Research documents
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                    Reports & datasets
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                    Downloadable resources
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
                    Total published
                  </p>
                  <p className="mt-4 text-5xl font-black text-slate-950">
                    {documents.length}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Public documents currently available in the library.
                  </p>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-[#eef4ff] p-6 shadow-sm">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-600">
                    Featured collection
                  </p>
                  <p className="mt-4 text-5xl font-black text-slate-950">
                    {featuredDocuments.length}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Highlighted documents selected for better visibility.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* FEATURED / LATEST */}
        <section className="px-6 py-12">
          <Container>
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                      Featured
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">
                      Recommended documents
                    </h2>
                  </div>
                </div>

                {featuredDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {featuredDocuments.map((item) => (
                      <FeaturedRow key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <EmptyBlock text="No featured documents yet." />
                )}
              </div>

              <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                    Latest
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Newly added
                  </h2>
                </div>

                {latestDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {latestDocuments.map((item) => (
                      <LatestCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <EmptyBlock text="No latest documents available." />
                )}
              </div>
            </div>
          </Container>
        </section>

        {/* FILTER + LIST */}
        <section className="px-6 pb-16">
          <Container>
            <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
              {/* SIDEBAR */}
              <aside className="xl:sticky xl:top-6 xl:self-start">
                <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                      Explore
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-slate-950">
                      Search & filters
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">
                        Search
                      </label>
                      <input
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Title, author, category..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">
                        Category
                      </label>
                      <select
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                      >
                        {categories.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">
                        Year
                      </label>
                      <select
                        value={activeYear}
                        onChange={(e) => setActiveYear(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                      >
                        {years.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">
                        File type
                      </label>
                      <select
                        value={activeType}
                        onChange={(e) => setActiveType(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                      >
                        {fileTypes.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchText("");
                        setActiveCategory("All");
                        setActiveYear("All");
                        setActiveType("All");
                      }}
                      className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-slate-800"
                    >
                      Reset filters
                    </button>
                  </div>
                </div>
              </aside>

              {/* MAIN LIST */}
              <div>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                      Collection
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-slate-950">
                      Library documents
                    </h2>
                  </div>

                  <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm">
                    {filteredDocuments.length} result
                    {filteredDocuments.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {loading ? (
                  <div className="rounded-[30px] border border-slate-200 bg-white p-10 text-slate-500 shadow-sm">
                    Loading documents...
                  </div>
                ) : filteredDocuments.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    {filteredDocuments.map((item) => (
                      <LibraryCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                      📚
                    </div>
                    <h3 className="text-2xl font-black text-slate-950">
                      No documents found
                    </h3>
                    <p className="mt-3 text-slate-500">
                      Try another search term or adjust your filters.
                    </p>
                  </div>
                )}
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

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
      {text}
    </div>
  );
}

function FeaturedRow({ item }: { item: LibraryDocument }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center">
      {item.coverImage ? (
        <img
          src={item.coverImage}
          alt={item.title}
          className="h-28 w-full rounded-2xl object-cover md:w-40"
        />
      ) : (
        <div className="flex h-28 w-full items-center justify-center rounded-2xl bg-blue-50 text-4xl md:w-40">
          📘
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
            {item.category || "General"}
          </span>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
            {item.fileType || "File"}
          </span>
        </div>

        <h3 className="line-clamp-2 text-lg font-black text-slate-950">
          {item.title}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {item.author || "Unknown author"} · {formatDate(item.publishedAt)}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/documents/library/${item.slug}`}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            View detail
          </Link>

          {item.fileUrl ? (
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Download
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function LatestCard({ item }: { item: LibraryDocument }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
          {item.fileType || "File"}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
          {formatDate(item.publishedAt)}
        </span>
      </div>

      <h3 className="line-clamp-2 text-lg font-black text-slate-950">
        {item.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
        {item.description || "No description available."}
      </p>

      <div className="mt-4">
        <Link
          href={`/documents/library/${item.slug}`}
          className="text-sm font-bold text-blue-600 hover:underline"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}

function LibraryCard({ item }: { item: LibraryDocument }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {item.coverImage ? (
        <img
          src={item.coverImage}
          alt={item.title}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-5xl">
          📄
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            {item.category || "General"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {item.fileType || "File"}
          </span>
          {item.isFeatured ? (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
              Featured
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 text-xl font-black leading-snug text-slate-950">
          {item.title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">
          {item.description || "No description available."}
        </p>

        <div className="mt-5 space-y-1 text-sm text-slate-500">
          <p>
            <span className="font-bold text-slate-700">Author:</span>{" "}
            {item.author || "Unknown"}
          </p>
          <p>
            <span className="font-bold text-slate-700">Date:</span>{" "}
            {formatDate(item.publishedAt)}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/documents/library/${item.slug}`}
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            View detail
          </Link>

          {item.fileUrl ? (
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Download
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}