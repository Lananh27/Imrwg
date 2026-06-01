"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type MeetingType = "past" | "upcoming";
type AdminTab = "past" | "upcoming" | "registrations";
type MeetingStatus = "draft" | "published";
type RegistrationStatus = "pending" | "approved" | "rejected";

type Meeting = {
  id: number;
  title: string;
  location?: string | null;
  startDate: string;
  endDate: string;
  time?: string | null;
  summary?: string | null;
  heroImage?: string | null;
  type: MeetingType;
  status: MeetingStatus;
  registrationOpen: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type MeetingForm = {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  time: string;
  summary: string;
  heroImage: string;
  status: MeetingStatus;
  registrationOpen: boolean;
};

type Registration = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  position?: string | null;
  meetingId: number;
  meetingTitle: string;
  note?: string | null;
  status: RegistrationStatus;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-roym.onrender.com";
const UPLOAD_ENDPOINT = `${API_URL}/api/upload`;

const emptyMeetingForm: MeetingForm = {
  title: "",
  location: "",
  startDate: "",
  endDate: "",
  time: "",
  summary: "",
  heroImage: "",
  status: "published",
  registrationOpen: false,
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}

function normalizeMeetingList(data: any): Meeting[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.meetings)) return data.meetings;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function normalizeRegistrationList(data: any): Registration[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.registrations)) return data.registrations;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getUploadedImageUrl(data: any): string {
  return (
    data?.url ||
    data?.imageUrl ||
    data?.fileUrl ||
    data?.Location ||
    data?.location ||
    data?.data?.url ||
    data?.data?.imageUrl ||
    data?.data?.fileUrl ||
    ""
  );
}

function formatDateForInput(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
}

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US");
}

function formatDateTime(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString();
}

function buildDateFromInput(value: string) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toISOString();
}

