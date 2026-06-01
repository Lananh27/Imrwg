"use client";

import Container from "./Container";
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { MdEmail, MdPhone } from "react-icons/md";

type FooterProps = {
  footerLogo?: string;
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  backgroundImage?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787";

export default function Footer({
  footerLogo,
  footerMailingText,
  footerContactText,
  footerSocialText,
  backgroundImage = "/images/background.png",
}: FooterProps) {
  const imgUrl = (url?: string) => {
    if (!url) return "";
    return url.startsWith("http") || url.startsWith("/") ? url : `${API_URL}${url}`;
  };

  const footerBackground = imgUrl(backgroundImage) || "/images/background.png";

  const normalizeLink = (link: string) => {
    const clean = link.trim();
    if (!clean) return "";
    if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("mailto:") || clean.startsWith("tel:")) return clean;
    return `https://${clean}`;
  };

  const contactLines = (footerContactText || "").split("\n").map((item) => item.trim()).filter(Boolean);
  const phone = contactLines[0] || "0123456789";
  const email = contactLines[1] || "contact@example.com";

  const socialLines = (footerSocialText || "").split("\n").map((item) => normalizeLink(item)).filter(Boolean);
  const facebookLink = socialLines[0] || "";
  const xLink = socialLines[1] || "";
  const linkedinLink = socialLines[2] || "";

  const socialLinks = facebookLink
    ? [
        {
          name: "Facebook",
          link: facebookLink,
          icon: <FaFacebookF className="text-[18px] text-white" />,
        },
      ]
    : [];

  return (
    <footer
      className="py-6 text-white md:py-7"
      style={{
        backgroundImage: `linear-gradient(rgba(4,32,91,0.72), rgba(4,32,91,0.72)), url('${footerBackground}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container>
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.35fr_1.15fr_0.9fr] xl:items-start">
          <div>
            <div className="flex items-start gap-4">
              {footerLogo ? (
                <img src={imgUrl(footerLogo)} alt="Footer logo" className="h-[82px] w-[82px] shrink-0 rounded-sm bg-white object-contain p-1" />
              ) : (
                <div className="h-[82px] w-[82px] shrink-0 border border-white/40" />
              )}

              <div className="max-w-[360px] text-[18px] font-semibold leading-[1.25] text-white md:text-[20px]">
                {footerMailingText ? (
                  <p className="whitespace-pre-line">{footerMailingText}</p>
                ) : (
                  <p>
                    International Mekong
                    <br />
                    Research Working Group
                    <br />
                    (IMRWG)
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <span className="text-[17px] font-semibold text-white">Follow us:</span>
              {facebookLink ? <a href={facebookLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF className="text-[26px] text-white transition hover:text-lime-400" /></a> : <FaFacebookF className="text-[26px] text-white/50" />}
              {xLink ? <a href={xLink} target="_blank" rel="noopener noreferrer" aria-label="X"><FaXTwitter className="text-[26px] text-white transition hover:text-lime-400" /></a> : <FaXTwitter className="text-[26px] text-white/50" />}
              {linkedinLink ? <a href={linkedinLink} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedinIn className="text-[26px] text-white transition hover:text-lime-400" /></a> : <FaLinkedinIn className="text-[26px] text-white/50" />}
            </div>
          </div>

          <div className="flex flex-nowrap items-start justify-center gap-x-6 text-[16px] font-semibold text-white xl:pt-2">
            <span className="whitespace-nowrap transition hover:text-lime-300">Privacy</span>
            <span className="whitespace-nowrap transition hover:text-lime-300">Security</span>
            <span className="whitespace-nowrap transition hover:text-lime-300">Disclaimer</span>
            <span className="whitespace-nowrap transition hover:text-lime-300">Accessibility</span>
          </div>

          <div className="xl:pl-4">
            <div>
              <p className="text-[18px] font-semibold text-white">Contact us:</p>
              <div className="mt-3 space-y-2">
                <a href={`tel:${phone}`} className="flex items-center gap-2 text-[17px] text-lime-400 transition hover:text-lime-300">
                  <MdPhone className="text-[20px]" />
                  <span>{phone}</span>
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-2 break-all text-[17px] text-lime-400 transition hover:text-lime-300">
                  <MdEmail className="shrink-0 text-[20px]" />
                  <span>{email}</span>
                </a>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[18px] font-semibold text-white">We are on:</p>
              {socialLinks.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {socialLinks.map((item, index) => (
                    <a key={`${item.link}-${index}`} href={item.link} target="_blank" rel="noopener noreferrer" className="group flex w-full max-w-[360px] items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 transition hover:bg-white/20">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 transition group-hover:bg-lime-400">{item.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-bold text-white">{item.name}</p>
                        <p className="break-all text-[12px] leading-4 text-white/70">{item.link}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[16px] leading-7 text-white/80">Chưa có link mạng xã hội.</p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
