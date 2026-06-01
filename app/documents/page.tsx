"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { getHomeContent } from "@/lib/api";

type AttentionItem = {
  title: string;
  content: string;
  postSlug: string;
};

type HomeContent = {
  siteName?: string;
  headerLogo?: string;
  partnerLogos?: string[] | null;
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;
  attentionItems?: AttentionItem[];
};

export default function DocumentsPage() {
  const [home, setHome] = useState<HomeContent | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getHomeContent();
        if (res?.data) {
          setHome(res.data);
        }
      } catch (error) {
        console.error("FETCH DOCUMENTS PAGE ERROR:", error);
      }
    };

    fetchData();
  }, []);

  const attentionItems = Array.isArray(home?.attentionItems)
    ? home.attentionItems
    : [];

  const extractFirstImage = (html: string) => {
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : "";
  };

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html
      .replace(/<img[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#efefef] py-10">
        <Container>
          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-[40px] font-bold text-[#2c3e50]">
                  Articles
                </h1>
                <p className="mt-2 text-[16px] text-gray-600">
                  List of articles
                </p>
              </div>

              <div className="text-[15px] text-gray-500">
                Total articles:{" "}
                <span className="font-semibold text-[#2c3e50]">
                  {attentionItems.length}
                </span>
              </div>
            </div>

            {attentionItems.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {attentionItems.map((item, index) => {
                  const thumbnail = extractFirstImage(item.content);
                  const previewText = truncateText(stripHtml(item.content), 140);

                  return (
                    <div
                      key={`${item.postSlug}-${index}`}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="h-[220px] w-full overflow-hidden bg-[#f3f4f6]">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h2 className="line-clamp-2 text-[24px] font-bold leading-snug text-[#1f3b63]">
                          {item.title}
                        </h2>

                        <p className="mt-4 min-h-[72px] text-[15px] leading-6 text-gray-600">
                          {previewText || "Chưa có mô tả cho bài viết này."}
                        </p>

                        <div className="mt-6 flex justify-center">
                          <Link
                            href={`/documents/attention/${item.postSlug}`}
                            className="inline-flex items-center rounded-lg bg-[#1d7bba] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16679c]"
                          >
                            See details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-[18px] text-gray-500">
                No articles have been written yet.
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
      />
    </>
  );
}