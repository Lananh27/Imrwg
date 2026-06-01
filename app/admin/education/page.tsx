"use client";

import { useEffect, useMemo, useState } from "react";
import { getEducationContent, updateEducationContent, uploadImage } from "@/lib/api";

type StatItem = {
  value: string;
  label: string;
  note: string;
};

type ProgramItem = {
  title: string;
  description: string;
  image: string;
  tag: string;
  link: string;
};

type ResourceItem = {
  title: string;
  description: string;
  type: string;
  image: string;
  link: string;
};

type TimelineItem = {
  time: string;
  title: string;
  description: string;
};

type EducationForm = {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;

  stats: StatItem[];
  featuredPrograms: ProgramItem[];
  resourceItems: ResourceItem[];
  timelineItems: TimelineItem[];

  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
};

const defaultForm: EducationForm = {
  heroBadge: "Education",
  heroTitle: "Learning for a Resilient Mekong Future",
  heroSubtitle:
    "Training, resources, and collaborative learning opportunities for researchers, students, and institutions.",
  heroDescription:
    "Explore educational materials, featured programs, and upcoming learning activities curated by IMRWG.",
  heroImage: "",

  stats: [
    { value: "12+", label: "Learning modules", note: "Updated regularly" },
    { value: "08", label: "Partner institutions", note: "Collaborative network" },
    { value: "500+", label: "Learners reached", note: "Students & professionals" },
  ],

  featuredPrograms: [
    {
      title: "GIS & Remote Sensing",
      description:
        "Foundational and applied learning content for spatial analysis, environmental monitoring, and Mekong research.",
      image: "",
      tag: "Featured",
      link: "",
    },
    {
      title: "Climate & Water Systems",
      description:
        "Interdisciplinary educational content focused on climate risks, water governance, and resilience.",
      image: "",
      tag: "New",
      link: "",
    },
    {
      title: "Research Methods",
      description:
        "Practical academic and field-based methods for young researchers and technical experts.",
      image: "",
      tag: "Popular",
      link: "",
    },
  ],

  resourceItems: [
    {
      title: "Training handbook",
      description: "Downloadable study materials and practical reference resources.",
      type: "Guide",
      image: "",
      link: "",
    },
    {
      title: "Lecture slides",
      description: "Presentation decks and teaching materials for classrooms and workshops.",
      type: "Slides",
      image: "",
      link: "",
    },
    {
      title: "Learning video",
      description: "Short-form educational video content and explainers.",
      type: "Video",
      image: "",
      link: "",
    },
  ],

  timelineItems: [
    {
      time: "May 2026",
      title: "Student workshop",
      description: "Hands-on practical session for research students and early career scholars.",
    },
    {
      time: "July 2026",
      title: "Open lecture series",
      description: "A public lecture connecting education with Mekong sustainability challenges.",
    },
    {
      time: "September 2026",
      title: "Field methods bootcamp",
      description: "Applied research and data collection activities with partner institutions.",
    },
  ],

  ctaTitle: "Ready to learn with IMRWG?",
  ctaDescription:
    "Join educational activities, access curated learning resources, and collaborate with our network.",
  ctaButtonText: "Explore more",
  ctaButtonLink: "/about",
};

const sections = [
  { key: "hero", label: "Hero" },
  { key: "stats", label: "Stats" },
  { key: "programs", label: "Programs" },
  { key: "resources", label: "Resources" },
  { key: "timeline", label: "Timeline" },
  { key: "cta", label: "CTA" },
];

