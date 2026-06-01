"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { getHomeContent, getLibraryDocumentBySlug } from "@/lib/api";

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

export default function LibraryDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [home, setHome] = useState<HomeContent | null>(null);
  const [document, setDocument] = useState<LibraryDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [slug]);

  async function fetchDetail() {
    try {
      setLoading(true);

      const [homeRes, docRes] = await Promise.all([
        getHomeContent(),
        getLibraryDocumentBySlug(slug),
      ]);

      setHome(homeRes?.data || homeRes || null);
      setDocument(docRes?.data || null);
    } catch (error) {
      console.error("FETCH LIBRARY DETAIL ERROR:", error);
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }

  const dateLabel = document?.publishedAt
    ? new Date(document.publishedAt).toLocaleDateString("en-US")
    : "No date";

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#f6f7fb] px-6 py-12">
        <Container>
          <Link
            href="/documents/library"
            className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            ← Back to Library
          </Link>

          {loading ? (
            <div className="mt-8 rounded-2xl bg-white p-8 text-slate-500">
              Loading document...
            </div>
          ) : document ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
              <article className="overflow-hidden rounded-[28px] bg-white shadow-sm">
                {document.coverImage ? (
                  <img
                    src={document.coverImage}
                    alt={document.title}
                    className="h-[320px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[260px] items-center justify-center bg-blue-50 text-6xl">
                    📄
                  </div>
                )}

                <div className="p-8">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-700">
                      {document.category || "General"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                      {document.fileType || "File"}
                    </span>
                    {document.isFeatured ? (
                      <span className="rounded-full bg-lime-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-lime-700">
                        Featured
                      </span>
                    ) : null}
                  </div>

                  <h1 className="text-4xl font-black leading-tight text-slate-950">
                    {document.title}
                  </h1>

                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    {document.description || "No description"}
                  </p>
                </div>
              </article>

              <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                <div className="rounded-[24px] bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-slate-950">
                    Document information
                  </h2>

                  <div className="mt-5 space-y-4">
                    <InfoRow label="Category" value={document.category || "General"} />
                    <InfoRow label="Author" value={document.author || "Unknown"} />
                    <InfoRow label="Date" value={dateLabel} />
                    <InfoRow label="File type" value={document.fileType || "File"} />
                    <InfoRow
                      label="Status"
                      value={document.status === "PUBLISHED" ? "Published" : "Draft"}
                    />
                  </div>

                  {document.fileUrl ? (
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="mt-6 flex w-full justify-center rounded-2xl bg-blue-600 px-5 py-3 font-black text-white transition hover:bg-blue-700"
                    >
                      Download document
                    </a>
                  ) : (
                    <div className="mt-6 rounded-2xl bg-slate-100 px-5 py-3 text-center font-bold text-slate-400">
                      No file available
                    </div>
                  )}
                </div>
              </aside>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
              <h1 className="text-3xl font-black text-slate-950">
                Document not found
              </h1>
              <p className="mt-3 text-slate-500">
                This document may have been removed or unpublished.
              </p>
            </div>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}