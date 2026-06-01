"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { API_URL, getHomeContent, getMeetings } from "@/lib/api";

type Meeting = {
  id: number;
  title: string;
  summary?: string;
  location?: string;
  startDate: string;
  endDate: string;
  heroImage?: string;
  agendaFileUrl?: string;
  reportFileUrl?: string;
  photosLink?: string;
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

const demoMeetings: Meeting[] = [
  {
    id: 1,
    title:
      "Earth Observation and Geospatial Intelligence in Sustainable Development for Urban and Mekong Delta Region",
    summary:
      "This annual meeting brings together researchers, partners, and stakeholders to review ongoing work, share findings, and discuss future directions for collaborative research across the Mekong region. The event highlights recent scientific progress, regional partnerships, and new opportunities for interdisciplinary engagement.",
    location: "Ho Chi Minh City, Vietnam",
    startDate: "2026-04-20",
    endDate: "2026-04-20",
    heroImage:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop",
    agendaFileUrl: "#",
    reportFileUrl: "#",
    photosLink: "#",
  },
  {
    id: 2,
    title:
      "Training Workshop “Remote Sensing and Geospatial Intelligence for Water Resource and Ecosystem Management”",
    summary:
      "A regional workshop focused on environmental change, research synthesis, and cross-border collaboration. Participants exchange datasets, policy insights, and methodological approaches to support sustainable development planning in the Mekong subregion.",
    location: "Ho Chi Minh City, Vietnam",
    startDate: "2026-04-21",
    endDate: "2026-04-21",
    heroImage:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop",
    agendaFileUrl: "#",
    reportFileUrl: "#",
    photosLink: "#",
  },
];

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime())) return "Updating...";

  const s = start.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  const e = Number.isNaN(end.getTime())
    ? s
    : end.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });

  return `${s} to ${e}`;
}

function formatSingleDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "Updating...";

  return value.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getFileUrl(url?: string) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://") || url === "#") {
    return url;
  }

  return `${API_URL}${url}`;
}

