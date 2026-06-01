"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createLibraryDocument,
  deleteLibraryDocument,
  getLibraryDocuments,
  updateLibraryDocument,
  uploadLibraryAsset,
} from "@/lib/api";

type LibraryDocument = {
  id?: number;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  author?: string;
  publishedAt?: string;
  fileType?: string;
  fileUrl?: string;
  coverImage?: string;
  status?: "PUBLISHED" | "DRAFT";
  isFeatured?: boolean;
};

const emptyForm: LibraryDocument = {
  title: "",
  slug: "",
  description: "",
  category: "",
  author: "",
  publishedAt: "",
  fileType: "PDF",
  fileUrl: "",
  coverImage: "",
  status: "DRAFT",
  isFeatured: false,
};

const categories = [
  "Research",
  "Report",
  "Dataset",
  "Education",
  "Conference",
  "Policy",
  "Other",
];

const fileTypes = ["PDF", "DOCX", "PPTX", "CSV", "XLSX", "Other"];

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDateForInput(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export default function AdminLibraryPage() {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [form, setForm] = useState<LibraryDocument>(emptyForm);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setLoading(true);

      const res = await getLibraryDocuments();
      setDocuments(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("FETCH ADMIN LIBRARY ERROR:", error);
      alert("Không lấy được danh sách tài liệu");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setActiveId(null);
  }

  function selectDocument(item: LibraryDocument) {
    setActiveId(item.id || null);

    setForm({
      ...emptyForm,
      ...item,
      publishedAt: formatDateForInput(item.publishedAt),
      status: item.status || "DRAFT",
      isFeatured: Boolean(item.isFeatured),
    });
  }

  function updateField(field: keyof LibraryDocument, value: any) {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === "title") {
        next.slug = makeSlug(String(value || ""));
      }

      return next;
    });
  }

  function buildPayload(): LibraryDocument {
    return {
      title: form.title || "",
      slug: form.slug || makeSlug(form.title || ""),
      description: form.description || "",
      category: form.category || "",
      author: form.author || "",
      publishedAt: form.publishedAt || "",
      fileType: form.fileType || "",
      fileUrl: form.fileUrl || "",
      coverImage: form.coverImage || "",
      status: form.status || "DRAFT",
      isFeatured: Boolean(form.isFeatured),
    };
  }

  async function handleUploadCover(file: File) {
    try {
      setUploadingCover(true);

      const result = await uploadLibraryAsset(file);

      if (!result?.url) {
        throw new Error("Upload ảnh thất bại, không nhận được URL");
      }

      setForm((prev) => ({
        ...prev,
        coverImage: result.url,
      }));

      alert("Upload ảnh đại diện thành công");
    } catch (error: any) {
      console.error("UPLOAD COVER ERROR:", error);
      alert(error?.message || "Upload ảnh đại diện thất bại");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleUploadDocumentFile(file: File) {
    try {
      setUploadingFile(true);

      const result = await uploadLibraryAsset(file);

      if (!result?.url) {
        throw new Error("Upload file thất bại, không nhận được URL");
      }

      const extension = file.name.split(".").pop()?.toUpperCase() || "Other";

      setForm((prev) => ({
        ...prev,
        fileUrl: result.url,
        fileType: extension,
      }));

      alert("Upload file tài liệu thành công");
    } catch (error: any) {
      console.error("UPLOAD DOCUMENT FILE ERROR:", error);
      alert(error?.message || "Upload file tài liệu thất bại");
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      const payload = buildPayload();

      if (!payload.title.trim()) {
        alert("Vui lòng nhập tiêu đề tài liệu");
        return;
      }

      if (!payload.slug.trim()) {
        alert("Vui lòng nhập slug tài liệu");
        return;
      }

      if (activeId) {
        await updateLibraryDocument(activeId, payload);
        alert("Cập nhật tài liệu thành công");
      } else {
        await createLibraryDocument(payload);
        alert("Thêm tài liệu thành công");
      }

      resetForm();
      await fetchDocuments();
    } catch (error: any) {
      console.error("SAVE LIBRARY ERROR:", error);
      alert(error?.message || "Lưu tài liệu thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id?: number) {
    if (!id) return;

    const confirmDelete = window.confirm("Bạn có chắc muốn xóa tài liệu này?");
    if (!confirmDelete) return;

    try {
      setSaving(true);

      await deleteLibraryDocument(id);

      alert("Xóa tài liệu thành công");

      resetForm();
      await fetchDocuments();
    } catch (error: any) {
      console.error("DELETE LIBRARY ERROR:", error);
      alert(error?.message || "Xóa tài liệu thất bại");
    } finally {
      setSaving(false);
    }
  }

  const filteredDocuments = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return documents.filter((item) => {
      if (!keyword) return true;

      return (
        item.title.toLowerCase().includes(keyword) ||
        (item.slug || "").toLowerCase().includes(keyword) ||
        (item.category || "").toLowerCase().includes(keyword) ||
        (item.author || "").toLowerCase().includes(keyword)
      );
    });
  }, [documents, searchText]);

  return (
    <div className="max-w-[1500px]">
      <div className="mb-8 rounded-[28px] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-950">
              Quản lý Library
            </h1>
            <p className="mt-2 text-slate-500">
              Thêm, sửa, xóa tài liệu. Khi chọn ảnh hoặc file, hệ thống sẽ
              upload lên S3 trước rồi lưu URL vào Library.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving || uploadingCover || uploadingFile}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              + Tạo mới
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingCover || uploadingFile}
              className="rounded-2xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {saving
                ? "Đang lưu..."
                : activeId
                ? "Cập nhật"
                : "Thêm tài liệu"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border bg-white p-5 shadow-sm xl:sticky xl:top-6 xl:self-start">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm tài liệu..."
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
          />

          <div className="mt-4 rounded-2xl bg-slate-100 p-4">
            <p className="font-black text-slate-900">
              {documents.length} tài liệu
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Chọn một tài liệu để chỉnh sửa.
            </p>
          </div>

          <div className="mt-4 max-h-[720px] space-y-3 overflow-y-auto pr-1">
            {loading ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-slate-500">
                Loading...
              </div>
            ) : filteredDocuments.length > 0 ? (
              filteredDocuments.map((item) => {
                const active = activeId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectDocument(item)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-lime-400 bg-lime-400 text-black"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-black">{item.title}</p>
                      <p className="mt-1 break-all text-xs opacity-70">
                        /{item.slug}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                            item.status === "PUBLISHED"
                              ? active
                                ? "bg-black text-white"
                                : "bg-green-100 text-green-700"
                              : active
                              ? "bg-white text-black"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.status === "PUBLISHED" ? "Published" : "Draft"}
                        </span>

                        {item.isFeatured ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                              active
                                ? "bg-white text-black"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            Featured
                          </span>
                        ) : null}

                        {item.fileType ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                              active
                                ? "bg-white text-black"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {item.fileType}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-center text-sm text-slate-500">
                Chưa có tài liệu.
              </div>
            )}
          </div>
        </aside>

        <section className="rounded-[28px] border bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-600">
                {activeId ? "Đang sửa tài liệu" : "Tạo tài liệu mới"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">
                {form.title || "Untitled document"}
              </h2>
              <p className="mt-2 break-all text-sm text-slate-500">
                Slug: /{form.slug || "chua-co-slug"}
              </p>
            </div>

            {activeId ? (
              <button
                type="button"
                onClick={() => handleDelete(activeId)}
                disabled={saving || uploadingCover || uploadingFile}
                className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                Xóa tài liệu
              </button>
            ) : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Field className="lg:col-span-2">
              <Label>Tiêu đề</Label>
              <input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
                placeholder="Nhập tiêu đề tài liệu"
              />
            </Field>

            <Field>
              <Label>Slug</Label>
              <input
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
                placeholder="ten-tai-lieu"
              />
            </Field>

            <Field>
              <Label>Tác giả</Label>
              <input
                value={form.author || ""}
                onChange={(e) => updateField("author", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
                placeholder="Tên tác giả"
              />
            </Field>

            <Field>
              <Label>Danh mục</Label>
              <select
                value={form.category || ""}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-black"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <Label>Ngày đăng</Label>
              <input
                type="date"
                value={form.publishedAt || ""}
                onChange={(e) => updateField("publishedAt", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
              />
            </Field>

            <Field>
              <Label>Loại file</Label>
              <select
                value={form.fileType || ""}
                onChange={(e) => updateField("fileType", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-black"
              >
                {fileTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <Label>Trạng thái</Label>
              <select
                value={form.status || "DRAFT"}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-black"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </Field>

            <Field className="lg:col-span-2">
              <Label>Mô tả ngắn</Label>
              <textarea
                value={form.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
                placeholder="Nhập mô tả ngắn"
              />
            </Field>

            <Field>
              <Label>Upload ảnh đại diện</Label>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingCover}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  await handleUploadCover(file);
                  e.target.value = "";
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 disabled:opacity-60"
              />

              {uploadingCover ? (
                <p className="mt-2 text-sm font-semibold text-blue-600">
                  Đang upload ảnh lên S3...
                </p>
              ) : null}

              {form.coverImage ? (
                <div className="mt-4">
                  <img
                    src={form.coverImage}
                    alt="Cover"
                    className="h-44 w-full rounded-2xl object-cover"
                  />

                  <p className="mt-3 break-all rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    {form.coverImage}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={form.coverImage}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Mở ảnh
                    </a>

                    <button
                      type="button"
                      onClick={() => updateField("coverImage", "")}
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
                  Chưa có ảnh đại diện
                </div>
              )}
            </Field>

            <Field>
              <Label>Upload file PDF / DOCX / PPTX</Label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.csv,.xlsx"
                disabled={uploadingFile}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  await handleUploadDocumentFile(file);
                  e.target.value = "";
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 disabled:opacity-60"
              />

              {uploadingFile ? (
                <p className="mt-2 text-sm font-semibold text-blue-600">
                  Đang upload file lên S3...
                </p>
              ) : null}

              {form.fileUrl ? (
                <div className="mt-4 rounded-2xl border bg-slate-50 p-4">
                  <p className="mb-3 break-all text-sm text-slate-500">
                    {form.fileUrl}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={form.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Mở file
                    </a>

                    <button
                      type="button"
                      onClick={() => updateField("fileUrl", "")}
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Xóa file
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
                  Chưa có file tài liệu
                </div>
              )}
            </Field>

            <Field className="lg:col-span-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={Boolean(form.isFeatured)}
                  onChange={(e) => updateField("isFeatured", e.target.checked)}
                  className="h-5 w-5"
                />
                <div>
                  <p className="font-black text-slate-900">
                    Đánh dấu tài liệu nổi bật
                  </p>
                  <p className="text-sm text-slate-500">
                    Tài liệu nổi bật sẽ được ưu tiên hiển thị.
                  </p>
                </div>
              </label>
            </Field>
          </div>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <h3 className="text-lg font-black text-slate-900">
              Tóm tắt dữ liệu sẽ lưu
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SummaryItem label="Title" value={form.title || "Chưa nhập"} />
              <SummaryItem
                label="Slug"
                value={`/${form.slug || "chua-co-slug"}`}
              />
              <SummaryItem
                label="Category"
                value={form.category || "Chưa chọn"}
              />
              <SummaryItem
                label="Author"
                value={form.author || "Chưa nhập"}
              />
              <SummaryItem
                label="File type"
                value={form.fileType || "Chưa chọn"}
              />
              <SummaryItem
                label="Status"
                value={form.status === "PUBLISHED" ? "Published" : "Draft"}
              />
              <SummaryItem
                label="Cover image"
                value={form.coverImage ? "Đã có URL S3" : "Chưa có"}
              />
              <SummaryItem
                label="Document file"
                value={form.fileUrl ? "Đã có URL S3" : "Chưa có"}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block font-semibold">{children}</label>;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}