export default function AdminMeetingsPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("past");

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingForm, setMeetingForm] =
    useState<MeetingForm>(emptyMeetingForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [meetingLoading, setMeetingLoading] = useState(true);
  const [meetingSaving, setMeetingSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [meetingSearch, setMeetingSearch] = useState("");
  const [meetingStatusFilter, setMeetingStatusFilter] = useState("");

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationLoading, setRegistrationLoading] = useState(true);
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("");

  const currentMeetingType: MeetingType =
    activeTab === "upcoming" ? "upcoming" : "past";

  async function fetchMeetings(type: MeetingType = currentMeetingType) {
    try {
      setMeetingLoading(true);

      const res = await fetch(
        `${API_URL}/api/meetings?admin=true&type=${type}`,
        {
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Không lấy được danh sách meetings");
      }

      const list = normalizeMeetingList(data);

      setMeetings(list);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
      setMeetings([]);
    } finally {
      setMeetingLoading(false);
    }
  }

  async function fetchRegistrations() {
    try {
      setRegistrationLoading(true);

      const params = new URLSearchParams();

      if (registrationSearch) params.append("search", registrationSearch);
      if (registrationStatus) params.append("status", registrationStatus);

      const res = await fetch(
        `${API_URL}/api/registrations?${params.toString()}`,
        {
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Không lấy được registrations");
      }

      const list = normalizeRegistrationList(data);

      setRegistrations(list);
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      setRegistrations([]);
    } finally {
      setRegistrationLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "past" || activeTab === "upcoming") {
      fetchMeetings(currentMeetingType);
    }

    if (activeTab === "registrations") {
      fetchRegistrations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const keyword = meetingSearch.toLowerCase();

      const matchSearch =
        meeting.title.toLowerCase().includes(keyword) ||
        (meeting.location || "").toLowerCase().includes(keyword) ||
        (meeting.summary || "").toLowerCase().includes(keyword);

      const matchStatus = meetingStatusFilter
        ? meeting.status === meetingStatusFilter
        : true;

      return matchSearch && matchStatus;
    });
  }, [meetings, meetingSearch, meetingStatusFilter]);

  const filteredRegistrations = useMemo(() => {
    return Array.isArray(registrations) ? registrations : [];
  }, [registrations]);

  function resetMeetingForm() {
    setMeetingForm({
      ...emptyMeetingForm,
      registrationOpen: activeTab === "upcoming",
    });
    setEditingId(null);
  }

  function handleTabChange(tab: AdminTab) {
    setActiveTab(tab);
    setEditingId(null);
    setMeetingSearch("");
    setMeetingStatusFilter("");

    if (tab === "past" || tab === "upcoming") {
      setMeetingForm({
        ...emptyMeetingForm,
        registrationOpen: tab === "upcoming",
      });
    }
  }

  function handleMeetingChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setMeetingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleRegistrationOpenChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setMeetingForm((prev) => ({
      ...prev,
      registrationOpen: e.target.checked,
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/x-png",
      "image/webp",
      "image/gif",
      "image/pjpeg",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Vui lòng chọn file ảnh JPG, PNG, WEBP hoặc GIF.");
      e.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Upload image failed. Vui lòng kiểm tra đăng nhập admin."
        );
      }

      const imageUrl = getUploadedImageUrl(data);

      if (!imageUrl) {
        throw new Error("Upload thành công nhưng không tìm thấy URL ảnh.");
      }

      setMeetingForm((prev) => ({
        ...prev,
        heroImage: imageUrl,
      }));
    } catch (error) {
      console.error("Upload image failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Upload image failed. Please try again."
      );
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  function handleEditMeeting(meeting: Meeting) {
    setEditingId(meeting.id);

    setMeetingForm({
      title: meeting.title || "",
      location: meeting.location || "",
      startDate: formatDateForInput(meeting.startDate),
      endDate: formatDateForInput(meeting.endDate),
      time: meeting.time || "",
      summary: meeting.summary || "",
      heroImage: meeting.heroImage || "",
      status: meeting.status || "published",
      registrationOpen: Boolean(meeting.registrationOpen),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmitMeeting(e: React.FormEvent) {
    e.preventDefault();

    if (
      !meetingForm.title ||
      !meetingForm.location ||
      !meetingForm.startDate
    ) {
      alert("Please enter title, location and start date.");
      return;
    }

    try {
      setMeetingSaving(true);

      const url = editingId
        ? `${API_URL}/api/meetings/${editingId}`
        : `${API_URL}/api/meetings`;

      const method = editingId ? "PUT" : "POST";

      const payload = {
        title: meetingForm.title,
        location: meetingForm.location,
        startDate: buildDateFromInput(meetingForm.startDate),
        endDate: buildDateFromInput(
          meetingForm.endDate || meetingForm.startDate
        ),
        time: meetingForm.time,
        summary: meetingForm.summary,
        heroImage: meetingForm.heroImage,
        status: meetingForm.status,
        type: currentMeetingType,
        registrationOpen:
          currentMeetingType === "upcoming"
            ? meetingForm.registrationOpen
            : false,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let errorData: any = null;

        try {
          errorData = text ? JSON.parse(text) : null;
        } catch {
          errorData = text;
        }

        console.error("Save meeting failed detail:", {
          status: res.status,
          statusText: res.statusText,
          data: errorData,
          payload,
        });

        if (res.status === 401) {
          throw new Error("Bạn chưa đăng nhập hoặc token admin không hợp lệ.");
        }

        if (res.status === 403) {
          throw new Error("Tài khoản hiện tại không có quyền admin.");
        }

        if (res.status === 404) {
          throw new Error(
            "Không tìm thấy API /api/meetings. Kiểm tra backend route."
          );
        }

        throw new Error(
          errorData?.message ||
            errorData ||
            `Save failed. Status: ${res.status}`
        );
      }

      await fetchMeetings(currentMeetingType);
      resetMeetingForm();

      alert(
        editingId
          ? "Meeting updated successfully."
          : "Meeting created successfully."
      );
    } catch (error) {
      console.error("Save meeting failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Save failed. Please try again."
      );
    } finally {
      setMeetingSaving(false);
    }
  }

  async function handleDeleteMeeting(id: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this meeting?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/meetings/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Delete failed");
      }

      setMeetings((prev) => prev.filter((item) => item.id !== id));

      if (editingId === id) {
        resetMeetingForm();
      }
    } catch (error) {
      console.error("Delete meeting failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Delete failed. Please try again."
      );
    }
  }

  function handleRegistrationSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchRegistrations();
  }

  async function updateRegistrationStatus(
    id: number,
    newStatus: RegistrationStatus
  ) {
    try {
      const res = await fetch(`${API_URL}/api/registrations/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          status: newStatus,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setRegistrations((prev) =>
        Array.isArray(prev)
          ? prev.map((item) =>
              item.id === id ? { ...item, status: newStatus } : item
            )
          : []
      );
    } catch (error) {
      console.error("Update status failed:", error);
      alert("Update status failed");
    }
  }

  async function deleteRegistration(id: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this registration?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/registrations/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete registration");
      }

      setRegistrations((prev) =>
        Array.isArray(prev) ? prev.filter((item) => item.id !== id) : []
      );
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Delete failed");
    }
  }

  function exportToExcel() {
    const rows = filteredRegistrations.map((item, index) => ({
      No: index + 1,
      "Full Name": item.fullName,
      Email: item.email,
      Phone: item.phone,
      Organization: item.organization,
      Position: item.position || "",
      Meeting: item.meetingTitle,
      Status: item.status,
      "Registered Date": item.createdAt
        ? new Date(item.createdAt).toLocaleString()
        : "",
      Note: item.note || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, "meeting-registrations.xlsx");
  }

  function registrationStatusClassName(value: string) {
    if (value === "approved") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (value === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  }

  const meetingTitle =
    activeTab === "past" ? "Past Meetings" : "Upcoming Meetings";

  const meetingDescription =
    activeTab === "past"
      ? "Manage meetings that already happened."
      : "Manage upcoming meetings and participant registration.";

  const totalRegistrationCount = Array.isArray(registrations)
    ? registrations.length
    : 0;

  const approvedRegistrationCount = Array.isArray(registrations)
    ? registrations.filter((item) => item.status === "approved").length
    : 0;

  const pendingRegistrationCount = Array.isArray(registrations)
    ? registrations.filter((item) => item.status === "pending").length
    : 0;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Admin
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Manage Meetings
              </h1>
              <p className="mt-2 text-slate-500">
                Create meetings, manage upcoming events, and view participant
                registrations.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/meetings"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-black px-5 py-2.5 font-semibold text-white hover:bg-slate-800"
              >
                View frontend
              </a>

              {(activeTab === "past" || activeTab === "upcoming") &&
                editingId && (
                  <button
                    type="button"
                    onClick={resetMeetingForm}
                    className="rounded-full border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel Edit
                  </button>
                )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 rounded-3xl bg-slate-100 p-2">
            <button
              type="button"
              onClick={() => handleTabChange("past")}
              className={`rounded-2xl px-6 py-3 text-sm font-bold transition ${
                activeTab === "past"
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              Past Meetings
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("upcoming")}
              className={`rounded-2xl px-6 py-3 text-sm font-bold transition ${
                activeTab === "upcoming"
                  ? "bg-sky-600 text-white shadow"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              Upcoming Meetings
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("registrations")}
              className={`rounded-2xl px-6 py-3 text-sm font-bold transition ${
                activeTab === "registrations"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              Registrations
            </button>
          </div>
        </section>

        {(activeTab === "past" || activeTab === "upcoming") && (
          <>
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingId ? `Edit ${meetingTitle}` : `Create ${meetingTitle}`}
                </h2>
                <p className="mt-1 text-slate-500">{meetingDescription}</p>
              </div>

              <form
                onSubmit={handleSubmitMeeting}
                className="grid gap-5 md:grid-cols-2"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Title
                  </label>
                  <input
                    name="title"
                    value={meetingForm.title}
                    onChange={handleMeetingChange}
                    required
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-600"
                    placeholder="Meeting title"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Location
                  </label>
                  <input
                    name="location"
                    value={meetingForm.location}
                    onChange={handleMeetingChange}
                    required
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-600"
                    placeholder="Hanoi, Vietnam"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Start Date
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    value={meetingForm.startDate}
                    onChange={handleMeetingChange}
                    required
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    End Date
                  </label>
                  <input
                    name="endDate"
                    type="date"
                    value={meetingForm.endDate}
                    onChange={handleMeetingChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Time
                  </label>
                  <input
                    name="time"
                    value={meetingForm.time}
                    onChange={handleMeetingChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-600"
                    placeholder="08:30 - 17:00"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={meetingForm.status}
                    onChange={handleMeetingChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-600"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Current Type
                  </label>
                  <div
                    className={`rounded-2xl border px-4 py-3 font-semibold ${
                      activeTab === "upcoming"
                        ? "border-sky-100 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {activeTab === "past"
                      ? "Past Meeting"
                      : "Upcoming Meeting"}
                  </div>
                </div>

                {activeTab === "upcoming" && (
                  <div>
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                      <input
                        type="checkbox"
                        checked={meetingForm.registrationOpen}
                        onChange={handleRegistrationOpenChange}
                        className="h-5 w-5"
                      />

                      <div>
                        <p className="font-semibold text-slate-800">
                          Open registration
                        </p>
                        <p className="text-sm text-slate-500">
                          Bật để người dùng đăng ký meeting này.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Hero Image
                  </label>

                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <input
                      name="heroImage"
                      value={meetingForm.heroImage}
                      onChange={handleMeetingChange}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-600"
                      placeholder="Paste image URL or upload from your computer"
                    />

                    <label className="flex cursor-pointer items-center justify-center rounded-2xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700">
                      {uploadingImage ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {meetingForm.heroImage && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="mb-2 text-sm font-semibold text-slate-600">
                        Preview image
                      </p>
                      <img
                        src={meetingForm.heroImage}
                        alt="Meeting preview"
                        className="h-56 w-full rounded-xl object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Summary
                  </label>
                  <textarea
                    name="summary"
                    value={meetingForm.summary}
                    onChange={handleMeetingChange}
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-600"
                    placeholder="Short description about this meeting..."
                  />
                </div>

                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <button
                    type="submit"
                    disabled={meetingSaving || uploadingImage}
                    className={`rounded-full px-8 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400 ${
                      activeTab === "upcoming"
                        ? "bg-sky-600 hover:bg-sky-700"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    {meetingSaving
                      ? "Saving..."
                      : editingId
                      ? "Update Meeting"
                      : `Create ${meetingTitle}`}
                  </button>

                  <button
                    type="button"
                    onClick={resetMeetingForm}
                    className="rounded-full border border-slate-300 px-8 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {meetingTitle} List
                  </h2>
                  <p className="mt-1 text-slate-500">
                    Total: {filteredMeetings.length} meeting(s)
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={meetingSearch}
                    onChange={(e) => setMeetingSearch(e.target.value)}
                    placeholder="Search..."
                    className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-600"
                  />

                  <select
                    value={meetingStatusFilter}
                    onChange={(e) => setMeetingStatusFilter(e.target.value)}
                    className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-600"
                  >
                    <option value="">All status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {meetingLoading ? (
                <div className="rounded-2xl bg-slate-50 p-8 text-slate-500">
                  Loading meetings...
                </div>
              ) : filteredMeetings.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-8 text-slate-500">
                  No meetings found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="px-5 py-4 text-sm font-semibold">
                          No.
                        </th>
                        <th className="px-5 py-4 text-sm font-semibold">
                          Title
                        </th>
                        <th className="px-5 py-4 text-sm font-semibold">
                          Location
                        </th>
                        <th className="px-5 py-4 text-sm font-semibold">
                          Date
                        </th>
                        <th className="px-5 py-4 text-sm font-semibold">
                          Status
                        </th>
                        {activeTab === "upcoming" && (
                          <th className="px-5 py-4 text-sm font-semibold">
                            Registration
                          </th>
                        )}
                        <th className="px-5 py-4 text-sm font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredMeetings.map((meeting, index) => (
                        <tr
                          key={meeting.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {meeting.title}
                            </p>
                            {meeting.time && (
                              <p className="text-sm text-slate-500">
                                {meeting.time}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {meeting.location}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatDate(meeting.startDate)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                                meeting.status === "published"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-yellow-50 text-yellow-700"
                              }`}
                            >
                              {meeting.status}
                            </span>
                          </td>

                          {activeTab === "upcoming" && (
                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  meeting.registrationOpen
                                    ? "bg-sky-50 text-sky-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {meeting.registrationOpen ? "Open" : "Closed"}
                              </span>
                            </td>
                          )}

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleEditMeeting(meeting)}
                                className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDeleteMeeting(meeting.id)}
                                className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "registrations" && (
          <>
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    Meeting Registrations
                  </h2>
                  <p className="mt-2 text-slate-500">
                    View, manage, and export participant registrations.
                  </p>
                </div>

                <button
                  onClick={exportToExcel}
                  disabled={filteredRegistrations.length === 0}
                  className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  Download Excel
                </button>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <form
                onSubmit={handleRegistrationSearch}
                className="grid gap-4 md:grid-cols-[1fr_220px_140px]"
              >
                <input
                  value={registrationSearch}
                  onChange={(e) => setRegistrationSearch(e.target.value)}
                  placeholder="Search by name, email, phone, organization, meeting..."
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-600"
                />

                <select
                  value={registrationStatus}
                  onChange={(e) => setRegistrationStatus(e.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-600"
                >
                  <option value="">All status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
                >
                  Search
                </button>
              </form>
            </section>

            <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
              {registrationLoading ? (
                <div className="p-8 text-slate-500">
                  Loading registrations...
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="p-8 text-slate-500">
                  No registrations found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse text-left">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-5 py-4 text-sm font-semibold">
                          No.
                        </th>
                        <th className="px-5 py-4 text-sm font-semibold">
                          Full Name
                        </th>
                        <th className="px-5 py-4 text-sm font-semibold">
                          Email
                        </th>
                        <th className="px-5 py-4 text-sm font-semibold">
                          Phone
                        </th>
                        <th className="px-5 py-4 text-sm font-semibold">
                          Organization
                        </th>
                        <th className="px-5 py-4 text-sm font-semibold">
                          Meeting
                        </th>
                        <th className="px-5 py-4 text-sm font-semibold">
                          Status
                        </th>
                        <th className="px-5 py-4 text-sm font-semibold">
                          Registered Date
                        </th>
                        <th className="px-5 py-4 text-sm font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRegistrations.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900">
                              {item.fullName}
                            </div>
                            {item.position && (
                              <div className="text-sm text-slate-500">
                                {item.position}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {item.email}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {item.phone}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {item.organization}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {item.meetingTitle}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${registrationStatusClassName(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatDateTime(item.createdAt)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  updateRegistrationStatus(item.id, "approved")
                                }
                                className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                              >
                                Approve
                              </button>

                              <button
                                onClick={() =>
                                  updateRegistrationStatus(item.id, "rejected")
                                }
                                className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                              >
                                Reject
                              </button>

                              <button
                                onClick={() => deleteRegistration(item.id)}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">Total</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalRegistrationCount}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Approved
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {approvedRegistrationCount}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">Pending</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {pendingRegistrationCount}
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}