"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  location?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  type?: string;
  status?: string;
};

function getMeetingId(meeting: Meeting) {
  return String(meeting.id || meeting._id || "");
}

function getMeetingDate(meeting: Meeting) {
  return meeting.startDate || meeting.date || meeting.endDate || "";
}

function normalizeMeetingList(data: any): Meeting[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.meetings)) return data.meetings;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

function normalizeHome(data: any): HomeContent | null {
  if (data?.data) return data.data;
  if (data) return data;
  return null;
}

function isUpcomingMeeting(meeting: Meeting) {
  const dateValue = getMeetingDate(meeting);

  if (!dateValue) return true;

  const meetingTime = new Date(dateValue).getTime();

  if (Number.isNaN(meetingTime)) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return meetingTime >= today.getTime();
}

function RegistrationForm() {
  const searchParams = useSearchParams();
  const meetingIdFromUrl = searchParams.get("meetingId") || "";

  const [home, setHome] = useState<HomeContent | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    position: "",
    meetingId: meetingIdFromUrl,
    note: "",
  });

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoadingMeetings(true);

        const [homeRes, meetingsRes] = await Promise.all([
          getHomeContent(),
          fetch(`${API_URL}/api/meetings`, {
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

        if (meetingIdFromUrl) {
          setForm((prev) => ({
            ...prev,
            meetingId: meetingIdFromUrl,
          }));
        } else if (meetingList.length > 0) {
          setForm((prev) => ({
            ...prev,
            meetingId: getMeetingId(meetingList[0]),
          }));
        }

        console.log("REGISTRATION HOME DATA:", homeRes);
        console.log("REGISTRATION MEETINGS DATA:", meetingsRes);
      } catch (error) {
        console.error("Failed to fetch registration page data:", error);
        setHome(null);
        setMeetings([]);
      } finally {
        setLoadingMeetings(false);
      }
    };

    fetchPageData();
  }, [meetingIdFromUrl]);

  const selectedMeeting = useMemo(() => {
    if (!Array.isArray(meetings)) return undefined;

    return meetings.find((item) => getMeetingId(item) === form.meetingId);
  }, [meetings, form.meetingId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setSuccess(false);

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      phone: "",
      organization: "",
      position: "",
      meetingId: meetingIdFromUrl || getMeetingId(meetings[0] || {}),
      note: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.meetingId) {
      alert("Please select a meeting.");
      return;
    }

    setSubmitting(true);
    setSuccess(false);

    try {
      const meeting = meetings.find(
        (item) => getMeetingId(item) === form.meetingId
      );

      const res = await fetch(`${API_URL}/api/registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          organization: form.organization,
          position: form.position,
          meetingId: form.meetingId,
          meetingTitle: meeting?.title || selectedMeeting?.title || "",
          note: form.note,
        }),
      });

      if (!res.ok) {
        throw new Error("Submit failed");
      }

      setSuccess(true);
      resetForm();
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="bg-white text-slate-900">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
              Registration
            </p>

            <div className="mt-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
                Register to Attend
              </h1>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Complete the registration form below to join an upcoming
                meeting, workshop, or conference.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Registration Form
                  </h2>

                  <p className="mt-2 text-slate-500">
                    Please fill in your information accurately so the organizing
                    committee can contact you.
                  </p>
                </div>

                {success && (
                  <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                    Your registration has been submitted successfully.
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="grid gap-5 md:grid-cols-2"
                >
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Full name
                    </label>

                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email
                    </label>

                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Phone
                    </label>

                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Organization / University
                    </label>

                    <input
                      name="organization"
                      value={form.organization}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
                      placeholder="Enter your organization"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Position / Role
                    </label>

                    <input
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
                      placeholder="Student, Lecturer, Researcher..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Select meeting
                    </label>

                    <select
                      name="meetingId"
                      value={form.meetingId}
                      onChange={handleChange}
                      required
                      disabled={loadingMeetings || meetings.length === 0}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {loadingMeetings ? (
                        <option value="">Loading meetings...</option>
                      ) : meetings.length === 0 ? (
                        <option value="">No upcoming meeting</option>
                      ) : (
                        meetings.map((meeting) => (
                          <option
                            key={getMeetingId(meeting)}
                            value={getMeetingId(meeting)}
                          >
                            {meeting.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Note
                    </label>

                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      rows={5}
                      className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
                      placeholder="Write your note if needed..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={
                        submitting || loadingMeetings || meetings.length === 0
                      }
                      className="rounded-full bg-emerald-600 px-8 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {submitting ? "Submitting..." : "Submit Registration"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-6">
                <aside className="rounded-3xl bg-gradient-to-br from-emerald-600 to-blue-700 p-8 text-white shadow-sm">
                  <h3 className="text-2xl font-bold">Meeting Information</h3>

                  {selectedMeeting ? (
                    <div className="mt-6 space-y-5">
                      <div>
                        <p className="text-sm font-medium text-white/70">
                          Selected Meeting
                        </p>

                        <p className="mt-1 text-lg font-semibold">
                          {selectedMeeting.title}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white/70">
                          Date
                        </p>

                        <p className="mt-1">
                          {getMeetingDate(selectedMeeting)
                            ? new Date(
                                getMeetingDate(selectedMeeting)
                              ).toLocaleDateString("en-US")
                            : "Updating"}
                        </p>
                      </div>

                      {selectedMeeting.time && (
                        <div>
                          <p className="text-sm font-medium text-white/70">
                            Time
                          </p>

                          <p className="mt-1">{selectedMeeting.time}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-white/70">
                          Location
                        </p>

                        <p className="mt-1">
                          {selectedMeeting.location || "Updating"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-6 text-white/80">
                      Please select a meeting to view the information.
                    </p>
                  )}
                </aside>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900">
                    Registration Notes
                  </h4>

                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <li>• Please use a valid email address.</li>
                    <li>• Your registration will be reviewed by the admin.</li>
                    <li>• You can only register for upcoming meetings.</li>
                    <li>
                      • The selected meeting will appear on the right panel.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
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

export default function RegistrationPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <RegistrationForm />
    </Suspense>
  );
}