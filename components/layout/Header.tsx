"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Container from "./Container";
import { usePathname, useRouter } from "next/navigation";
import { FaMagnifyingGlass } from "react-icons/fa6";

type HeaderProps = {
  siteName?: string;
  headerLogo?: string;
  partnerLogos?: string[] | null;
  backgroundImage?: string;
};

type NavItem = {
  label: string;
  href?: string;
  children?: NavItem[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787";

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About us",
    href: "/about",
    children: [
      { label: "About IMRWG", href: "/about" },
      { label: "Partenaires", href: "/about/partenaires" },
      { label: "Contact", href: "/about/contact" },
    ],
  },
  {
    label: "Meetings",
    href: "/meetings/past",
    children: [
      { label: "Past Meetings", href: "/meetings/past" },
      { label: "Upcoming Meetings", href: "/meetings/upcoming" },
      { label: "Registration", href: "/meetings/registration" },
    ],
  },
  { label: "People", href: "/people" },
  { label: "Projects", href: "/projects" },
  { label: "Maps", href: "/maps" },
  {
    label: "Data",
    children: [
      { label: "Conference data", href: "/data/conference-data" },
      { label: "Data download", href: "/data/data-download" },
    ],
  },
  {
    label: "Documents",
    href: "/documents",
    children: [
      { label: "Articles", href: "/documents" },
      { label: "Library", href: "/documents/library" },
    ],
  },
  { label: "Education", href: "/education" },
];

export default function Header({
  siteName,
  headerLogo,
  partnerLogos = [],
  backgroundImage = "/images/background.png",
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenu, setMobileMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const safePartnerLogos = Array.isArray(partnerLogos) ? partnerLogos : [];

  const imgUrl = (url?: string) => {
    if (!url) return "";
    return url.startsWith("http") || url.startsWith("/") ? url : `${API_URL}${url}`;
  };

  const headerBackground = imgUrl(backgroundImage) || "/images/background.png";

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const keyword = searchValue.trim();
    if (!keyword) return;

    setMobileOpen(false);
    setMobileMenu(null);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  }

  return (
    <header
      className="py-6 text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(2,20,52,0.36), rgba(2,20,52,0.36)), url('${headerBackground}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            {headerLogo ? (
              <div className="flex h-[92px] w-[92px] shrink-0 items-center justify-center bg-white/10 p-2">
                <img src={imgUrl(headerLogo)} alt="Main logo" className="max-h-full w-auto object-contain" />
              </div>
            ) : (
              <div className="h-[92px] w-[92px] shrink-0 border-2 border-cyan-400" />
            )}

            <div className="flex min-w-0 flex-1 items-start gap-3">
              <h1 className="max-w-[430px] text-[24px] font-semibold leading-tight xl:text-[28px]">
                {siteName || "International Mekong Research Working Group (IMRWG)"}
              </h1>

              <div className="hidden shrink-0 items-start gap-2 md:flex">
                {safePartnerLogos.length > 0 ? (
                  safePartnerLogos.slice(0, 4).map((logo, index) => (
                    <div key={index} className="flex h-[65px] w-[65px] items-center justify-center bg-white p-1 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <img src={imgUrl(logo)} alt={`Sub logo ${index + 1}`} className="max-h-full w-auto object-contain" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="h-[65px] w-[65px] bg-white" />
                    <div className="h-[65px] w-[65px] bg-white" />
                    <div className="h-[65px] w-[65px] bg-white" />
                    <div className="h-[65px] w-[65px] bg-white" />
                  </>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="w-full shrink-0 xl:ml-auto xl:flex xl:w-[300px] xl:justify-end">
            <div className="flex h-[42px] w-full items-center overflow-hidden rounded-full bg-white/95 text-[15px] text-gray-700 shadow-md transition duration-300 focus-within:ring-2 focus-within:ring-lime-300 xl:w-[270px]">
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent px-5 outline-none placeholder:text-gray-500"
                aria-label="Search website"
              />
              <button type="submit" className="flex h-full w-12 items-center justify-center text-[#0b3f75] transition hover:bg-lime-100" aria-label="Submit search">
                <FaMagnifyingGlass className="text-[15px]" />
              </button>
            </div>
          </form>

          <button type="button" onClick={() => setMobileOpen((prev) => !prev)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 transition duration-300 hover:bg-white/10 xl:hidden" aria-label="Toggle menu">
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>

        <nav
  className={`mt-6 ${
    mobileOpen ? "flex" : "hidden"
  } flex-col gap-3 xl:flex xl:flex-row xl:flex-wrap xl:items-center xl:justify-end xl:gap-3 xl:text-[17px] xl:font-medium`}
>
  {navItems.map((item) => {
    const hasChildren = Boolean(item.children?.length);
    const isMobileOpen = mobileMenu === item.label;

    const isActive = item.href
      ? item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
      : item.children?.some(
          (child) =>
            pathname === child.href || pathname.startsWith(`${child.href}/`)
        );

    const closeMenu = () => {
      setMobileOpen(false);
      setMobileMenu(null);
    };

    return (
      <div key={item.label} className="group relative">
        <div
          className={`relative flex items-center gap-1 rounded-full px-3.5 py-2 transition-colors duration-200 ${
            isActive
              ? "bg-[#9ac06f] text-black shadow-[0_8px_22px_rgba(154,192,111,0.35)]"
              : "text-white hover:bg-white/10 hover:text-lime-200"
          }`}
        >
          {item.href ? (
            <Link href={item.href} onClick={closeMenu} className="relative z-10">
              {item.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() =>
                setMobileMenu((prev) => (prev === item.label ? null : item.label))
              }
              className="relative z-10"
            >
              {item.label}
            </button>
          )}

          {hasChildren ? (
            <button
              type="button"
              onClick={() =>
                setMobileMenu((prev) => (prev === item.label ? null : item.label))
              }
              className={`relative z-10 text-xs transition duration-200 xl:pointer-events-none ${
                isMobileOpen ? "rotate-180" : ""
              }`}
              aria-label={`Toggle ${item.label} menu`}
            >
              ▼
            </button>
          ) : null}
        </div>

        {hasChildren ? (
          <div
            className={`pt-2 xl:absolute xl:right-0 xl:top-full xl:z-50 xl:min-w-[250px] xl:hidden xl:group-hover:block ${
              isMobileOpen ? "block" : "hidden"
            }`}
          >
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl">
              {(item.children ?? []).map((child) => {
                const childActive =
                  pathname === child.href ||
                  pathname.startsWith(`${child.href}/`);

                return (
                  <Link
                    key={child.label}
                    href={child.href || "#"}
                    onClick={closeMenu}
                    className={`block border-b border-white/10 px-5 py-3 text-[15px] font-semibold transition-colors duration-200 last:border-b-0 ${
                      childActive
                        ? "bg-[#9ac06f] text-black"
                        : "text-white hover:bg-[#9ac06f] hover:text-black"
                    }`}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  })}
</nav>
      </Container>
    </header>
  );
}
