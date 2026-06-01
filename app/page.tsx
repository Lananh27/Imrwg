"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/layout/Container";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  API_URL,
  FALLBACK_HOME_CONTENT,
  getHomeContent,
  getPeople,
  getProjects,
} from "@/lib/api";

type InfoItem = {
  date: string;
  location: string;
};

type AttentionItem = {
  title: string;
  content: string;
  postSlug: string;
};

type HeroSlide = {
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
};

type MapItem = {
  title: string;
  slug: string;
  content: string;
  link: string;
  buttonText: string;
  publishedAt: string;
};

type ProjectItem = {
  id?: number;
  title: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  bullets?: string[];
  image?: string;
  readMoreLink?: string;
  publishedAt?: string;
  category?: string;
  researchArea?: string;
  status?: string;
  yearRange?: string;
  membersCount?: string;
};

type HomeContent = {
  siteName?: string;
  headerLogo?: string;
  welcomeTitle?: string;
  welcomeText?: string;
  marqueeText?: string;
  heroImage?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroButtonText?: string;
  heroButtonLink?: string;
  heroSlides?: HeroSlide[];
  infoItems?: InfoItem[];
  attentionItems?: AttentionItem[];
  projectsSectionTitle?: string;
  projectsItems?: any[];
  mapsSectionTitle?: string;
  mapsItems?: MapItem[];
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;
  partnerLogos?: string[] | null;
};

type PersonItem = {
  id: number;
  fullName: string;
  role?: string;
  institution?: string;
  email?: string;
  cvLink?: string;
  location?: string;
  avatar?: string | null;
  bio?: string;
};

function parseJsonArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeHomeResponse(data: any): HomeContent | null {
  const raw =
    data?.data?.content ||
    data?.data?.home ||
    data?.data?.homeContent ||
    data?.data ||
    data?.home ||
    data?.content ||
    data?.homeContent ||
    data?.result ||
    data;

  if (!raw || typeof raw !== "object") return null;

  return {
    ...raw,
    heroSlides: parseJsonArray<HeroSlide>(raw.heroSlides),
    infoItems: parseJsonArray<InfoItem>(raw.infoItems),
    attentionItems: parseJsonArray<AttentionItem>(raw.attentionItems),
    projectsItems: parseJsonArray<any>(raw.projectsItems),
    mapsItems: parseJsonArray<MapItem>(raw.mapsItems),
    partnerLogos: parseJsonArray<string>(raw.partnerLogos),
  };
}

