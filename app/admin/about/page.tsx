"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL, uploadImage } from "@/lib/api";

type AboutTabSlug = "main-about" | "partners" | "contact";

type AboutPageData = {
  id?: number;
  slug?: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  mission?: string | null;
  vision?: string | null;
  content?: string | null;
  extra?: any;
};

type PartnerLogo = {
  url: string;
};

type CollaborationArea = {
  title: string;
  desc: string;
};

type ContactExtra = {
  organizationName: string;
  address: string;
  contactEmail: string;
  phoneNumber: string;
  workingHours: string;
  socialMedia: string;
  mapEmbedUrl: string;
};

const tabs: { label: string; slug: AboutTabSlug }[] = [
  { label: "About IMRWG", slug: "main-about" },
  { label: "Partenaires", slug: "partners" },
  { label: "Contact", slug: "contact" },
];

const emptyAbout: AboutPageData = {
  title: "",
  subtitle: "",
  description: "",
  mission: "",
  vision: "",
  content: "",
  extra: {},
};

const defaultContactExtra: ContactExtra = {
  organizationName: "International Mekong Research Working Group (IMRWG)",
  address: "",
  contactEmail: "",
  phoneNumber: "",
  workingHours: "Monday – Friday, 08:00 – 17:00",
  socialMedia: "",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Ho%20Chi%20Minh%20City%2C%20Vietnam&output=embed",
};

const defaultCollaborationAreas: CollaborationArea[] = [
  {
    title: "Research collaboration",
    desc: "Joint studies, fieldwork, academic exchange, and shared research outputs.",
  },
  {
    title: "Training & education",
    desc: "Workshops, capacity building, student activities, and knowledge transfer.",
  },
  {
    title: "Events & networks",
    desc: "Conferences, seminars, technical meetings, and regional cooperation.",
  },
];

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

function cleanGoogleMapSrc(value: string) {
  if (!value) return "";

  const trimmed = value.trim();

  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (srcMatch?.[1]) return srcMatch[1];

  return trimmed;
}

