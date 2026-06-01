"use client";

import { useEffect, useMemo, useState } from "react";
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
  mapsSectionTitle?: string;
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

export default function MapsPage() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getHomeContent();

        if (res?.data) {
          setHome(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch maps content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const maps = useMemo(() => {
    if (!Array.isArray(home?.mapsItems)) return [];

    return [...home.mapsItems].sort(
      (a, b) =>
        new Date(b.publishedAt || "1970-01-01").getTime() -
        new Date(a.publishedAt || "1970-01-01").getTime()
    );
  }, [home?.mapsItems]);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#eef3f7] py-12">
        <Container>
          <section className="rounded-2xl bg-white p-8 shadow-md">
            <div className="mb-8">
              <h1 className="text-[42px] font-bold text-[#2c3e50]">
                {home?.mapsSectionTitle || "Maps"}
              </h1>

              <p className="mt-3 max-w-2xl text-[17px] leading-7 text-gray-600">
                Explore interactive maps, research locations, conference areas,
                and project sites.
              </p>
            </div>

            {loading ? (
              <div className="rounded-xl bg-gray-50 p-10 text-center text-gray-500">
                Đang tải Maps...
              </div>
            ) : maps.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {maps.map((item, index) => {
                  const mapSrc = getMapSrc(item.link);

                  return (
                    <Link
                      key={`${item.slug}-${index}`}
                      href={`/maps/${item.slug}`}
                      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="h-[260px] w-full overflow-hidden bg-gray-100">
                        {mapSrc ? (
                          <iframe
                            src={mapSrc}
                            title={item.title}
                            className="h-full w-full border-0"
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-500">
                            Chưa có hình map
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#7ab648]">
                          {item.topic || "Map"}
                        </p>

                        <h2 className="text-[22px] font-bold leading-snug text-[#2c3e50] group-hover:text-[#0f6fb8]">
                          {item.title}
                        </h2>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 p-10 text-center">
                <h2 className="text-[24px] font-bold text-[#2c3e50]">
                  Chưa có nội dung Maps.
                </h2>

                <p className="mt-2 text-gray-500">
                  Vào admin để thêm map đầu tiên.
                </p>
              </div>
            )}
          </section>
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