function normalizeArrayResponse<T>(data: any): T[] {
  if (Array.isArray(data)) return data;

  const candidates = [
    data?.data,
    data?.data?.items,
    data?.data?.projects,
    data?.data?.people,
    data?.data?.result,
    data?.data?.data,
    data?.items,
    data?.result,
    data?.projects,
    data?.people,
    data?.projectsItems,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function getErrorText(error: any) {
  if (!error) return "";

  if (typeof error === "string") return error;

  return (
    error?.message ||
    error?.error ||
    error?.response?.data?.message ||
    String(error)
  );
}

export default function Home() {
  const [home, setHome] = useState<HomeContent>(
    FALLBACK_HOME_CONTENT as HomeContent
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentInfoPage, setCurrentInfoPage] = useState(0);
  const [people, setPeople] = useState<PersonItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectError, setProjectError] = useState("");

  const peopleSliderRef = useRef<HTMLDivElement>(null);

  const imgUrl = (url?: string | null) => {
    if (!url || !url.trim()) return "";

    if (url.startsWith("http")) return url;

    if (url.startsWith("/images")) return url;

    return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const getMapEmbedSrc = (link?: string | null, fallbackQuery?: string) => {
    const raw = link?.trim() || "";

    if (!raw && !fallbackQuery?.trim()) return "";

    const srcMatch = raw.match(/src=["']([^"']+)["']/i);
    if (srcMatch?.[1]) {
      return srcMatch[1];
    }

    if (raw.includes("google.com/maps/embed")) {
      return raw;
    }

    const coordMatch = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch?.[1] && coordMatch?.[2]) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`;
    }

    const placeMatch = raw.match(/\/place\/([^/@?]+)/);
    if (placeMatch?.[1]) {
      const placeName = decodeURIComponent(placeMatch[1]).replace(/\+/g, " ");
      return `https://maps.google.com/maps?q=${encodeURIComponent(
        placeName
      )}&z=15&output=embed`;
    }

    try {
      if (raw.startsWith("http")) {
        const url = new URL(raw);
        const q = url.searchParams.get("q");

        if (q) {
          return `https://maps.google.com/maps?q=${encodeURIComponent(
            q
          )}&z=15&output=embed`;
        }
      }
    } catch (_error) {
      // bỏ qua nếu URL không hợp lệ
    }

    const query = raw || fallbackQuery || "";
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      query
    )}&z=15&output=embed`;
  };

  const scrollPeople = (direction: "left" | "right") => {
    if (!peopleSliderRef.current) return;

    peopleSliderRef.current.scrollBy({
      left: direction === "left" ? -1260 : 1260,
      behavior: "smooth",
    });
  };

 useEffect(() => {
  let cancelled = false;

  async function fetchHome() {
    try {
      const result = await getHomeContent();
      if (cancelled) return;

      const homeData = normalizeHomeResponse(result);
      setHome(homeData || (FALLBACK_HOME_CONTENT as HomeContent));
    } catch {
      if (!cancelled) {
        setHome(FALLBACK_HOME_CONTENT as HomeContent);
      }
    }
  }

  async function fetchSecondaryContent() {
    const [peopleResult, projectsResult] = await Promise.allSettled([
      getPeople(),
      getProjects(),
    ]);

    if (cancelled) return;

    if (peopleResult.status === "fulfilled") {
      setPeople(normalizeArrayResponse<PersonItem>(peopleResult.value));
    } else {
      setPeople([]);
    }

    if (projectsResult.status === "fulfilled") {
      setProjects(normalizeArrayResponse<ProjectItem>(projectsResult.value));
      setProjectError("");
    } else {
      const errorText = getErrorText(projectsResult.reason);
      setProjectError(
        errorText || "Không lấy được dữ liệu Projects từ backend."
      );
      setProjects([]);
    }
  }

  fetchHome();

  const timer = window.setTimeout(() => {
    fetchSecondaryContent();
  }, 150);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}, []);

  const infoItems = Array.isArray(home?.infoItems) ? home.infoItems : [];

  const attentionItems: AttentionItem[] =
    Array.isArray(home?.attentionItems) && home.attentionItems.length > 0
      ? home.attentionItems
      : [
          {
            title: "01/31/2026: PI Transfer Requests",
            content:
              "Submit via email to tonssc-grants-pi-transfer@mail.nasa.gov",
            postSlug: "pi-transfer-requests",
          },
          {
            title: "01/30/2026: Administrative supplement requests",
            content:
              "No-Cost Extensions, Administrative Changes, Prior Approvals",
            postSlug: "administrative-supplement-requests",
          },
          {
            title: "01/29/2026: Final reports",
            content: "Submit via NSPIRES",
            postSlug: "final-reports",
          },
        ];

  const heroSlides = useMemo(() => {
    if (Array.isArray(home?.heroSlides) && home.heroSlides.length > 0) {
      return home.heroSlides;
    }

    if (home?.heroImage) {
      return [
        {
          image: home.heroImage,
          title: home.heroTitle || "Upcoming Events & Activities",
          description: home.heroDescription || "",
          buttonText: home.heroButtonText || "Know More",
          buttonLink: home.heroButtonLink || "#",
        },
      ];
    }

    return [];
  }, [home]);

  const itemsPerPage = 4;
  const totalInfoPages = Math.max(1, Math.ceil(infoItems.length / itemsPerPage));

  const paginatedInfoItems = infoItems.slice(
    currentInfoPage * itemsPerPage,
    currentInfoPage * itemsPerPage + itemsPerPage
  );

  useEffect(() => {
    if (currentSlide >= heroSlides.length && heroSlides.length > 0) {
      setCurrentSlide(0);
    }
  }, [heroSlides, currentSlide]);

  useEffect(() => {
    if (currentInfoPage >= totalInfoPages) {
      setCurrentInfoPage(0);
    }
  }, [totalInfoPages, currentInfoPage]);

  const goPrevSlide = () => {
    if (heroSlides.length === 0) return;

    setCurrentSlide((prev) =>
      prev === 0 ? heroSlides.length - 1 : prev - 1
    );
  };

  const goNextSlide = () => {
    if (heroSlides.length === 0) return;

    setCurrentSlide((prev) =>
      prev === heroSlides.length - 1 ? 0 : prev + 1
    );
  };

  const sortedProjects = Array.isArray(projects)
    ? [...projects].sort(
        (a, b) =>
          new Date(b.publishedAt || "1970-01-01").getTime() -
          new Date(a.publishedAt || "1970-01-01").getTime()
      )
    : [];

  const newestProject = sortedProjects.length > 0 ? sortedProjects[0] : null;

  const sortedMaps = Array.isArray(home?.mapsItems)
    ? [...home.mapsItems].sort(
        (a, b) =>
          new Date(b.publishedAt || "1970-01-01").getTime() -
          new Date(a.publishedAt || "1970-01-01").getTime()
      )
    : [];

  const homeMaps = sortedMaps.slice(0, 3);

  const currentHeroSlide = heroSlides[currentSlide];
  const currentHeroImage = imgUrl(currentHeroSlide?.image);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="bg-[#efefef] text-black">
        <section className="py-10">
          <Container>
            <div className="text-center">
              <h1 className="text-[56px] font-bold text-[#0b3f75]">
                {home?.welcomeTitle || "Welcome to IMRWG"}
              </h1>

              <p className="mx-auto mt-4 max-w-[1500px] text-[24px] leading-10">
                {home?.welcomeText || (
                  <>
                    <span className="font-bold">
                      The International Conference on the Mekong River System
                    </span>{" "}
                    marked an important milestone in understanding the Mekong
                    River system – a place where you can explore insights,
                    research, and diverse perspectives on one of the most
                    important rivers in the region.
                  </>
                )}
              </p>
            </div>

            <div className="mt-8 overflow-hidden border-y border-gray-400 py-4">
              <div className="animate-marquee inline-block whitespace-nowrap text-[22px] text-gray-700">
                {home?.marqueeText ||
                  "Programmatic Meeting at the HCMC University of Natural Resources and Environment (HCMUNRE) – 20-21 April 2026."}
              </div>
            </div>
          </Container>
        </section>

        <section className="pb-10">
          <Container>
            <div className="grid items-start gap-6 lg:grid-cols-[245px_minmax(0,1fr)_255px] xl:grid-cols-[270px_minmax(0,1fr)_285px]">
              <div className="h-full">
                <h2 className="mb-5 text-[24px] font-bold leading-tight">
                  IMRWG Scientific Group Meeting Schedule
                </h2>

                <div className="overflow-hidden border border-gray-300 bg-white">
                  <div className="grid grid-cols-2 bg-[#4b5a6f] text-white">
                    <div className="border-r border-gray-300 p-4 text-[15px] font-semibold">
                      Date
                    </div>

                    <div className="p-4 text-[15px] font-semibold">
                      Location
                    </div>
                  </div>

                  {paginatedInfoItems.length > 0 ? (
                    paginatedInfoItems.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 border-t border-gray-300"
                      >
                        <div className="border-r border-gray-300 p-4 text-[15px] font-semibold">
                          {item.date}
                        </div>

                        <div className="p-4 text-[15px]">{item.location}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-[15px] text-gray-500">
                      Meeting data is not available.
                    </div>
                  )}
                </div>

                {infoItems.length > itemsPerPage && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentInfoPage((prev) =>
                            prev === 0 ? totalInfoPages - 1 : prev - 1
                          )
                        }
                        className="rounded border bg-white px-4 py-2"
                      >
                        ‹
                      </button>

                      {Array.from({ length: totalInfoPages }).map(
                        (_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentInfoPage(index)}
                            className={`rounded border px-4 py-2 ${
                              currentInfoPage === index
                                ? "bg-[#9ac06f] text-white"
                                : "bg-white"
                            }`}
                          >
                            {index + 1}
                          </button>
                        )
                      )}

                      <button
                        onClick={() =>
                          setCurrentInfoPage((prev) =>
                            prev === totalInfoPages - 1 ? 0 : prev + 1
                          )
                        }
                        className="rounded border bg-white px-4 py-2"
                      >
                        ›
                      </button>
                    </div>

                    <p className="mt-4 text-[18px] font-semibold">
                      {currentInfoPage + 1} of {totalInfoPages}
                    </p>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                {heroSlides.length > 0 &&
                currentHeroSlide &&
                currentHeroImage ? (
                  <div className="relative h-[380px] overflow-hidden bg-black">
                    <img
                      src={currentHeroImage}
                      alt={currentHeroSlide.title || "Slide image"}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />

                    <div className="absolute inset-0 bg-black/15" />

                    <button
                      onClick={goPrevSlide}
                      className="absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-black/50 px-4 py-3 text-2xl text-white"
                    >
                      ‹
                    </button>

                    <button
                      onClick={goNextSlide}
                      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-black/50 px-4 py-3 text-2xl text-white"
                    >
                      ›
                    </button>

                    <div className="absolute bottom-8 left-10 right-10 text-white">
                      <div className="mb-4 inline-block rounded-full bg-blue-600 px-5 py-2 font-semibold text-white">
                        Latest
                      </div>

                      <h3 className="max-w-[650px] text-[32px] font-bold leading-tight xl:text-[40px]">
                        {currentHeroSlide.title}
                      </h3>

                      <p className="mt-4 max-w-[760px] line-clamp-2 text-[16px] leading-7">
                        {currentHeroSlide.description}
                      </p>

                      <a
                        href={currentHeroSlide.buttonLink || "#"}
                        className="mt-6 inline-block rounded bg-black px-7 py-3 text-[16px] font-semibold text-white"
                      >
                        {currentHeroSlide.buttonText || "Know More"}
                      </a>
                    </div>

                    {heroSlides.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
                        {heroSlides.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-4 w-4 rounded-full ${
                              currentSlide === index
                                ? "bg-[#0b5cad]"
                                : "bg-white/70"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-[380px] w-full items-center justify-center bg-gray-300 text-[20px] text-gray-600">
                    There is no image in the middle of the page.
                  </div>
                )}
              </div>

              <div className="h-fit border border-[#8cc6ff] bg-[#FFFFFF] p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[28px] font-bold text-black">
                    Attention
                  </h2>

                  <Link
                    href="/documents/"
                    className="text-[18px] font-semibold text-[#0b5cad] underline underline-offset-4 hover:text-[#063f7d]"
                  >
                    View All
                  </Link>
                </div>

                <div className="mt-5 space-y-5 border-t border-[#b9dfff] pt-5">
                  {attentionItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex gap-3 text-[#0b5cad]">
                      <span className="mt-2 h-3 w-3 shrink-0 bg-[#0b5cad]" />

                      <div className="text-[17px] leading-8">
                        <Link
                          href={`/documents/attention/${item.postSlug}`}
                          className="text-[#0b5cad] hover:text-[#063f7d] hover:underline"
                        >
                          {item.title}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <section className="mt-6 bg-white py-12">
              <Container>
                <div className="space-y-8">
                  <h2 className="text-[32px] font-black uppercase tracking-[0.08em] text-[#1f3b63]">
                    New project
                  </h2>

                  {newestProject ? (
                    <div className="grid items-center gap-10 lg:grid-cols-[430px_minmax(0,1fr)]">
                      <Link
                        href={
                          newestProject.readMoreLink ||
                          (newestProject.slug
                            ? `/projects/${newestProject.slug}`
                            : "/projects")
                        }
                        className="block h-[230px] overflow-hidden rounded-[12px] bg-gradient-to-br from-blue-500 via-cyan-500 to-green-500 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        {imgUrl(newestProject.image) ? (
                          <img
                            src={imgUrl(newestProject.image) || undefined}
                            alt={newestProject.title || "Project image"}
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[17px] font-bold text-white">
                            No image
                          </div>
                        )}
                      </Link>

                      <div>
                        <h3 className="text-[30px] font-black leading-tight text-[#1f3b63]">
                          {newestProject.title || "Untitled project"}
                        </h3>

                        <p className="mt-5 max-w-[850px] text-[18px] font-medium leading-8 text-[#52657f]">
                          {newestProject.description ||
                            newestProject.subtitle ||
                            "No description for this project yet."}
                        </p>

                        <Link
                          href={
                            newestProject.readMoreLink ||
                            (newestProject.slug
                              ? `/projects/${newestProject.slug}`
                              : "/projects")
                          }
                          className="mt-6 inline-block text-[18px] font-semibold text-[#0b5cad] underline underline-offset-4 hover:text-[#063f7d]"
                        >
                          Read more →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`rounded-[16px] border border-dashed p-8 text-center text-[17px] font-semibold ${
                        projectError
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-[#cbd5e1] bg-[#f8fafc] text-gray-500"
                      }`}
                    >
                      {projectError ? (
                        <>
                          <p className="font-black">Projects API đang lỗi.</p>
                          <p className="mt-2 break-words text-[14px] font-semibold">
                            {projectError}
                          </p>
                          <p className="mt-2 text-[14px]">
                            Mở trực tiếp: {API_URL}/api/projects để xem lỗi backend.
                          </p>
                        </>
                      ) : (
                        "There are no projects yet."
                      )}
                    </div>
                  )}
                </div>
              </Container>
            </section>
          </Container>
        </section>

        <section className="bg-gradient-to-br from-[#071326] via-[#102446] to-[#1d4f91] py-14">
          <Container>
            <div className="grid items-stretch gap-8 lg:grid-cols-3">
              {homeMaps.length > 0 ? (
                homeMaps.slice(0, 3).map((item, index) => {
                  const mapSrc = getMapEmbedSrc(
                    item.link,
                    `${item.title} ${item.content}`
                  );

                  return (
                    <div
                      key={index}
                      className="flex h-[390px] flex-col overflow-hidden rounded-[24px] border border-white/15 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(0,0,0,0.35)]"
                    >
                      <div className="p-6 pb-3">
                        <h3 className="min-h-[58px] line-clamp-2 text-[24px] font-black leading-tight text-[#0f2342]">
                          {item.title}
                        </h3>
                      </div>

                      <div className="mx-6 mb-5 mt-2 h-[170px] overflow-hidden rounded-[18px] border border-[#c7d7e8] bg-[#e8f3ff]">
                        {mapSrc ? (
                          <iframe
                            src={mapSrc}
                            title={item.title || `Map ${index + 1}`}
                            className="h-full w-full border-0"
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-500">
                            No map available.
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex justify-center px-6 pb-6">
                        <Link
                          href={`/maps/${item.slug}`}
                          className="inline-flex items-center justify-center rounded-[14px] bg-gradient-to-r from-[#1d7bba] to-[#2563eb] px-6 py-3 text-[16px] font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          {item.buttonText || "View Map"} →
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="h-[390px] rounded-[24px] border border-white/15 bg-white/10 p-6 shadow-lg" />
                  <div className="h-[390px] rounded-[24px] border border-white/15 bg-white/10 p-6 shadow-lg" />
                  <div className="h-[390px] rounded-[24px] border border-white/15 bg-white/10 p-6 shadow-lg" />
                </>
              )}
            </div>
          </Container>
        </section>

        <section className="bg-[#efefef] py-12">
          <div className="mx-auto max-w-[1500px] px-12">
            <h2 className="mb-10 text-center text-[34px] font-bold uppercase text-[#1f3b63]">
              FEATURED SPEAKERS
            </h2>

            <div className="relative">
              {people.length > 0 && (
                <button
                  onClick={() => scrollPeople("left")}
                  className="absolute left-[-20px] top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[26px] shadow-md hover:bg-gray-100"
                >
                  &#10094;
                </button>
              )}

              <div
                ref={peopleSliderRef}
                className="scrollbar-hide flex gap-6 overflow-x-auto scroll-smooth pb-4"
              >
                {people.length > 0 ? (
                  people.map((person) => (
                    <div
                      key={person.id}
                      className="basis-1/5 min-w-[260px] flex-shrink-0"
                    >
                      <div className="flex h-[310px] w-full flex-col items-center rounded-2xl bg-white p-6 text-center shadow-md transition hover:shadow-lg">
                        <div className="mx-auto h-[110px] w-[110px] shrink-0 overflow-hidden rounded-full bg-gray-200">
                          {person.avatar ? (
                            <img
                              src={imgUrl(person.avatar) || ""}
                              alt={person.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                              No image
                            </div>
                          )}
                        </div>

                        <h3 className="mt-5 line-clamp-2 min-h-[52px] text-[18px] font-bold leading-[26px] text-black">
                          {person.fullName}
                        </h3>

                        <div className="mt-2 min-h-[52px]">
                          {person.role ? (
                            <p className="line-clamp-2 text-[16px] leading-[26px] text-gray-700">
                              {person.role}
                            </p>
                          ) : (
                            <p className="text-[16px] leading-[26px] text-gray-400">
                              Updating...
                            </p>
                          )}
                        </div>

                        <Link
                          href={
                            person.id
                              ? `/people?personId=${person.id}`
                              : `/people?name=${encodeURIComponent(
                                  person.fullName
                                )}`
                          }
                          className="mt-auto inline-flex items-center gap-1 border-b-2 border-[#65b741] pb-1 text-[15px] font-bold !text-[#0066cc] transition hover:gap-2 hover:border-[#4f9d2f] hover:!text-[#004f9e]"
                        >
                          Xem chi tiết <span className="text-[16px]">››</span>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-8 text-center text-[18px] text-gray-500">
                    Chưa có dữ liệu People.
                  </div>
                )}
              </div>

              {people.length > 0 && (
                <button
                  onClick={() => scrollPeople("right")}
                  className="absolute right-[-20px] top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[26px] shadow-md hover:bg-gray-100"
                >
                  &#10095;
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mb-10 bg-[#eaf4ff] py-10">
          <Container>
            <div className="mb-10 text-center">
              <h2 className="text-[32px] font-semibold text-[#0b5cad]">
                {home?.projectsSectionTitle || "STRATEGIC PARTNERS"}
              </h2>
            </div>

            <div className="relative flex justify-center gap-12 bg-[#eaf4ff] px-8 py-12 lg:gap-20 xl:gap-30">
              <div
                className="absolute inset-x-0 top-[-20px] rounded-[28px] bg-cover bg-center opacity-80"
                style={{
                  backgroundImage: "url('/images/s1.jfif')",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  height: "230px",
                  width: "100%",
                }}
              />

              {(Array.isArray(home?.projectsItems) &&
              home.projectsItems.length > 0
                ? home.projectsItems
                : [
                    {
                      name: "HCMUNRE",
                      title: "HCMUNRE",
                      logo: "/images/S2.png",
                      imageUrl: "/images/S2.png",
                      link: "#",
                      buttonLink: "#",
                    },
                    {
                      name: "ISP",
                      title: "ISP",
                      logo: "/images/S3.jpg",
                      imageUrl: "/images/S3.jpg",
                      link: "#",
                      buttonLink: "#",
                    },
                    {
                      name: "UTT",
                      title: "UTT",
                      logo: "/images/S4.png",
                      imageUrl: "/images/S4.png",
                      link: "#",
                      buttonLink: "#",
                    },
                    {
                      name: "VNSC",
                      title: "VNSC",
                      logo: "/images/S5.png",
                      imageUrl: "/images/S5.png",
                      link: "#",
                      buttonLink: "#",
                    },
                  ]
              ).map((partner: any, index: number) => {
                const partnerName =
                  partner.name || partner.title || `Partner ${index + 1}`;
                const partnerLogo = partner.logo || partner.imageUrl || "";
                const partnerLink = partner.link || partner.buttonLink || "#";

                const card = (
                  <div className="z-10 flex h-[200px] w-[160px] flex-col items-center rounded-[999px] border-2 border-[#8cc6ff] bg-white px-6 py-5 shadow-[0_12px_30px_rgba(11,92,173,0.16)] transition-transform hover:scale-105 hover:border-[#0b5cad]">
                    <div className="flex h-[110px] w-[110px] items-center justify-center">
                      {partnerLogo ? (
                        <img
                          src={imgUrl(partnerLogo) || partnerLogo}
                          alt={partnerName}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-center text-xs text-slate-400">
                          No logo
                        </span>
                      )}
                    </div>

                    <p className="mt-4 text-[16px] font-semibold text-[#0b3f75]">
                      {partnerName}
                    </p>
                  </div>
                );

                if (!partnerLink || partnerLink === "#") {
                  return (
                    <div key={index} className="z-10">
                      {card}
                    </div>
                  );
                }

                return (
                  <a
                    key={index}
                    href={partnerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="z-10"
                  >
                    {card}
                  </a>
                );
              })}
            </div>
          </Container>
        </section>

        <Footer
          footerLogo={home?.footerLogo}
          footerMailingText={home?.footerMailingText}
          footerContactText={home?.footerContactText}
          footerSocialText={home?.footerSocialText}
        />
      </main>
    </>
  );
}
