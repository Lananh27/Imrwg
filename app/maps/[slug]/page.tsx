"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { getHomeContent } from "@/lib/api";

type MapItem = {
  title: string;
  slug: string;
  topic?: string;
  content?: string;
  link: string;
  buttonText?: string;
  publishedAt?: string;
};

type HomeContent = {
  siteName?: string;
  headerLogo?: string;
  partnerLogos?: string[] | null;
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;
  mapsItems?: MapItem[];
};

function getMapSrc(link?: string) {
  if (!link) return "";

  const value = link.trim();

  const iframeSrcMatch = value.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch?.[1]) {
    return iframeSrcMatch[1];
  }

  if (value.includes("/maps/embed")) {
    return value;
  }

  if (value.includes("google.com/maps")) {
    try {
      const decoded = decodeURIComponent(value);

      const latLngMatch = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

      if (latLngMatch?.[1] && latLngMatch?.[2]) {
        return `https://www.google.com/maps?q=${latLngMatch[1]},${latLngMatch[2]}&z=16&output=embed`;
      }

      const placeMatch = decoded.match(/\/maps\/place\/([^/@?]+)/);

      if (placeMatch?.[1]) {
        const placeName = placeMatch[1].replace(/\+/g, " ");
        return `https://www.google.com/maps?q=${encodeURIComponent(
          placeName
        )}&output=embed`;
      }

      const url = new URL(value);
      const q = url.searchParams.get("q");

      if (q) {
        return `https://www.google.com/maps?q=${encodeURIComponent(
          q
        )}&output=embed`;
      }

      return value.includes("?")
        ? `${value}&output=embed`
        : `${value}?output=embed`;
    } catch {
      return value;
    }
  }

  return value;
}

function stripHtml(html?: string) {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function MapDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [home, setHome] = useState<HomeContent | null>(null);
  const [mapItem, setMapItem] = useState<MapItem | null>(null);
  const [allMaps, setAllMaps] = useState<MapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getHomeContent();
        const data = res?.data || null;

        setHome(data);

        const maps: MapItem[] =
          Array.isArray(data?.mapsItems) && data.mapsItems.length > 0
            ? data.mapsItems
            : [];

        setAllMaps(maps);

        const foundMap = maps.find((item) => item.slug === slug);
        setMapItem(foundMap || null);
      } catch (error) {
        console.error("Failed to fetch map detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const mapSrc = getMapSrc(mapItem?.link);

  const relatedMaps = useMemo(() => {
    if (!mapItem) return [];

    return allMaps
      .filter((item) => {
        if (item.slug === mapItem.slug) return false;

        if (mapItem.topic && item.topic) {
          return item.topic === mapItem.topic;
        }

        return true;
      })
      .slice(0, 3);
  }, [allMaps, mapItem]);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#eef3f7] py-10">
        <Container>
          <Link
            href="/maps"
            className="mb-6 inline-flex rounded-full bg-white px-5 py-3 text-[15px] font-bold text-[#0f6fb8] shadow-md transition hover:bg-[#0f6fb8] hover:text-white"
          >
            ← Back to Maps
          </Link>

          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-md">
              <p className="text-[18px] font-semibold text-gray-500">
                Đang tải map...
              </p>
            </div>
          ) : mapItem ? (
            <article className="overflow-hidden rounded-[28px] bg-white shadow-lg">
              <div className="border-b border-gray-100 p-8">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#7ab648]">
                  {mapItem.topic || "Map"}
                </p>

                <h1 className="text-[42px] font-bold leading-tight text-[#2c3e50] md:text-[52px]">
                  {mapItem.title}
                </h1>

                {mapItem.publishedAt && (
                  <p className="mt-3 text-[15px] text-gray-500">
                    Published:{" "}
                    {new Date(mapItem.publishedAt).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>

              <div className="p-6 md:p-8">
                <div className="h-[520px] w-full overflow-hidden rounded-[24px] border border-gray-200 bg-gray-100 shadow-sm md:h-[620px] lg:h-[700px]">
  {mapSrc ? (
    <iframe
      src={mapSrc}
      title={mapItem.title}
      className="h-full w-full border-0"
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-[20px] font-semibold text-gray-500">
      Chưa có link map
    </div>
  )}
</div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {mapSrc && (
                    <a
                      href={mapSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-[#0f6fb8] px-6 py-3 font-bold text-white transition hover:bg-[#0b5b96]"
                    >
                      Mở map trong tab mới
                    </a>
                  )}

                  <Link
                    href="/maps"
                    className="rounded-xl border border-[#0f6fb8] px-6 py-3 font-bold text-[#0f6fb8] transition hover:bg-[#f0f8ff]"
                  >
                    View all Maps
                  </Link>
                </div>

                {mapItem.content && (
                  <section className="mt-8 rounded-2xl bg-[#f8fafc] p-6">
                    <h2 className="text-[28px] font-bold text-[#2c3e50]">
                      Map Information
                    </h2>

                    <div
                      className="mt-4 whitespace-pre-line text-[17px] leading-8 text-gray-700"
                      dangerouslySetInnerHTML={{ __html: mapItem.content }}
                    />
                  </section>
                )}
              </div>
            </article>
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center shadow-md">
              <h1 className="text-[32px] font-bold text-red-600">
                Map not found.
              </h1>

              <p className="mt-3 text-gray-500">
                Không tìm thấy map này. Có thể slug chưa đúng hoặc map đã bị
                xoá.
              </p>

              <Link
                href="/maps"
                className="mt-6 inline-flex rounded-xl bg-[#0f6fb8] px-6 py-3 font-bold text-white"
              >
                Back to Maps
              </Link>
            </div>
          )}

          {relatedMaps.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-5 text-[30px] font-bold text-[#2c3e50]">
                Related Maps
              </h2>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedMaps.map((item, index) => {
                  const relatedSrc = getMapSrc(item.link);

                  return (
                    <Link
                      key={`${item.slug}-${index}`}
                      href={`/maps/${item.slug}`}
                      className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="h-[260px] bg-gray-100">
                        {relatedSrc ? (
                          <iframe
                            src={relatedSrc}
                            title={item.title}
                            className="h-full w-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-500">
                            Chưa có hình map
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <p className="mb-2 text-sm font-semibold text-[#7ab648]">
                          {item.topic || "Map"}
                        </p>

                        <h3 className="text-[22px] font-bold text-[#2c3e50]">
                          {item.title}
                        </h3>

                        {item.content && (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                            {stripHtml(item.content)}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
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