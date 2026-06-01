"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  attentionItems?: AttentionItem[];
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;
};

export default function AttentionDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [home, setHome] = useState<HomeContent | null>(null);
  const [post, setPost] = useState<AttentionItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getHomeContent();
        const data = res?.data || null;
        setHome(data);

        const attentionItems: AttentionItem[] =
          Array.isArray(data?.attentionItems) && data.attentionItems.length > 0
            ? data.attentionItems
            : [];

        const foundPost = attentionItems.find((item) => item.postSlug === slug);
        setPost(foundPost || null);
      } catch (error) {
        console.error("Failed to fetch attention detail:", error);
      }
    };

    fetchData();
  }, [slug]);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#efefef] py-10">
        <Container>
          <div className="overflow-hidden rounded-xl bg-white p-8 shadow-md">
            <div className="mb-6">
              <Link
                href="/documents"
                className="text-[16px] font-medium text-[#1d7bba] transition hover:text-[#0b5f96] hover:underline"
              >
                ← Back to Articles
              </Link>
            </div>

            {post ? (
              <article className="max-w-full overflow-hidden">
                <h1 className="break-words text-[36px] font-bold leading-tight text-[#2c3e50]">
                  {post.title}
                </h1>

                <div className="mt-6 border-t pt-6">
                  <div
                    className="
                      max-w-none overflow-hidden break-words text-[20px] leading-9 text-[#2c3e50]
                      [&_*]:max-w-full 

                      [&_a]:relative
                      [&_a]:inline-flex
                      [&_a]:items-center
                      [&_a]:gap-1
                      [&_a]:rounded-md
                      [&_a]:px-1
                      [&_a]:font-bold
                      [&_a]:text-[#0b63ce]
                      [&_a]:underline
                      [&_a]:decoration-[#0b63ce]/40
                      [&_a]:decoration-2
                      [&_a]:underline-offset-4
                      [&_a]:transition
                      [&_a]:duration-200
                      [&_a]:cursor-pointer
                      hover:[&_a]:bg-blue-50
                      hover:[&_a]:text-[#064ea5]
                      hover:[&_a]:decoration-[#064ea5]
                      [&_a::after]:content-['↗']
                      [&_a::after]:text-[13px]
                      [&_a::after]:font-black
                      [&_a::after]:opacity-70

                      [&_blockquote]:my-5
                      [&_blockquote]:rounded-xl
                      [&_blockquote]:border-l-4
                      [&_blockquote]:border-[#9ac06f]
                      [&_blockquote]:bg-[#f4f8ef]
                      [&_blockquote]:px-5
                      [&_blockquote]:py-3

                      [&_h1]:mb-4
                      [&_h1]:mt-6
                      [&_h1]:text-[34px]
                      [&_h1]:font-bold
                      [&_h1]:leading-tight

                      [&_h2]:mb-3
                      [&_h2]:mt-6
                      [&_h2]:text-[28px]
                      [&_h2]:font-bold
                      [&_h2]:leading-tight

                      [&_h3]:mb-3
                      [&_h3]:mt-5
                      [&_h3]:text-[24px]
                      [&_h3]:font-bold

                      [&_img]:mx-auto
                      [&_img]:my-6
                      [&_img]:block
                      [&_img]:h-auto
                      [&_img]:!max-w-full
                      [&_img]:!w-full
                      [&_img]:rounded-lg
                      [&_img]:object-contain
                      [&_img]:shadow-md

                      [&_li]:mb-2
                      [&_ol]:my-4
                      [&_ol]:list-decimal
                      [&_ol]:pl-6
                      [&_p]:mb-4
                      [&_strong]:font-bold
                      [&_ul]:my-4
                      [&_ul]:list-disc
                      [&_ul]:pl-6
                    "
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
              </article>
            ) : (
              <div className="text-[20px] text-red-600">
                Articles not found.
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