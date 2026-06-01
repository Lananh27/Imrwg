"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { API_URL, getHomeContent, getPeople } from "@/lib/api";

type PeopleCategory = "speakers" | "guests" | "committee";

type PersonItem = {
  id?: number;
  fullName: string;
  role?: string | null;
  institution?: string | null;
  email?: string | null;
  cvLink?: string | null;
  location?: string | null;
  avatar?: string | null;
  bio?: string | null;
  category?: PeopleCategory;

  phone?: string | null;
  website?: string | null;
  mapEmbedUrl?: string | null;
  specialties?: string[] | string | null;
  achievements?: string[] | string | null;
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

const sectionConfig: Record<
  PeopleCategory,
  {
    label: string;
    icon: string;
    description: string;
  }
> = {
  speakers: {
    label: "Speakers",
    icon: "👥",
    description: "All speakers and invited presenters in the conference.",
  },
  guests: {
    label: "Guests",
    icon: "👥",
    description: "All invited guests, representatives, and collaborators.",
  },
  committee: {
    label: "Organizing Committee",
    icon: "👤",
    description: "All organizing committee members and program coordinators.",
  },
};

function normalizePeople(data: any): PersonItem[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.people)) return data.people;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function imgUrl(url?: string | null) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

function getInitials(name?: string) {
  if (!name) return "P";

  return name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizeList(value?: string[] | string | null) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getMapUrl(person: PersonItem) {
  if (person.mapEmbedUrl) return person.mapEmbedUrl;

  if (!person.location) return "";

  return `https://www.google.com/maps?q=${encodeURIComponent(
    person.location
  )}&output=embed`;
}

function getTags(person: PersonItem) {
  const specialties = normalizeList(person.specialties);

  if (specialties.length > 0) {
    return specialties.slice(0, 4);
  }

  const tags = [person.role, person.institution, person.location].filter(
    Boolean
  ) as string[];

  return tags.slice(0, 3);
}

function getAchievements(person: PersonItem) {
  const achievements = normalizeList(person.achievements);

  if (achievements.length > 0) {
    return achievements;
  }

  const list = [];

  if (person.role) list.push(`Role: ${person.role}`);
  if (person.institution) list.push(`Affiliation: ${person.institution}`);
  if (person.location) list.push(`Based in ${person.location}`);

  return list;
}

export default function PeoplePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#eef6ff] px-6 py-20 text-center">
          <p className="text-lg font-black text-[#1d4ed8]">
            Loading people...
          </p>
        </main>
      }
    >
      <PeoplePageContent />
    </Suspense>
  );
}

function PeoplePageContent() {
  const searchParams = useSearchParams();
  const personIdFromUrl = searchParams.get("personId");
  const personNameFromUrl = searchParams.get("name");

  const [home, setHome] = useState<HomeContent | null>(null);
  const [people, setPeople] = useState<PersonItem[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<PersonItem | null>(null);
  const [viewAllCategory, setViewAllCategory] =
    useState<PeopleCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageData();
  }, []);

  async function fetchPageData() {
    try {
      setLoading(true);

      const [homeRes, peopleRes] = await Promise.all([
        getHomeContent(),
        getPeople(),
      ]);

      setHome(homeRes?.data || homeRes || null);
      setPeople(normalizePeople(peopleRes));
    } catch (error) {
      console.error("FETCH PEOPLE ERROR:", error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (people.length === 0) return;

    let foundPerson: PersonItem | undefined;

    if (personIdFromUrl) {
      foundPerson = people.find(
        (person) => String(person.id) === String(personIdFromUrl)
      );
    }

    if (!foundPerson && personNameFromUrl) {
      foundPerson = people.find(
        (person) =>
          person.fullName.toLowerCase().trim() ===
          personNameFromUrl.toLowerCase().trim()
      );
    }

    if (foundPerson) {
      setSelectedPerson(foundPerson);
    }
  }, [personIdFromUrl, personNameFromUrl, people]);

  const groupedPeople = useMemo(() => {
    return {
      speakers: people.filter((item) => item.category === "speakers"),
      guests: people.filter((item) => item.category === "guests"),
      committee: people.filter((item) => item.category === "committee"),
    };
  }, [people]);

  const viewAllPeople = viewAllCategory ? groupedPeople[viewAllCategory] : [];

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#eef6ff] text-black">
        <section className="px-6 py-10">
          <Container>
            <div className="mb-10">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#1d4ed8]">
                People
              </p>

              <h1 className="mt-3 text-5xl font-black leading-tight text-black">
                Conference People
              </h1>

              <p className="mt-4 max-w-3xl text-lg font-medium leading-8 text-black">
                Explore speakers, invited guests, and the organizing committee.
                Click any person to view their full profile.
              </p>
            </div>

            {loading ? (
              <div className="rounded-[24px] bg-white p-10 font-semibold text-black shadow-sm">
                Loading people...
              </div>
            ) : (
              <div className="space-y-10">
                <PeopleSection
                  category="speakers"
                  people={groupedPeople.speakers}
                  onSelect={setSelectedPerson}
                  onViewAll={() => setViewAllCategory("speakers")}
                />

                <PeopleSection
                  category="guests"
                  people={groupedPeople.guests}
                  onSelect={setSelectedPerson}
                  onViewAll={() => setViewAllCategory("guests")}
                />

                <PeopleSection
                  category="committee"
                  people={groupedPeople.committee}
                  onSelect={setSelectedPerson}
                  onViewAll={() => setViewAllCategory("committee")}
                />

                <CommitteeStructure />
              </div>
            )}
          </Container>
        </section>
      </main>

      {viewAllCategory ? (
        <ViewAllPeopleModal
          category={viewAllCategory}
          people={viewAllPeople}
          onClose={() => setViewAllCategory(null)}
          onSelectPerson={(person) => {
            setViewAllCategory(null);
            setSelectedPerson(person);
          }}
        />
      ) : null}

      {selectedPerson ? (
        <PersonProfileModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      ) : null}

      <Footer
        footerLogo={home?.footerLogo}
        footerMailingText={home?.footerMailingText}
        footerContactText={home?.footerContactText}
        footerSocialText={home?.footerSocialText}
      />
    </>
  );
}