export default function AdminAboutPage() {
  const [activeSlug, setActiveSlug] = useState<AboutTabSlug>("main-about");
  const [form, setForm] = useState<AboutPageData>(emptyAbout);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeTab = useMemo(() => {
    return tabs.find((tab) => tab.slug === activeSlug);
  }, [activeSlug]);

  const contactExtra: ContactExtra = {
    ...defaultContactExtra,
    ...(form.extra || {}),
  };

  const partnerLogos: PartnerLogo[] = Array.isArray(form.extra?.partnerLogos)
    ? form.extra.partnerLogos
    : [];

  const collaborationAreas: CollaborationArea[] = Array.isArray(
    form.extra?.collaborationAreas
  )
    ? form.extra.collaborationAreas
    : defaultCollaborationAreas;

  useEffect(() => {
    fetchAbout(activeSlug);
  }, [activeSlug]);

  const fetchAbout = async (slug: AboutTabSlug) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/about/${slug}`, {
        cache: "no-store",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Không lấy được dữ liệu About");
      }

      setForm({
        title: result?.data?.title || "",
        subtitle: result?.data?.subtitle || "",
        description: result?.data?.description || "",
        mission: result?.data?.mission || "",
        vision: result?.data?.vision || "",
        content: result?.data?.content || "",
        extra: result?.data?.extra || {},
      });
    } catch (error) {
      console.error("FETCH ABOUT ADMIN ERROR:", error);
      alert(error instanceof Error ? error.message : "Không lấy được dữ liệu");
      setForm(emptyAbout);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof AboutPageData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateExtra = (key: string, value: any) => {
    setForm((current) => ({
      ...current,
      extra: {
        ...(current.extra || {}),
        [key]: value,
      },
    }));
  };

  const updateContactExtra = (key: keyof ContactExtra, value: string) => {
    updateExtra(key, key === "mapEmbedUrl" ? cleanGoogleMapSrc(value) : value);
  };

  const updatePartnerLogo = (index: number, value: string) => {
    const next = [...partnerLogos];
    next[index] = { url: value };
    updateExtra("partnerLogos", next);
  };

  const addPartnerLogo = () => {
    updateExtra("partnerLogos", [...partnerLogos, { url: "" }]);
  };

  const removePartnerLogo = (index: number) => {
    const next = partnerLogos.filter((_, i) => i !== index);
    updateExtra("partnerLogos", next);
  };

  const uploadPartnerLogo = async (index: number, file?: File) => {
    if (!file) return;

    try {
      const data = await uploadImage(file);
      updatePartnerLogo(index, data.url);
    } catch (error) {
      console.error("UPLOAD PARTNER LOGO ERROR:", error);
      alert(error instanceof Error ? error.message : "Upload logo thất bại");
    }
  };

  const updateCollaborationArea = (
    index: number,
    key: keyof CollaborationArea,
    value: string
  ) => {
    const next = [...collaborationAreas];
    next[index] = {
      ...next[index],
      [key]: value,
    };
    updateExtra("collaborationAreas", next);
  };

  const saveAbout = async () => {
    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        throw new Error("Bạn chưa đăng nhập hoặc token đã mất.");
      }

      const payload = {
        title: form.title || "",
        subtitle: form.subtitle || "",
        description: form.description || "",
        mission: form.mission || "",
        vision: form.vision || "",
        content: form.content || "",
        extra: form.extra || {},
      };

      const res = await fetch(`${API_URL}/api/about/${activeSlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Lưu About thất bại");
      }

      alert("Lưu thành công");
      await fetchAbout(activeSlug);
    } catch (error) {
      console.error("SAVE ABOUT ADMIN ERROR:", error);
      alert(error instanceof Error ? error.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 pb-28">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7ab648]">
                Admin About
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">
                Quản lý About
              </h1>
              <p className="mt-2 text-slate-500">
                Một trang quản lý 3 mục: About IMRWG, Partenaires và Contact.
              </p>
            </div>

            <button
              type="button"
              onClick={saveAbout}
              disabled={saving || loading}
              className="rounded-xl bg-red-600 px-8 py-4 font-extrabold text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu nội dung"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => {
              const active = activeSlug === tab.slug;

              return (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => setActiveSlug(tab.slug)}
                  className={`rounded-xl px-5 py-3 text-sm font-extrabold transition ${
                    active
                      ? "bg-[#0f6fb8] text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 rounded-2xl bg-[#f8fbff] p-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
              Đang chỉnh
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {activeTab?.label}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Slug: <span className="font-mono">{activeSlug}</span>
            </p>
          </div>

          {loading ? (
            <div className="rounded-xl bg-slate-50 p-10 text-center text-slate-500">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="space-y-6">
              {activeSlug === "main-about" && (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Tiêu đề
                      </label>
                      <input
                        value={form.title || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                        placeholder="About IMRWG"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Phụ đề
                      </label>
                      <input
                        value={form.subtitle || ""}
                        onChange={(e) =>
                          updateField("subtitle", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                        placeholder="International Mekong Research Working Group"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-bold text-slate-700">
                      Mô tả ngắn
                    </label>
                    <textarea
                      value={form.description || ""}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      className="min-h-[110px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                      placeholder="Mô tả ngắn cho About IMRWG..."
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Mission
                      </label>
                      <textarea
                        value={form.mission || ""}
                        onChange={(e) =>
                          updateField("mission", e.target.value)
                        }
                        className="min-h-[120px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Vision
                      </label>
                      <textarea
                        value={form.vision || ""}
                        onChange={(e) =>
                          updateField("vision", e.target.value)
                        }
                        className="min-h-[120px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-bold text-slate-700">
                      Nội dung chính
                    </label>
                    <textarea
                      value={form.content || ""}
                      onChange={(e) => updateField("content", e.target.value)}
                      className="min-h-[260px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                      placeholder="Có thể nhập HTML đơn giản như <h2>, <p>, <ul>..."
                    />
                  </div>
                </>
              )}

              {activeSlug === "partners" && (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Tiêu đề
                      </label>
                      <input
                        value={form.title || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                        placeholder="Partenaires"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Phụ đề
                      </label>
                      <input
                        value={form.subtitle || ""}
                        onChange={(e) =>
                          updateField("subtitle", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                        placeholder="Institutions and organizations collaborating with IMRWG."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-bold text-slate-700">
                      Logo đối tác
                    </label>

                    <div className="space-y-4">
                      {partnerLogos.map((logo, index) => (
                        <div
                          key={index}
                          className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto_auto]"
                        >
                          <input
                            value={logo.url}
                            onChange={(e) =>
                              updatePartnerLogo(index, e.target.value)
                            }
                            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                            placeholder="URL logo đối tác"
                          />

                          <label className="cursor-pointer rounded-xl bg-slate-800 px-4 py-3 text-center font-bold text-white hover:bg-slate-700">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                uploadPartnerLogo(index, e.target.files?.[0])
                              }
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => removePartnerLogo(index)}
                            className="rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
                          >
                            Xóa
                          </button>

                          {logo.url && (
                            <div className="md:col-span-3">
                              <div className="flex h-[120px] items-center justify-center rounded-xl bg-white p-4">
                                <img
                                  src={logo.url}
                                  alt={`Partner logo ${index + 1}`}
                                  className="max-h-[90px] max-w-full object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addPartnerLogo}
                      className="mt-4 rounded-xl bg-[#0f6fb8] px-5 py-3 font-bold text-white hover:bg-[#0b5b96]"
                    >
                      + Thêm logo
                    </button>
                  </div>

                  <div>
                    <label className="mb-2 block font-bold text-slate-700">
                      Các nội dung nhấn mạnh về đối tác
                    </label>

                    <div className="grid gap-4 md:grid-cols-3">
                      {collaborationAreas.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <input
                            value={item.title}
                            onChange={(e) =>
                              updateCollaborationArea(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="mb-3 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                            placeholder="Tiêu đề"
                          />

                          <textarea
                            value={item.desc}
                            onChange={(e) =>
                              updateCollaborationArea(
                                index,
                                "desc",
                                e.target.value
                              )
                            }
                            className="min-h-[120px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                            placeholder="Mô tả"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-bold text-slate-700">
                      Nội dung chi tiết
                    </label>
                    <textarea
                      value={form.content || ""}
                      onChange={(e) => updateField("content", e.target.value)}
                      className="min-h-[220px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                      placeholder="Nội dung giới thiệu thêm về đối tác..."
                    />
                  </div>
                </>
              )}

              {activeSlug === "contact" && (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Name of organization/unit
                      </label>
                      <input
                        value={contactExtra.organizationName}
                        onChange={(e) =>
                          updateContactExtra(
                            "organizationName",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Contact email
                      </label>
                      <input
                        value={contactExtra.contactEmail}
                        onChange={(e) =>
                          updateContactExtra("contactEmail", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                        placeholder="example@email.com"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Phone number
                      </label>
                      <input
                        value={contactExtra.phoneNumber}
                        onChange={(e) =>
                          updateContactExtra("phoneNumber", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                        placeholder="+84 ..."
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Working hours
                      </label>
                      <input
                        value={contactExtra.workingHours}
                        onChange={(e) =>
                          updateContactExtra("workingHours", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Social media
                      </label>
                      <input
                        value={contactExtra.socialMedia}
                        onChange={(e) =>
                          updateContactExtra("socialMedia", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                        placeholder="Facebook / X / LinkedIn..."
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Map embed link
                      </label>
                      <input
                        value={contactExtra.mapEmbedUrl}
                        onChange={(e) =>
                          updateContactExtra("mapEmbedUrl", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                        placeholder="Dán src iframe Google Maps"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block font-bold text-slate-700">
                        Address
                      </label>
                      <textarea
                        value={contactExtra.address}
                        onChange={(e) =>
                          updateContactExtra("address", e.target.value)
                        }
                        className="min-h-[110px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f6fb8]"
                      />
                    </div>
                  </div>

                  {contactExtra.mapEmbedUrl && (
                    <div>
                      <label className="mb-2 block font-bold text-slate-700">
                        Preview map
                      </label>
                      <div className="overflow-hidden rounded-2xl border border-slate-300">
                        <iframe
                          src={contactExtra.mapEmbedUrl}
                          title="Contact map preview"
                          className="h-[360px] w-full border-0"
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        <section className="sticky bottom-5 rounded-2xl border border-red-200 bg-white p-4 shadow-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Bấm lưu để cập nhật nội dung cho tab hiện tại.
            </p>

            <button
              type="button"
              onClick={saveAbout}
              disabled={saving || loading}
              className="rounded-xl bg-red-600 px-8 py-3 font-extrabold text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : `Lưu ${activeTab?.label}`}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}