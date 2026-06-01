"use client";

import { useEffect, useState } from "react";
import { getDataContentBySlug, updateDataContentBySlug } from "@/lib/api";

type DataSlug = "conference-data" | "data-download";

type CardItem = {
  title: string;
  value: string;
  note: string;
};

type TableRow = {
  label: string;
  value: string;
  note: string;
};

type FileItem = {
  title: string;
  description: string;
  type: string;
  url: string;
};

type ChartItem = {
  label: string;
  value: string;
};

type DataForm = {
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  cards: CardItem[];
  tableRows: TableRow[];
  files: FileItem[];
  chartItems: ChartItem[];
};

const defaultForms: Record<DataSlug, DataForm> = {
  "conference-data": {
    title: "Conference Data",
    subtitle: "Key information, materials, and records from IMRWG events.",
    description:
      "Explore conference-related data including event summaries, sessions, participants, research topics, and supporting materials.",
    heroImage: "",
    cards: [
      {
        title: "Conferences",
        value: "24+",
        note: "Regional and international events",
      },
      {
        title: "Countries",
        value: "6",
        note: "Mekong countries involved",
      },
      {
        title: "Research topics",
        value: "48+",
        note: "Covered across sessions",
      },
    ],
    tableRows: [
      {
        label: "Annual Research Conference",
        value: "2026",
        note: "Regional knowledge exchange and dataset sharing.",
      },
    ],
    files: [
      {
        title: "Conference summary report",
        description: "Overview document of key sessions and findings.",
        type: "PDF",
        url: "",
      },
    ],
    chartItems: [
      { label: "Workshops", value: "12" },
      { label: "Panels", value: "8" },
      { label: "Datasets", value: "15" },
    ],
  },

  "data-download": {
    title: "Data Download",
    subtitle: "Download documents, datasets, reports, and educational resources.",
    description:
      "A centralized download center for data files and supporting materials.",
    heroImage: "",
    cards: [
      {
        title: "Overview",
        value: "0",
        note: "Update this content in admin",
      },
      {
        title: "Records",
        value: "0",
        note: "Add cards, rows, and downloadable files",
      },
      {
        title: "Resources",
        value: "0",
        note: "Connect files and external links",
      },
    ],
    tableRows: [],
    files: [],
    chartItems: [],
  },
};

const tabs: {
  slug: DataSlug;
  label: string;
  helper: string;
  frontendUrl: string;
}[] = [
  {
    slug: "conference-data",
    label: "Conference data",
    helper: "Chỉnh nội dung body trang Conference data",
    frontendUrl: "/data/conference-data",
  },
  {
    slug: "data-download",
    label: "Data download",
    helper: "Chỉnh nội dung body trang Data download",
    frontendUrl: "/data/data-download",
  },
];

