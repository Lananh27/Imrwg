"use client";

import { useEffect, useState } from "react";

const featuredSlides = [
  {
    id: 1,
    title: "Latest Science Team Meeting",
    subtitle:
      "Cập nhật lịch họp, thông báo mới và những nội dung quan trọng mới nhất.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    href: "/meetings",
    menuLinks: [
      { label: "Meetings", href: "/meetings" },
      { label: "About", href: "/about" },
      { label: "People", href: "/people" },
    ],
  },
  {
    id: 2,
    title: "New Publications & Reports",
    subtitle:
      "Khám phá tài liệu, báo cáo và các ấn phẩm mới được cập nhật trên hệ thống.",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80",
    href: "/projects",
    menuLinks: [
      { label: "Projects", href: "/projects" },
      { label: "Meetings", href: "/meetings" },
      { label: "About", href: "/about" },
    ],
  },
  {
    id: 3,
    title: "Upcoming Events & Activities",
    subtitle:
      "Theo dõi sự kiện mới nhất, lịch trình và các hoạt động nổi bật trong thời gian tới.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    href: "/people",
    menuLinks: [
      { label: "People", href: "/people" },
      { label: "Projects", href: "/projects" },
      { label: "Meetings", href: "/meetings" },
    ],
  },
];

export default function FeaturedSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredSlides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % featuredSlides.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) =>
      prev === 0 ? featuredSlides.length - 1 : prev - 1
    );
  };

  return (
    <div className="relative h-[420px] overflow-hidden bg-slate-900 shadow-lg lg:h-[660px]">
      {featuredSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ${
            index === activeIndex
              ? "opacity-100 scale-100"
              : "pointer-events-none opacity-0 scale-105"
          }`}
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.2)), url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex h-full flex-col justify-between p-5 lg:p-8">
            <div className="flex flex-wrap gap-2">
              {slide.menuLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white hover:text-black"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="max-w-2xl">
              <span className="mb-3 inline-block rounded-full bg-lime-400/90 px-4 py-1 text-sm font-semibold text-black">
                Mới nhất
              </span>

              <h2 className="text-3xl font-bold leading-tight text-white lg:text-5xl">
                {slide.title}
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/90 lg:text-lg">
                {slide.subtitle}
              </p>

              <a
                href={slide.href}
                className="mt-6 inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:scale-105"
              >
                Know More
              </a>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 bg-black/35 px-4 py-3 text-3xl text-white transition hover:bg-black/60"
      >
        ‹
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 bg-black/35 px-4 py-3 text-3xl text-white transition hover:bg-black/60"
      >
        ›
      </button>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {featuredSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-3 w-3 rounded-full border border-white/70 ${
              index === activeIndex ? "bg-lime-300" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}