export default function MeetingsPage() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPageData() {
      try {
        setLoading(true);

        const [homeResult, meetingsResult] = await Promise.allSettled([
  getHomeContent(),
  getMeetings(),
]);

if (homeResult.status === "fulfilled") {
  const homeRes = homeResult.value;
  const homeData = homeRes?.data || homeRes || null;
  setHome(homeData);
} else {
  setHome(null);
}

const meetingJson =
  meetingsResult.status === "fulfilled" ? meetingsResult.value : [];

const meetingsData: Meeting[] = Array.isArray(meetingJson)
  ? meetingJson
  : Array.isArray(meetingJson?.data)
  ? meetingJson.data
  : Array.isArray(meetingJson?.items)
  ? meetingJson.items
  : [];

        if (meetingsData.length > 0) {
          const sortedMeetings = [...meetingsData].sort((a, b) => {
            const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
            const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;

            return dateB - dateA;
          });

          setMeetings(sortedMeetings);
          setSelectedId(sortedMeetings[0].id);
        } else {
          setMeetings(demoMeetings);
          setSelectedId(demoMeetings[0].id);
        }
      } catch (error) {
        console.error("Lỗi lấy meetings:", error);
        setMeetings(demoMeetings);
        setSelectedId(demoMeetings[0].id);
      } finally {
        setLoading(false);
      }
    }

    fetchPageData();
  }, []);

  const selectedMeeting = useMemo(() => {
    return meetings.find((m) => m.id === selectedId) || null;
  }, [meetings, selectedId]);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="bg-[#f4f4f1]">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-[#9ab86f]" />
              <p className="text-lg text-gray-600">Loading meetings...</p>
            </div>
          </div>
        ) : !selectedMeeting ? (
          <div className="flex min-h-[60vh] items-center justify-center px-6">
            <div className="rounded-2xl border border-gray-200 bg-white px-10 py-12 text-center shadow-sm">
              <h2 className="mb-3 text-2xl font-bold text-gray-800">
                No meetings found
              </h2>
              <p className="text-gray-600">
                There is no meeting data from the backend to display yet.
              </p>
            </div>
          </div>
        ) : (
          <section className="min-h-screen bg-[#f4f4f1]">
            <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-6 md:py-10 xl:px-10">
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-[360px_minmax(0,1fr)_320px] xl:gap-10">
                <aside className="self-start xl:sticky xl:top-6">
                  <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 bg-gradient-to-r from-[#f6f8f1] to-white px-6 py-5">
                      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#89a35d]">
                        Archive
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                        Meetings
                      </h2>
                    </div>

                    <div className="max-h-[75vh] space-y-4 overflow-y-auto p-4">
                      {meetings.map((meeting) => {
                        const isActive = selectedId === meeting.id;

                        return (
                          <button
                            key={meeting.id}
                            onClick={() => setSelectedId(meeting.id)}
                            className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                              isActive
                                ? "border-[#a8c47b] bg-[#eef5e4] shadow-sm"
                                : "border-gray-200 bg-[#fafbf8] hover:border-[#c9d9ad] hover:bg-[#f2f6ec]"
                            }`}
                          >
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <h3
                                className={`text-base font-semibold leading-snug md:text-lg ${
                                  isActive
                                    ? "text-[#4f6630]"
                                    : "text-gray-900"
                                }`}
                              >
                                {meeting.title}
                              </h3>

                              {isActive ? (
                                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#9ab86f]" />
                              ) : null}
                            </div>

                            <div className="space-y-1 text-sm md:text-[15px]">
                              <p className="text-gray-600">
                                {formatDateRange(
                                  meeting.startDate,
                                  meeting.endDate
                                )}
                              </p>

                              <p className="font-medium text-[#7b9460]">
                                {meeting.location || "Updating..."}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </aside>

                <section className="min-w-0">
                  <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 pb-6 pt-8 md:px-8 md:pt-10 xl:px-10">
                      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#89a35d]">
                        Featured meeting
                      </p>

                      <h1 className="max-w-5xl text-3xl font-bold leading-tight text-gray-900 md:text-4xl xl:text-5xl">
                        {selectedMeeting.title}
                      </h1>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <span className="inline-flex items-center rounded-full bg-[#eef5e4] px-4 py-2 text-sm font-medium text-[#5d7440]">
                          {selectedMeeting.location || "Location updating"}
                        </span>

                        <span className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                          {formatDateRange(
                            selectedMeeting.startDate,
                            selectedMeeting.endDate
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="px-6 py-8 md:px-8 xl:px-10">
                      {selectedMeeting.heroImage ? (
                        <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-gray-50">
                          <img
                            src={getFileUrl(selectedMeeting.heroImage)}
                            alt={selectedMeeting.title}
                            className="max-h-[720px] w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-[420px] w-full items-center justify-center rounded-[28px] border border-dashed border-gray-300 bg-gray-50 text-lg text-gray-500">
                          No image available
                        </div>
                      )}

                      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_220px]">
                        <div>
                          <h3 className="mb-4 text-2xl font-bold text-gray-900">
                            Overview
                          </h3>

                          <div className="whitespace-pre-line text-[17px] leading-8 text-gray-700 md:text-[18px]">
                            {selectedMeeting.summary ||
                              "Summary is being updated. You can edit this content in admin."}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#e3ecd4] bg-[#f8faf4] p-5">
                          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#88a15e]">
                            Quick info
                          </p>

                          <div className="space-y-4 text-sm">
                            <div>
                              <p className="mb-1 text-gray-500">Start</p>
                              <p className="font-semibold text-gray-900">
                                {formatSingleDate(selectedMeeting.startDate)}
                              </p>
                            </div>

                            <div>
                              <p className="mb-1 text-gray-500">End</p>
                              <p className="font-semibold text-gray-900">
                                {formatSingleDate(selectedMeeting.endDate)}
                              </p>
                            </div>

                            <div>
                              <p className="mb-1 text-gray-500">Location</p>
                              <p className="font-semibold text-gray-900">
                                {selectedMeeting.location || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <aside className="self-start xl:sticky xl:top-6">
                  <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 bg-gradient-to-r from-white to-[#f6f8f1] px-6 py-5">
                      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#89a35d]">
                        Resources
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900">
                        Meeting Details
                      </h2>
                    </div>

                    <div className="space-y-6 p-6">
                      <div>
                        <p className="mb-2 text-sm uppercase tracking-[0.12em] text-gray-500">
                          Location
                        </p>

                        <p className="text-2xl font-bold leading-snug text-gray-900">
                          {selectedMeeting.location || "-"}
                        </p>
                      </div>

                      <div className="border-t border-gray-100 pt-6">
                        <p className="mb-2 text-sm uppercase tracking-[0.12em] text-gray-500">
                          Meeting Date
                        </p>

                        <p className="text-base font-medium leading-7 text-gray-800">
                          {formatDateRange(
                            selectedMeeting.startDate,
                            selectedMeeting.endDate
                          )}
                        </p>
                      </div>

                      <ResourceBlock
                        title="Agenda File"
                        emptyText="No agenda file"
                        linkText="Open Agenda PDF"
                        url={selectedMeeting.agendaFileUrl}
                      />

                      <ResourceBlock
                        title="Meeting Report"
                        emptyText="No report file"
                        linkText="Open Meeting Report"
                        url={selectedMeeting.reportFileUrl}
                      />

                      <ResourceBlock
                        title="Meeting Photos"
                        emptyText="No photo link"
                        linkText="View Meeting Photos"
                        url={selectedMeeting.photosLink}
                      />
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        )}
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

function ResourceBlock({
  title,
  emptyText,
  linkText,
  url,
}: {
  title: string;
  emptyText: string;
  linkText: string;
  url?: string;
}) {
  return (
    <div className="border-t border-gray-100 pt-6">
      <p className="mb-3 text-sm uppercase tracking-[0.12em] text-gray-500">
        {title}
      </p>

      {url ? (
        <a
          href={getFileUrl(url)}
          target="_blank"
          rel="noreferrer"
          className="block break-all rounded-2xl border border-[#d8e5c1] bg-[#f6faee] px-4 py-4 font-semibold text-[#5f7840] transition hover:bg-[#eef5e2]"
        >
          {linkText}
        </a>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-500">
          {emptyText}
        </div>
      )}
    </div>
  );
}