function PeopleSection({
  category,
  people,
  onSelect,
  onViewAll,
}: {
  category: PeopleCategory;
  people: PersonItem[];
  onSelect: (person: PersonItem) => void;
  onViewAll: () => void;
}) {
  const config = sectionConfig[category];
  const scrollRef = useRef<HTMLDivElement | null>(null);

  function scrollLeft() {
    scrollRef.current?.scrollBy({
      left: -440,
      behavior: "smooth",
    });
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({
      left: 440,
      behavior: "smooth",
    });
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-[30px] font-black text-black">
          <span className="text-2xl">{config.icon}</span>
          {config.label}
        </h2>

        <div className="flex items-center gap-2">
          {people.length > 3 ? (
            <>
              <button
                type="button"
                onClick={scrollLeft}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black bg-white text-xl font-black text-black transition hover:bg-[#dbeafe]"
                aria-label="Scroll left"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={scrollRight}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black bg-white text-xl font-black text-black transition hover:bg-[#dbeafe]"
                aria-label="Scroll right"
              >
                ›
              </button>
            </>
          ) : null}

          {people.length > 0 ? (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-2 text-base font-black text-black transition hover:text-[#1d4ed8]"
            >
              View all <span>→</span>
            </button>
          ) : null}
        </div>
      </div>

      {people.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#9fb7d3] bg-white p-8 text-center font-semibold text-black">
          No data yet.
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-4 [scrollbar-width:thin]"
        >
          <div className="flex w-max gap-5">
            {people.map((person, index) => (
              <PersonMiniCard
                key={person.id || `${person.fullName}-${index}`}
                person={person}
                onClick={() => onSelect(person)}
                active={index === 0 && category === "speakers"}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PersonMiniCard({
  person,
  onClick,
  active,
}: {
  person: PersonItem;
  onClick: () => void;
  active?: boolean;
}) {
  const tags = getTags(person);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group h-[190px] w-[430px] shrink-0 rounded-2xl border bg-white p-4 text-left shadow-[0_8px_24px_rgba(15,60,120,0.08)] transition hover:-translate-y-1 hover:border-[#1d4ed8] hover:shadow-[0_14px_34px_rgba(15,60,120,0.14)] ${
        active ? "border-[#1d4ed8] ring-2 ring-blue-100" : "border-[#d8e2ef]"
      }`}
    >
      <div className="flex h-full gap-4">
        {person.avatar ? (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-4 ring-[#eef6ff]">
            <img
              src={imgUrl(person.avatar)}
              alt={person.fullName}
              className="h-[72px] w-[72px] rounded-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-xl font-black text-black">
            {getInitials(person.fullName)}
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="line-clamp-2 min-h-[48px] text-base font-black text-black">
            {person.fullName}
          </h3>

          <p className="mt-1 line-clamp-1 min-h-[22px] text-sm font-bold text-black">
            {person.role || ""}
          </p>

          <p className="mt-1 line-clamp-1 min-h-[22px] text-sm font-medium text-black">
            {person.institution || ""}
          </p>

          <div className="mt-auto flex flex-wrap gap-2">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="max-w-[140px] truncate rounded-full bg-[#eef6ff] px-2.5 py-1 text-[11px] font-black text-black"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

function ViewAllPeopleModal({
  category,
  people,
  onClose,
  onSelectPerson,
}: {
  category: PeopleCategory;
  people: PersonItem[];
  onClose: () => void;
  onSelectPerson: (person: PersonItem) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const config = sectionConfig[category];

  const filteredPeople = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    if (!text) return people;

    return people.filter((person) => {
      return (
        person.fullName?.toLowerCase().includes(text) ||
        (person.role || "").toLowerCase().includes(text) ||
        (person.institution || "").toLowerCase().includes(text) ||
        (person.location || "").toLowerCase().includes(text) ||
        (person.bio || "").toLowerCase().includes(text)
      );
    });
  }, [keyword, people]);

  return (
    <div className="fixed inset-0 z-[998] overflow-y-auto bg-black/35 px-4 py-8">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[32px] border border-[#d8e6f7] bg-white shadow-2xl">
        <div className="border-b border-[#d8e6f7] bg-white px-6 py-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-black">
                People Directory
              </p>

              <h2 className="mt-3 flex items-center gap-3 text-4xl font-black text-black">
                <span>{config.icon}</span>
                All {config.label}
              </h2>

              <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-black">
                {config.description} Click any person to view full profile.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black bg-white text-2xl font-black text-black transition hover:bg-[#f3f4f6]"
            >
              ×
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_140px] md:items-center">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by name, role, institution, location..."
              className="w-full rounded-2xl border border-black bg-white px-5 py-4 text-lg font-medium text-black outline-none transition focus:border-[#1d4ed8]"
            />

            <div className="rounded-2xl bg-[#eef6ff] px-5 py-4 text-center text-base font-black text-black">
              {filteredPeople.length} person
              {filteredPeople.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="max-h-[68vh] overflow-y-auto bg-white p-6">
          {filteredPeople.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c9d9ee] bg-white p-12 text-center">
              <h3 className="text-2xl font-black text-black">
                No people found
              </h3>
              <p className="mt-3 font-medium text-black">
                Try another keyword.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredPeople.map((person, index) => (
                <PersonFullCard
                  key={person.id || `${person.fullName}-${index}`}
                  person={person}
                  onClick={() => onSelectPerson(person)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonFullCard({
  person,
  onClick,
}: {
  person: PersonItem;
  onClick: () => void;
}) {
  const tags = getTags(person);

  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[260px] rounded-[24px] border border-[#d8e6f7] bg-white p-5 text-left shadow-[0_8px_24px_rgba(15,60,120,0.08)] transition hover:-translate-y-1 hover:border-[#1d4ed8] hover:shadow-[0_14px_34px_rgba(15,60,120,0.14)]"
    >
      <div className="flex gap-4">
        {person.avatar ? (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-4 ring-[#eef6ff]">
            <img
              src={imgUrl(person.avatar)}
              alt={person.fullName}
              className="h-[72px] w-[72px] rounded-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-xl font-black text-black">
            {getInitials(person.fullName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 min-h-[56px] text-lg font-black text-black">
            {person.fullName}
          </h3>

          <p className="mt-1 line-clamp-1 text-sm font-bold text-black">
            {person.role || ""}
          </p>

          <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-black">
            {person.institution || ""}
          </p>

          {person.location ? (
            <p className="mt-1 line-clamp-1 text-sm font-semibold text-black">
              📍 {person.location}
            </p>
          ) : null}
        </div>
      </div>

      {person.bio ? (
        <p className="mt-4 line-clamp-3 text-sm font-medium leading-6 text-black">
          {person.bio}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="max-w-[140px] truncate rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-black text-black"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

function CommitteeStructure() {
  const items = [
    {
      title: "Conference Chair",
      text: "Overall leadership and strategic direction",
      icon: "👤",
    },
    {
      title: "Program Committee",
      text: "Curates sessions and scientific content",
      icon: "🔬",
    },
    {
      title: "Logistics & Operations",
      text: "Manages venues, travel and on-site experience",
      icon: "🧭",
    },
    {
      title: "Publications",
      text: "Oversees proceedings and academic output",
      icon: "📋",
    },
    {
      title: "Communications",
      text: "Handles outreach, media and public engagement",
      icon: "💬",
    },
    {
      title: "Finance & Sponsorship",
      text: "Manages budget and partnerships",
      icon: "👥",
    },
  ];

  return (
    <section className="rounded-[24px] border border-blue-100 bg-white/80 p-5 shadow-[0_8px_24px_rgba(15,60,120,0.08)]">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="flex items-center gap-3 text-2xl font-black text-black">
          <span>👥</span>
          Committee Structure & Responsibilities
        </h2>

        <span className="text-sm font-bold text-black">
          Learn more about how we organize the conference →
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 text-2xl">{item.icon}</div>
            <h3 className="text-sm font-black text-black">{item.title}</h3>
            <p className="mt-2 text-xs font-medium leading-5 text-black">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PersonProfileModal({
  person,
  onClose,
}: {
  person: PersonItem;
  onClose: () => void;
}) {
  const tags = getTags(person);
  const achievements = getAchievements(person);
  const mapUrl = getMapUrl(person);

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/50 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="relative p-6 md:p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-black bg-white text-xl font-black text-black hover:bg-[#f3f4f6]"
          >
            ×
          </button>

          <div className="grid gap-7 md:grid-cols-[220px_minmax(0,1fr)]">
            <div>
              {person.avatar ? (
                <div className="flex h-56 w-56 items-center justify-center overflow-hidden rounded-full bg-white ring-8 ring-[#e5edff]">
                  <img
                    src={imgUrl(person.avatar)}
                    alt={person.fullName}
                    className="h-[205px] w-[205px] rounded-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-56 w-56 items-center justify-center rounded-full bg-[#e5edff] text-5xl font-black text-black ring-8 ring-[#e5edff]">
                  {getInitials(person.fullName)}
                </div>
              )}
            </div>

            <div className="pr-8">
              <span className="inline-flex rounded-full border border-black bg-[#dbeafe] px-4 py-2 text-sm font-black text-black">
                {person.category === "guests"
                  ? "Guest"
                  : person.category === "committee"
                  ? "Committee"
                  : "Speaker"}
              </span>

              <h2 className="mt-4 text-4xl font-black leading-tight text-black">
                {person.fullName}
              </h2>

              {person.role ? (
                <p className="mt-2 text-lg font-black text-black">
                  {person.role}
                </p>
              ) : null}

              {person.institution ? (
                <p className="mt-1 text-lg font-bold text-black">
                  {person.institution}
                </p>
              ) : null}

              <div className="mt-5 space-y-2 text-sm font-semibold text-black">
                {person.email ? <p>✉️ {person.email}</p> : null}
                {person.location ? <p>📍 {person.location}</p> : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black bg-[#f3f4f6] px-4 py-2 text-sm font-black text-black"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-lg font-black text-black">About</h3>
            <p className="whitespace-pre-line text-base font-medium leading-8 text-black">
              {person.bio || "Profile information is being updated."}
            </p>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-lg font-black text-black">
              Achievements
            </h3>

            <ul className="space-y-2">
              {achievements.map((item, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-sm font-semibold leading-6 text-black"
                >
                  <span>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
            <div className="rounded-2xl border border-[#bfc9d8] bg-white p-5 shadow-sm">
              <h3 className="mb-5 text-lg font-black text-black">Contact</h3>

              <div className="space-y-4 text-sm font-semibold text-black">
                {person.email ? (
                  <p className="break-all">✉️ {person.email}</p>
                ) : null}
                {person.phone ? <p>📞 {person.phone}</p> : null}
                {person.location ? <p>📍 {person.location}</p> : null}
              </div>

              {person.cvLink ? (
                <a
                  href={person.cvLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 flex w-full items-center justify-center rounded-xl border border-black bg-[#dbeafe] px-4 py-3 text-sm font-black text-black hover:bg-[#bfdbfe]"
                >
                  View Full Profile ↗
                </a>
              ) : person.email ? (
                <a
                  href={`mailto:${person.email}`}
                  className="mt-6 flex w-full items-center justify-center rounded-xl border border-black bg-[#dbeafe] px-4 py-3 text-sm font-black text-black hover:bg-[#bfdbfe]"
                >
                  Contact by Email
                </a>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[#bfc9d8] bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-black text-black">Location</h3>

              {mapUrl ? (
                <div className="overflow-hidden rounded-2xl border border-[#bfc9d8]">
                  <iframe
                    src={mapUrl}
                    title={`${person.fullName} location`}
                    className="h-[230px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : (
                <div className="flex h-[230px] items-center justify-center rounded-2xl bg-[#f3f4f6] font-semibold text-black">
                  No location map
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}