export default function AdminDataPage() {
  const [activeSlug, setActiveSlug] = useState<DataSlug>("conference-data");
  const [form, setForm] = useState<DataForm>(defaultForms["conference-data"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isConference = activeSlug === "conference-data";
  const isDownload = activeSlug === "data-download";

  useEffect(() => {
    fetchData(activeSlug);
  }, [activeSlug]);

  async function fetchData(slug: DataSlug) {
    try {
      setLoading(true);

      const res = await getDataContentBySlug(slug);
      const data = res?.data;
      const fallback = defaultForms[slug];

      if (data) {
        setForm({
          title: data.title || fallback.title,
          subtitle: data.subtitle || fallback.subtitle,
          description: data.description || fallback.description,
          heroImage: data.heroImage || "",
          cards: Array.isArray(data.cards) ? data.cards : fallback.cards,
          tableRows: Array.isArray(data.tableRows)
            ? data.tableRows
            : fallback.tableRows,
          files: Array.isArray(data.files) ? data.files : fallback.files,
          chartItems: Array.isArray(data.chartItems)
            ? data.chartItems
            : fallback.chartItems,
        });
      } else {
        setForm(fallback);
      }
    } catch (error) {
      console.error("FETCH DATA ADMIN ERROR:", error);
      setForm(defaultForms[slug]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      const payload: DataForm = {
        ...form,
        heroImage: "",
        tableRows: isDownload ? [] : form.tableRows,
        chartItems: isDownload ? [] : form.chartItems,
      };

      const result = await updateDataContentBySlug(activeSlug, payload);

      alert(result?.message || "Lưu Data thành công");
    } catch (error: any) {
      console.error("SAVE DATA ADMIN ERROR:", error);
      alert(error?.message || "Có lỗi khi lưu Data");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof DataForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateArrayItem(
    section: "cards" | "tableRows" | "files" | "chartItems",
    index: number,
    field: string,
    value: string
  ) {
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
  }

  function addArrayItem(
    section: "cards" | "tableRows" | "files" | "chartItems"
  ) {
    setForm((prev) => {
      const next = [...(prev[section] as any[])];

      if (section === "cards") {
        next.push({
          title: "",
          value: "",
          note: "",
        });
      }

      if (section === "tableRows") {
        next.push({
          label: "",
          value: "",
          note: "",
        });
      }

      if (section === "files") {
        next.push({
          title: "",
          description: "",
          type: "",
          url: "",
        });
      }

      if (section === "chartItems") {
        next.push({
          label: "",
          value: "",
        });
      }

      return {
        ...prev,
        [section]: next,
      };
    });
  }

  function removeArrayItem(
    section: "cards" | "tableRows" | "files" | "chartItems",
    index: number
  ) {
    setForm((prev) => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((_, i) => i !== index),
    }));
  }

  const activeTab = tabs.find((item) => item.slug === activeSlug);

  return (
    <div className="max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Quản lý Data</h1>
          <p className="mt-2 text-slate-500">
            Chỉnh đúng nội dung đang hiển thị ngoài frontend của mục Data.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={activeTab?.frontendUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Xem frontend
          </a>

          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="rounded-2xl bg-black px-6 py-3 font-medium text-white disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu Data"}
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {tabs.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            onClick={() => setActiveSlug(tab.slug)}
            className={`rounded-[24px] border p-5 text-left transition ${
              activeSlug === tab.slug
                ? "border-lime-400 bg-lime-400 text-black shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <p className="text-xl font-bold">{tab.label}</p>
            <p
              className={`mt-2 text-sm ${
                activeSlug === tab.slug ? "text-black/70" : "text-slate-500"
              }`}
            >
              {tab.helper}
            </p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-[24px] border bg-white p-8 text-slate-500">
          Loading...
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-[24px] border bg-white p-6">
            <div className="mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Nội dung đầu trang
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Những phần này tương ứng với tiêu đề và mô tả phía trên
                frontend.
              </p>
            </div>

            <div className="space-y-5">
              <Input
                label={
                  isDownload
                    ? "Tiêu đề trang, ví dụ: Data Download"
                    : "Tiêu đề trang, ví dụ: Conference Data"
                }
                value={form.title}
                onChange={(value) => updateField("title", value)}
              />

              <Textarea
                label="Mô tả ngắn dưới tiêu đề"
                value={form.subtitle}
                onChange={(value) => updateField("subtitle", value)}
              />

              <Textarea
                label={
                  isDownload
                    ? "Mô tả bên phải phần Available documents"
                    : "Mô tả overview trong body"
                }
                value={form.description}
                onChange={(value) => updateField("description", value)}
              />
            </div>
          </section>

          <ArraySection
            title={isDownload ? "Cards số liệu phía dưới bảng" : "Cards thống kê"}
            description={
              isDownload
                ? "3 ô số liệu đang hiển thị bên dưới bảng tài liệu."
                : "Các ô thống kê đang hiển thị trong body Conference data."
            }
            onAdd={() => addArrayItem("cards")}
          >
            {form.cards.map((item, index) => (
              <Card key={index} onRemove={() => removeArrayItem("cards", index)}>
                <Input
                  label="Tên card"
                  value={item.title}
                  onChange={(value) =>
                    updateArrayItem("cards", index, "title", value)
                  }
                />

                <Input
                  label="Giá trị"
                  value={item.value}
                  onChange={(value) =>
                    updateArrayItem("cards", index, "value", value)
                  }
                />

                <Input
                  label="Ghi chú"
                  value={item.note}
                  onChange={(value) =>
                    updateArrayItem("cards", index, "note", value)
                  }
                />
              </Card>
            ))}
          </ArraySection>

          {isDownload ? (
            <ArraySection
              title="Danh sách tài liệu tải xuống"
              description="Những tài liệu này sẽ hiển thị trong bảng Available documents ngoài frontend."
              onAdd={() => addArrayItem("files")}
            >
              {form.files.length === 0 ? (
                <EmptyBox text="Chưa có tài liệu nào. Bấm + Thêm để tạo tài liệu tải xuống." />
              ) : null}

              {form.files.map((item, index) => (
                <Card
                  key={index}
                  onRemove={() => removeArrayItem("files", index)}
                >
                  <Input
                    label="Tên tài liệu"
                    value={item.title}
                    onChange={(value) =>
                      updateArrayItem("files", index, "title", value)
                    }
                  />

                  <Input
                    label="Loại file, ví dụ: PDF, CSV, DOC, XLSX"
                    value={item.type}
                    onChange={(value) =>
                      updateArrayItem("files", index, "type", value)
                    }
                  />

                  <Textarea
                    label="Mô tả tài liệu"
                    value={item.description}
                    onChange={(value) =>
                      updateArrayItem("files", index, "description", value)
                    }
                  />

                  <Input
                    label="Link tải tài liệu"
                    value={item.url}
                    onChange={(value) =>
                      updateArrayItem("files", index, "url", value)
                    }
                  />

                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Mở link tài liệu
                    </a>
                  ) : null}
                </Card>
              ))}
            </ArraySection>
          ) : null}

          {isConference ? (
            <>
              <ArraySection
                title="Conference records"
                description="Danh sách record đang hiển thị trong bảng Conference record index."
                onAdd={() => addArrayItem("tableRows")}
              >
                {form.tableRows.length === 0 ? (
                  <EmptyBox text="Chưa có record nào. Bấm + Thêm để tạo." />
                ) : null}

                {form.tableRows.map((item, index) => (
                  <Card
                    key={index}
                    onRemove={() => removeArrayItem("tableRows", index)}
                  >
                    <Input
                      label="Tên record"
                      value={item.label}
                      onChange={(value) =>
                        updateArrayItem("tableRows", index, "label", value)
                      }
                    />

                    <Input
                      label="Năm / giá trị"
                      value={item.value}
                      onChange={(value) =>
                        updateArrayItem("tableRows", index, "value", value)
                      }
                    />

                    <Textarea
                      label="Mô tả"
                      value={item.note}
                      onChange={(value) =>
                        updateArrayItem("tableRows", index, "note", value)
                      }
                    />
                  </Card>
                ))}
              </ArraySection>

              <ArraySection
                title="Files / Resources"
                description="File hoặc resource đang hiển thị trong phần Conference files."
                onAdd={() => addArrayItem("files")}
              >
                {form.files.length === 0 ? (
                  <EmptyBox text="Chưa có file nào. Bấm + Thêm để tạo." />
                ) : null}

                {form.files.map((item, index) => (
                  <Card
                    key={index}
                    onRemove={() => removeArrayItem("files", index)}
                  >
                    <Input
                      label="Tên file/resource"
                      value={item.title}
                      onChange={(value) =>
                        updateArrayItem("files", index, "title", value)
                      }
                    />

                    <Input
                      label="Loại file"
                      value={item.type}
                      onChange={(value) =>
                        updateArrayItem("files", index, "type", value)
                      }
                    />

                    <Textarea
                      label="Mô tả"
                      value={item.description}
                      onChange={(value) =>
                        updateArrayItem("files", index, "description", value)
                      }
                    />

                    <Input
                      label="Link"
                      value={item.url}
                      onChange={(value) =>
                        updateArrayItem("files", index, "url", value)
                      }
                    />
                  </Card>
                ))}
              </ArraySection>

              <ArraySection
                title="Data categories"
                description="Các category đang hiển thị trong phần data distribution/categories."
                onAdd={() => addArrayItem("chartItems")}
              >
                {form.chartItems.length === 0 ? (
                  <EmptyBox text="Chưa có category nào. Bấm + Thêm để tạo." />
                ) : null}

                {form.chartItems.map((item, index) => (
                  <Card
                    key={index}
                    onRemove={() => removeArrayItem("chartItems", index)}
                  >
                    <Input
                      label="Tên category"
                      value={item.label}
                      onChange={(value) =>
                        updateArrayItem("chartItems", index, "label", value)
                      }
                    />

                    <Input
                      label="Giá trị"
                      value={item.value}
                      onChange={(value) =>
                        updateArrayItem("chartItems", index, "value", value)
                      }
                    />
                  </Card>
                ))}
              </ArraySection>
            </>
          ) : null}
        </div>
      )}
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
        rows={4}
        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
      />
    </div>
  );
}

function ArraySection({
  title,
  description,
  onAdd,
  children,
}: {
  title: string;
  description?: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border bg-white p-6">
      <div className="mb-6 flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>

        <button
          onClick={onAdd}
          type="button"
          className="w-fit rounded-xl bg-lime-400 px-4 py-2 font-semibold text-black"
        >
          + Thêm
        </button>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
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

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
      {text}
    </div>
  );
}