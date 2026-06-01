"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { getAboutContentBySlug, getHomeContent } from "@/lib/api";

type HomeContent = {
  siteName?: string;
  headerLogo?: string;
  partnerLogos?: string[] | null;
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;
};

type AboutContent = {
  title?: string;
  subtitle?: string;
  description?: string;
  mission?: string;
  vision?: string;
  content?: string | { html?: string };
};

type ContactCard = {
  label: string;
  value: string;
  borderClass: string;
  bgClass: string;
  labelClass: string;
};

function getHtmlContent(content?: string | { html?: string }) {
  if (!content) return "";
  if (typeof content === "string") return content;
  return content.html || "";
}

export default function ContactAboutPage() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const [homeRes, aboutRes] = await Promise.all([
          getHomeContent(),
          getAboutContentBySlug("contact"),
        ]);

        if (homeRes?.data) setHome(homeRes.data);
        if (aboutRes?.data) setAbout(aboutRes.data);
      } catch (error) {
        console.error("FETCH CONTACT ABOUT ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, []);

  const htmlContent = useMemo(() => getHtmlContent(about?.content), [about]);

  const contactCards: ContactCard[] = [
    {
      label: "Name of organization/unit",
      value:
        home?.siteName ||
        "International Mekong Research Working Group (IMRWG)",
      borderClass: "border-[#0f6fb8]",
      bgClass: "bg-[#f0f8ff]",
      labelClass: "text-[#0f6fb8]",
    },
    {
      label: "Address",
      value: home?.footerContactText || "Address will be updated soon.",
      borderClass: "border-[#7ab648]",
      bgClass: "bg-[#f5fbef]",
      labelClass: "text-[#6b9f35]",
    },
    {
      label: "Contact email",
      value: home?.footerMailingText || "Email will be updated soon.",
      borderClass: "border-[#e0a43a]",
      bgClass: "bg-[#fff8e8]",
      labelClass: "text-[#b7791f]",
    },
    {
      label: "Phone number",
      value: "Phone number will be updated soon.",
      borderClass: "border-[#d65a5a]",
      bgClass: "bg-[#fff1f1]",
      labelClass: "text-[#c53030]",
    },
    {
      label: "Working hours",
      value: "Monday – Friday, 08:00 – 17:00",
      borderClass: "border-[#7c5cc4]",
      bgClass: "bg-[#f5f1ff]",
      labelClass: "text-[#6b46c1]",
    },
    {
      label: "Social media",
      value:
        home?.footerSocialText ||
        "Social media information will be updated soon.",
      borderClass: "border-[#20a39e]",
      bgClass: "bg-[#ecfffd]",
      labelClass: "text-[#118c88]",
    },
  ];

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#eef3f7] py-10">
        <Container>
          <section className="rounded-[28px] bg-white p-8 shadow-md md:p-10">
            <div className="mb-8">
              <Link
                href="/about"
                className="mb-6 inline-flex rounded-full bg-[#eef6ff] px-5 py-3 text-sm font-bold text-[#0f6fb8] transition hover:bg-[#0f6fb8] hover:text-white"
              >
                ← Back to About
              </Link>

              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#7ab648]">
                Contact
              </p>

              <h1 className="text-[42px] font-bold leading-tight text-[#2c3e50] md:text-[52px]">
                Contact information
              </h1>

              <p className="mt-3 max-w-3xl text-[17px] leading-8 text-gray-600">
                Official contact information for IMRWG.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {contactCards.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border-2 ${item.borderClass} ${item.bgClass} p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
                >
                  <p
                    className={`text-sm font-extrabold uppercase tracking-[0.14em] ${item.labelClass}`}
                  >
                    {item.label}
                  </p>

                  <p className="mt-4 whitespace-pre-line text-[17px] font-medium leading-7 text-[#2c3e50]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[28px] bg-white p-8 shadow-md md:p-10">
            <div className="mb-6">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#7ab648]">
                Map
              </p>

              <h2 className="text-[34px] font-bold text-[#2c3e50]">
                Location map
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border-2 border-[#0f6fb8] bg-gray-100 shadow-sm">
              <iframe
                src="https://www.google.com/maps?q=Ho%20Chi%20Minh%20City%2C%20Vietnam&output=embed"
                title="Contact location map"
                className="h-[420px] w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>

          {!loading && htmlContent && (
            <section className="mt-8 rounded-[28px] bg-white p-8 shadow-md md:p-10">
              <div className="mb-6">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#7ab648]">
                  Details
                </p>

                <h2 className="text-[34px] font-bold text-[#2c3e50]">
                  Additional contact details
                </h2>
              </div>

              <article
                className="
                  max-w-none text-[17px] leading-8 text-gray-700
                  [&_h1]:mb-5 [&_h1]:mt-8 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-[#2c3e50]
                  [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-[#2c3e50]
                  [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-[#2c3e50]
                  [&_p]:mb-5
                  [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc
                  [&_ol]:mb-6 [&_ol]:ml-6 [&_ol]:list-decimal
                  [&_li]:mb-2
                  [&_a]:font-semibold [&_a]:text-[#0f6fb8] [&_a]:underline
                  [&_img]:my-8 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-2xl [&_img]:object-cover
                  [&_table]:my-6 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto
                "
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
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