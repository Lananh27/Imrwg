"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { getDataItems, getHomeContent, getLibraryDocuments, getMeetings, getPeople, getProjects } from "@/lib/api";

type SearchItem = {
  title: string;
  description?: string;
  href: string;
  type: string;
};

function normalizeArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  const candidates = [data?.data, data?.data?.items, data?.items, data?.result, data?.projects, data?.people, data?.meetings, data?.documents];
  for (const candidate of candidates) if (Array.isArray(candidate)) return candidate;
  return [];
}

function textOf(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(" ");
  if (typeof value === "object") return Object.values(value).join(" ");
  return String(value);
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";

  const [home, setHome] = useState<any>(null);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSearchData() {
      setLoading(true);
      setError("");

      try {
        const [homeResult, peopleResult, projectsResult, meetingsResult, libraryResult, dataResult] = await Promise.allSettled([
          getHomeContent(),
          getPeople(),
          getProjects(),
          getMeetings(),
          getLibraryDocuments(),
          getDataItems(),
        ]);

        const homeData = homeResult.status === "fulfilled" ? homeResult.value?.data || homeResult.value || null : null;
        setHome(homeData);

        const nextItems: SearchItem[] = [];

        if (peopleResult.status === "fulfilled") {
          normalizeArray(peopleResult.value).forEach((person) => nextItems.push({
            title: person.fullName || person.name || "People item",
            description: [person.role, person.institution, person.bio].filter(Boolean).join(" - "),
            href: "/people",
            type: "People",
          }));
        }

        if (projectsResult.status === "fulfilled") {
          normalizeArray(projectsResult.value).forEach((project) => nextItems.push({
            title: project.title || "Project item",
            description: textOf(project.description || project.subtitle || project.content),
            href: project.slug ? `/projects/${project.slug}` : "/projects",
            type: "Projects",
          }));
        }

        if (meetingsResult.status === "fulfilled") {
          normalizeArray(meetingsResult.value).forEach((meeting) => nextItems.push({
            title: meeting.title || "Meeting item",
            description: [meeting.summary, meeting.location, meeting.startDate].filter(Boolean).join(" - "),
            href: meeting.type === "upcoming" ? "/meetings/upcoming" : "/meetings/past",
            type: "Meetings",
          }));
        }

        if (libraryResult.status === "fulfilled") {
          normalizeArray(libraryResult.value).forEach((doc) => nextItems.push({
            title: doc.title || "Document item",
            description: [doc.description, doc.author, doc.category].filter(Boolean).join(" - "),
            href: doc.slug ? `/documents/library/${doc.slug}` : "/documents/library",
            type: "Library",
          }));
        }

        if (dataResult.status === "fulfilled") {
          normalizeArray(dataResult.value).forEach((dataItem) => nextItems.push({
            title: dataItem.title || "Data item",
            description: [dataItem.description, dataItem.category, dataItem.year].filter(Boolean).join(" - "),
            href: "/data",
            type: "Data",
          }));
        }

        if (Array.isArray(homeData?.mapsItems)) {
          homeData.mapsItems.forEach((mapItem: any) => nextItems.push({
            title: mapItem.title || "Map item",
            description: [mapItem.topic, mapItem.content].filter(Boolean).join(" - "),
            href: mapItem.slug ? `/maps/${mapItem.slug}` : "/maps",
            type: "Maps",
          }));
        }

        setItems(nextItems);
      } catch (err: any) {
        setError(err?.message || "Không thể tìm kiếm dữ liệu.");
      } finally {
        setLoading(false);
      }
    }

    loadSearchData();
  }, []);

  const results = useMemo(() => {
    if (!query) return [];
    const keyword = query.toLowerCase();
    return items.filter((item) => `${item.title} ${item.description || ""} ${item.type}`.toLowerCase().includes(keyword));
  }, [items, query]);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
        backgroundImage={home?.headerBackgroundImage || home?.headerBackground || "/images/background.png"}
      />

      <main className="min-h-[520px] bg-[#eef5ff] py-10 text-black">
        <Container>
          <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0b3f75]">Search</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">Kết quả cho: {query || "..."}</h1>

            {loading ? (
              <p className="mt-6 text-gray-500">Đang tìm kiếm...</p>
            ) : error ? (
              <p className="mt-6 rounded-xl bg-red-50 p-4 font-semibold text-red-600">{error}</p>
            ) : results.length === 0 ? (
              <p className="mt-6 text-gray-500">Không tìm thấy kết quả phù hợp.</p>
            ) : (
              <div className="mt-8 space-y-4">
                {results.map((item, index) => (
                  <Link key={`${item.href}-${index}`} href={item.href} className="block rounded-xl border border-slate-200 p-5 transition hover:border-[#0b3f75] hover:shadow-md">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#315700]">{item.type}</span>
                      <h2 className="text-xl font-black text-slate-950">{item.title}</h2>
                    </div>
                    {item.description ? <p className="mt-3 line-clamp-3 text-[16px] leading-7 text-slate-600">{item.description}</p> : null}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Container>
      </main>

      <Footer
        footerLogo={home?.footerLogo}
        footerMailingText={home?.footerMailingText}
        footerContactText={home?.footerContactText}
        footerSocialText={home?.footerSocialText}
        backgroundImage={home?.footerBackgroundImage || home?.footerBackground || "/images/background.png"}
      />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eef5ff]" />}>
      <SearchContent />
    </Suspense>
  );
}
