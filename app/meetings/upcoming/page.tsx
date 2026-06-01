"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getHomeContent } from "@/lib/api";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://backend-roym.onrender.com"
).replace(/\/$/, "");

type HomeContent = {
  siteName?: string;
  headerLogo?: string;
  partnerLogos?: string[] | null;
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;
};

type Meeting = {
  id?: string | number;
  _id?: string | number;
  title: string;
  summary?: string;
  description?: string;
  location?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  heroImage?: string;
  image?: string;
  registrationOpen?: boolean;
  type?: "past" | "upcoming";
  status?: string;
};

function normalizeHome(data: any): HomeContent | null {
  if (data?.data) return data.data;
  if (data) return data;
  return null;
}

function normalizeMeetingList(data: any): Meeting[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.meetings)) return data.meetings;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

function getMeetingId(meeting: Meeting) {
  return String(meeting.id || meeting._id || "");
}

function getMeetingDate(meeting: Meeting) {
  return meeting.startDate || meeting.date || meeting.endDate || "";
}

function getMeetingImage(meeting: Meeting) {
  const image = meeting.heroImage || meeting.image || "";

  if (!image) return "";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/images")) return image;

  return `${API_URL}${image.startsWith("/") ? image : `/${image}`}`;
}

function isUpcomingMeeting(meeting: Meeting) {
  if (meeting.type === "upcoming") return true;
  if (meeting.type === "past") return false;

  const dateValue = getMeetingDate(meeting);
  if (!dateValue) return true;

  const meetingTime = new Date(dateValue).getTime();
  if (Number.isNaN(meetingTime)) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return meetingTime >= today.getTime();
}

export default function UpcomingMeetingsPage() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);

        const [homeRes, meetingsRes] = await Promise.all([
          getHomeContent(),
          fetch(`${API_URL}/api/meetings?type=upcoming`, {
            cache: "no-store",
          }).then((res) => res.json()),
        ]);

        const homeData = normalizeHome(homeRes);

        const meetingList = normalizeMeetingList(meetingsRes)
          .filter(isUpcomingMeeting)
          .sort((a, b) => {
            const dateA = new Date(getMeetingDate(a) || "1970-01-01").getTime();
            const dateB = new Date(getMeetingDate(b) || "1970-01-01").getTime();
            return dateA - dateB;
          });

        setHome(homeData);
        setMeetings(meetingList);

        console.log("UPCOMING HOME DATA:", homeRes);
        console.log("UPCOMING MEETINGS DATA:", meetingsRes);
      } catch (error) {
        console.error("Failed to fetch upcoming meetings:", error);
        setHome(null);
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, []);

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-white text-slate-900">
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-sky-600">
                  Meetings
                </p>

                <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                  Upcoming Meetings
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                  Stay updated with upcoming conferences, workshops, and
                  scientific meetings. Browse upcoming events and register when
                  registration is open.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/meetings/registration"
                    className="rounded-full bg-sky-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-sky-700"
                  >
                    Register Now
                  </Link>

                  <Link
                    href="/meetings/past"
                    className="rounded-full border border-slate-300 bg-white px-7 py-3 font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                  >
                    View Past Meetings
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-sky-100 bg-sky-50 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                  Quick Info
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                      Event Updates
                    </p>
                    <p className="mt-1 font-bold text-slate-900">
                      Latest schedules and announcements
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                      Registration
                    </p>
                    <p className="mt-1 font-bold text-slate-900">
                      Open for selected upcoming meetings
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                      Participants
                    </p>
                    <p className="mt-1 font-bold text-slate-900">
                      Researchers, speakers, and students
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
                  Event List
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-950">
                  All upcoming meetings
                </h2>
              </div>

              <div className="w-fit rounded-full bg-sky-50 px-5 py-2 text-sm font-semibold text-sky-700 ring-1 ring-sky-100">
                {loading ? "Loading..." : `${meetings.length} meeting(s)`}
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <p className="text-slate-500">Loading meetings...</p>
              </div>
            ) : meetings.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-2xl">
                  📅
                </div>

                <h3 className="text-3xl font-bold text-slate-950">
                  No upcoming meetings yet
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-slate-500">
                  Upcoming meetings will be announced soon. You can view past
                  meetings or check the registration page later.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link
                    href="/meetings/past"
                    className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                  >
                    View Past Meetings
                  </Link>

                  <Link
                    href="/meetings/registration"
                    className="rounded-full bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700"
                  >
                    Go to Registration
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {meetings.map((meeting) => {
                  const meetingId = getMeetingId(meeting);
                  const meetingDate = getMeetingDate(meeting);
                  const meetingImage = getMeetingImage(meeting);

                  return (
                    <article
                      key={meetingId}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="grid md:grid-cols-5">
                        <div className="h-56 bg-slate-100 md:col-span-2 md:h-full">
                          {meetingImage ? (
                            <img
                              src={meetingImage}
                              alt={meeting.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-sky-50 text-sm font-semibold text-sky-500">
                              Meeting Image
                            </div>
                          )}
                        </div>

                        <div className="p-6 md:col-span-3">
                          <div className="mb-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-700">
                              Upcoming
                            </span>

                            {meeting.registrationOpen ? (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                                Registration Open
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                                Coming Soon
                              </span>
                            )}
                          </div>

                          <h3 className="text-2xl font-bold text-slate-950">
                            {meeting.title}
                          </h3>

                          <div className="mt-4 space-y-2 text-sm text-slate-600">
                            <p>
                              <span className="font-semibold text-slate-800">
                                Date:
                              </span>{" "}
                              {meetingDate
                                ? new Date(meetingDate).toLocaleDateString(
                                    "en-US"
                                  )
                                : "Updating"}
                            </p>

                            {meeting.time && (
                              <p>
                                <span className="font-semibold text-slate-800">
                                  Time:
                                </span>{" "}
                                {meeting.time}
                              </p>
                            )}

                            <p>
                              <span className="font-semibold text-slate-800">
                                Location:
                              </span>{" "}
                              {meeting.location || "Updating"}
                            </p>
                          </div>

                          {(meeting.description || meeting.summary) && (
                            <p className="mt-4 line-clamp-3 text-slate-600">
                              {meeting.description || meeting.summary}
                            </p>
                          )}

                          <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                              href={`/meetings/registration?meetingId=${meetingId}`}
                              className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                            >
                              Register Now
                            </Link>

                            <Link
                              href="/meetings/past"
                              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                            >
                              Browse Past
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
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