export default function AdminEducationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [form, setForm] = useState<EducationForm>(defaultForm);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEducationContent();
        const data = res?.data;

        if (data) {
          setForm({
            heroBadge: data.heroBadge || defaultForm.heroBadge,
            heroTitle: data.heroTitle || defaultForm.heroTitle,
            heroSubtitle: data.heroSubtitle || defaultForm.heroSubtitle,
            heroDescription: data.heroDescription || defaultForm.heroDescription,
            heroImage: data.heroImage || "",

            stats: Array.isArray(data.stats) ? data.stats : defaultForm.stats,
            featuredPrograms: Array.isArray(data.featuredPrograms)
              ? data.featuredPrograms
              : defaultForm.featuredPrograms,
            resourceItems: Array.isArray(data.resourceItems)
              ? data.resourceItems
              : defaultForm.resourceItems,
            timelineItems: Array.isArray(data.timelineItems)
              ? data.timelineItems
              : defaultForm.timelineItems,

            ctaTitle: data.ctaTitle || defaultForm.ctaTitle,
            ctaDescription: data.ctaDescription || defaultForm.ctaDescription,
            ctaButtonText: data.ctaButtonText || defaultForm.ctaButtonText,
            ctaButtonLink: data.ctaButtonLink || defaultForm.ctaButtonLink,
          });
        }
      } catch (error) {
        console.error("FETCH EDUCATION ADMIN ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpload = async (
    file: File,
    callback: (url: string) => void
  ) => {
    try {
      const result = await uploadImage(file);
      if (result?.url) {
        callback(result.url);
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Upload ảnh thất bại");
    }
  };

  const updateField = (field: keyof EducationForm, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateArrayItem = (
    section: "stats" | "featuredPrograms" | "resourceItems" | "timelineItems",
    index: number,
    field: string,
    value: string
  ) => {
    setForm((prev) => {
      const next = [...(prev[section] as any[])];
      next[index] = {
        ...next[index],
        [field]: value,
      };

      return {
        ...prev,
        [section]: next,
      };
    });
  };

  const addArrayItem = (
    section: "stats" | "featuredPrograms" | "resourceItems" | "timelineItems"
  ) => {
    setForm((prev) => {
      const next = [...(prev[section] as any[])];

      if (section === "stats") {
        next.push({ value: "", label: "", note: "" });
      }

      if (section === "featuredPrograms") {
        next.push({
          title: "",
          description: "",
          image: "",
          tag: "",
          link: "",
        });
      }

      if (section === "resourceItems") {
        next.push({
          title: "",
          description: "",
          type: "",
          image: "",
          link: "",
        });
      }

      if (section === "timelineItems") {
        next.push({
          time: "",
          title: "",
          description: "",
        });
      }

      return {
        ...prev,
        [section]: next,
      };
    });
  };

  const removeArrayItem = (
    section: "stats" | "featuredPrograms" | "resourceItems" | "timelineItems",
    index: number
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const result = await updateEducationContent(form);
      alert(result?.message || "Lưu Education thành công");
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Có lỗi khi lưu Education");
    } finally {
      setSaving(false);
    }
  };

  const sectionTitle = useMemo(() => {
    return sections.find((item) => item.key === activeSection)?.label || "Hero";
  }, [activeSection]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Quản lý Education</h1>
          <p className="mt-2 text-slate-500">
            Chỉnh từng phần riêng biệt: Hero, Stats, Programs, Resources, Timeline, CTA.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-2xl bg-black px-6 py-3 font-medium text-white disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : "Lưu Education"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[24px] border bg-white p-4">
          <div className="space-y-2">
            {sections.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  activeSection === item.key
                    ? "bg-lime-400 text-black"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="rounded-[24px] border bg-white p-6">
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-slate-900">{sectionTitle}</h2>
          </div>

          {activeSection === "hero" && (
            <div className="space-y-5">
              <Input
                label="Hero badge"
                value={form.heroBadge}
                onChange={(value) => updateField("heroBadge", value)}
              />
              <Input
                label="Hero title"
                value={form.heroTitle}
                onChange={(value) => updateField("heroTitle", value)}
              />
              <Input
                label="Hero subtitle"
                value={form.heroSubtitle}
                onChange={(value) => updateField("heroSubtitle", value)}
              />
              <Textarea
                label="Hero description"
                value={form.heroDescription}
                onChange={(value) => updateField("heroDescription", value)}
              />

              <div>
                <label className="mb-2 block font-semibold">Hero image</label>
                <label className="inline-flex cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-medium text-white">
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await handleUpload(file, (url) => updateField("heroImage", url));
                    }}
                  />
                </label>

                {form.heroImage ? (
                  <div className="mt-4">
                    <img
                      src={form.heroImage}
                      alt="Hero"
                      className="max-h-[240px] rounded-2xl object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {activeSection === "stats" && (
            <ArraySection
              title="Education stats"
              onAdd={() => addArrayItem("stats")}
            >
              {form.stats.map((item, index) => (
                <Card key={index} onRemove={() => removeArrayItem("stats", index)}>
                  <Input
                    label="Value"
                    value={item.value}
                    onChange={(value) => updateArrayItem("stats", index, "value", value)}
                  />
                  <Input
                    label="Label"
                    value={item.label}
                    onChange={(value) => updateArrayItem("stats", index, "label", value)}
                  />
                  <Input
                    label="Note"
                    value={item.note}
                    onChange={(value) => updateArrayItem("stats", index, "note", value)}
                  />
                </Card>
              ))}
            </ArraySection>
          )}

          {activeSection === "programs" && (
            <ArraySection
              title="Featured programs"
              onAdd={() => addArrayItem("featuredPrograms")}
            >
              {form.featuredPrograms.map((item, index) => (
                <Card key={index} onRemove={() => removeArrayItem("featuredPrograms", index)}>
                  <Input
                    label="Title"
                    value={item.title}
                    onChange={(value) =>
                      updateArrayItem("featuredPrograms", index, "title", value)
                    }
                  />
                  <Input
                    label="Tag"
                    value={item.tag}
                    onChange={(value) =>
                      updateArrayItem("featuredPrograms", index, "tag", value)
                    }
                  />
                  <Textarea
                    label="Description"
                    value={item.description}
                    onChange={(value) =>
                      updateArrayItem("featuredPrograms", index, "description", value)
                    }
                  />
                  <Input
                    label="Link"
                    value={item.link}
                    onChange={(value) =>
                      updateArrayItem("featuredPrograms", index, "link", value)
                    }
                  />

                  <div>
                    <label className="mb-2 block font-semibold">Image</label>
                    <label className="inline-flex cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-medium text-white">
                      Chọn ảnh
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          await handleUpload(file, (url) =>
                            updateArrayItem("featuredPrograms", index, "image", url)
                          );
                        }}
                      />
                    </label>

                    {item.image ? (
                      <img
                        src={item.image}
                        alt="Program"
                        className="mt-4 max-h-[180px] rounded-2xl object-cover"
                      />
                    ) : null}
                  </div>
                </Card>
              ))}
            </ArraySection>
          )}

          {activeSection === "resources" && (
            <ArraySection
              title="Learning resources"
              onAdd={() => addArrayItem("resourceItems")}
            >
              {form.resourceItems.map((item, index) => (
                <Card key={index} onRemove={() => removeArrayItem("resourceItems", index)}>
                  <Input
                    label="Title"
                    value={item.title}
                    onChange={(value) =>
                      updateArrayItem("resourceItems", index, "title", value)
                    }
                  />
                  <Input
                    label="Type"
                    value={item.type}
                    onChange={(value) =>
                      updateArrayItem("resourceItems", index, "type", value)
                    }
                  />
                  <Textarea
                    label="Description"
                    value={item.description}
                    onChange={(value) =>
                      updateArrayItem("resourceItems", index, "description", value)
                    }
                  />
                  <Input
                    label="Link"
                    value={item.link}
                    onChange={(value) =>
                      updateArrayItem("resourceItems", index, "link", value)
                    }
                  />

                  <div>
                    <label className="mb-2 block font-semibold">Image</label>
                    <label className="inline-flex cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-medium text-white">
                      Chọn ảnh
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          await handleUpload(file, (url) =>
                            updateArrayItem("resourceItems", index, "image", url)
                          );
                        }}
                      />
                    </label>

                    {item.image ? (
                      <img
                        src={item.image}
                        alt="Resource"
                        className="mt-4 max-h-[180px] rounded-2xl object-cover"
                      />
                    ) : null}
                  </div>
                </Card>
              ))}
            </ArraySection>
          )}

          {activeSection === "timeline" && (
            <ArraySection
              title="Timeline items"
              onAdd={() => addArrayItem("timelineItems")}
            >
              {form.timelineItems.map((item, index) => (
                <Card key={index} onRemove={() => removeArrayItem("timelineItems", index)}>
                  <Input
                    label="Time"
                    value={item.time}
                    onChange={(value) =>
                      updateArrayItem("timelineItems", index, "time", value)
                    }
                  />
                  <Input
                    label="Title"
                    value={item.title}
                    onChange={(value) =>
                      updateArrayItem("timelineItems", index, "title", value)
                    }
                  />
                  <Textarea
                    label="Description"
                    value={item.description}
                    onChange={(value) =>
                      updateArrayItem("timelineItems", index, "description", value)
                    }
                  />
                </Card>
              ))}
            </ArraySection>
          )}

          {activeSection === "cta" && (
            <div className="space-y-5">
              <Input
                label="CTA title"
                value={form.ctaTitle}
                onChange={(value) => updateField("ctaTitle", value)}
              />
              <Textarea
                label="CTA description"
                value={form.ctaDescription}
                onChange={(value) => updateField("ctaDescription", value)}
              />
              <Input
                label="CTA button text"
                value={form.ctaButtonText}
                onChange={(value) => updateField("ctaButtonText", value)}
              />
              <Input
                label="CTA button link"
                value={form.ctaButtonLink}
                onChange={(value) => updateField("ctaButtonLink", value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold">{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold">{label}</label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
      />
    </div>
  );
}

function ArraySection({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">{title}</h3>
        <button
          onClick={onAdd}
          type="button"
          className="rounded-xl bg-lime-400 px-4 py-2 font-semibold text-black"
        >
          + Thêm
        </button>
      </div>

      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Card({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-5">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Xóa
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}