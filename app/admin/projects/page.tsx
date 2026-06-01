"use client";

import { useEffect, useMemo, useState } from "react";
import {
  API_URL,
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type ProjectItem,
} from "@/lib/api";

type ProjectStatus = "In Progress" | "Completed" | "Planned";
type ProjectFormItem = ProjectItem & {
  content?: string;
};

const statusOptions: ProjectStatus[] = ["In Progress", "Completed", "Planned"];

const emptyProject = (): ProjectFormItem => ({
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  content: "",
  bullets: [],
  image: "",
  readMoreLink: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  category: "Research",
  researchArea: "General",
  status: "In Progress",
  yearRange: "2024 - 2026",
  membersCount: "5",
});

function imageUrl(url?: string) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectFormItem[]>([]);
  const [form, setForm] = useState<ProjectFormItem>(emptyProject());
  const [editingId, setEditingId] = useState<number | null>(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const res = await getProjects();
      setProjects(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("FETCH PROJECTS ERROR:", error);
      alert("Không lấy được danh sách projects");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof ProjectFormItem, value: any) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyProject());
  }

  function handleEdit(project: ProjectFormItem) {
    setEditingId(project.id || null);

    setForm({
      ...emptyProject(),
      ...project,
      content: project.content || "",
      publishedAt: project.publishedAt
        ? project.publishedAt.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      bullets: Array.isArray(project.bullets) ? project.bullets : [],
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Upload ảnh thất bại");
      }

      updateField("image", data.url);
    } catch (error) {
      console.error("UPLOAD PROJECT IMAGE ERROR:", error);
      alert(error instanceof Error ? error.message : "Upload ảnh thất bại");
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title?.trim()) {
      alert("Vui lòng nhập tên project");
      return;
    }

    try {
      setSaving(true);

      const finalSlug = form.slug?.trim() || slugify(form.title);

      const payload: ProjectFormItem = {
        ...form,
        title: form.title.trim(),
        slug: finalSlug,
        description: form.description?.trim() || "",
        content: form.content?.trim() || "",
        readMoreLink: form.readMoreLink?.trim() || `/projects/${finalSlug}`,
        bullets: Array.isArray(form.bullets) ? form.bullets : [],
      };

      if (editingId) {
        await updateProject(editingId, payload);
        alert("Cập nhật project thành công");
      } else {
        await createProject(payload);
        alert("Thêm project thành công");
      }

      resetForm();
      await fetchProjects();
    } catch (error) {
      console.error("SAVE PROJECT ERROR:", error);
      alert(error instanceof Error ? error.message : "Lưu project thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id?: number) {
    if (!id) return;

    const ok = window.confirm("Bạn có chắc muốn xóa project này?");
    if (!ok) return;

    try {
      setSaving(true);
      await deleteProject(id);
      await fetchProjects();

      if (editingId === id) {
        resetForm();
      }

      alert("Xóa project thành công");
    } catch (error) {
      console.error("DELETE PROJECT ERROR:", error);
      alert(error instanceof Error ? error.message : "Xóa project thất bại");
    } finally {
      setSaving(false);
    }
  }

  const filteredProjects = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return projects.filter((project) => {
      const matchSearch =
        !keyword ||
        project.title?.toLowerCase().includes(keyword) ||
        project.description?.toLowerCase().includes(keyword) ||
        project.content?.toLowerCase().includes(keyword) ||
        project.category?.toLowerCase().includes(keyword) ||
        project.researchArea?.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "All Status" || project.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [projects, searchText, statusFilter]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] p-6 text-[#0f2342]">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="rounded-[28px] border border-[#d6e0ef] bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#2476d8]">
                Projects Admin
              </p>

              <h1 className="mt-2 text-4xl font-black text-[#0f2342]">
                Quản lý Projects
              </h1>

              <p className="mt-2 text-base font-medium text-[#52657f]">
                Thêm project, viết bài chi tiết và hiển thị nội dung trong trang
                slug.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/projects"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-[#d6e0ef] bg-white px-5 py-3 text-sm font-black text-[#0f2342] hover:bg-[#eef5ff]"
              >
                Xem frontend
              </a>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-[#0b2f6b] px-5 py-3 text-sm font-black text-white hover:bg-[#123f8f]"
              >
                + Thêm project mới
              </button>
            </div>
          </div>
        </section>

        <form
          onSubmit={handleSave}
          className="rounded-[24px] border border-[#d6e0ef] bg-white p-6 shadow-sm"
        >
          <div className="mb-5 rounded-2xl bg-[#eef5ff] p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2476d8]">
              {editingId ? "Edit Project" : "Create Project"}
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#0f2342]">
              {editingId ? "Chỉnh sửa project" : "Thêm project mới"}
            </h2>

            <p className="mt-2 text-sm font-semibold text-[#52657f]">
              Phần “Nội dung bài viết chi tiết” sẽ hiển thị ở trang slug của
              project.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AdminField label="Tên project">
              <input
                value={form.title || ""}
                onChange={(e) => {
                  updateField("title", e.target.value);
                  if (!editingId) {
                    updateField("slug", slugify(e.target.value));
                  }
                }}
                className="admin-input"
                placeholder="Satellite Monitoring for Climate Change"
              />
            </AdminField>

            <AdminField label="Slug">
              <input
                value={form.slug || ""}
                onChange={(e) => updateField("slug", e.target.value)}
                className="admin-input"
                placeholder="satellite-monitoring-for-climate-change"
              />
            </AdminField>

            <AdminField label="Read more link">
              <input
                value={form.readMoreLink || ""}
                onChange={(e) => updateField("readMoreLink", e.target.value)}
                className="admin-input"
                placeholder="/projects/project-slug"
              />
            </AdminField>

            <AdminField label="Category">
              <input
                value={form.category || ""}
                onChange={(e) => updateField("category", e.target.value)}
                className="admin-input"
                placeholder="Environmental Science"
              />
            </AdminField>

            <AdminField label="Research Area">
              <input
                value={form.researchArea || ""}
                onChange={(e) => updateField("researchArea", e.target.value)}
                className="admin-input"
                placeholder="Climate"
              />
            </AdminField>

            <AdminField label="Status">
              <select
                value={form.status || "In Progress"}
                onChange={(e) =>
                  updateField("status", e.target.value as ProjectStatus)
                }
                className="admin-input"
              >
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </AdminField>

            <AdminField label="Year">
              <input
                value={form.yearRange || ""}
                onChange={(e) => updateField("yearRange", e.target.value)}
                className="admin-input"
                placeholder="2024 - 2026"
              />
            </AdminField>

            <AdminField label="Members">
              <input
                value={form.membersCount || ""}
                onChange={(e) => updateField("membersCount", e.target.value)}
                className="admin-input"
                placeholder="5"
              />
            </AdminField>

            <AdminField label="Ngày đăng">
              <input
                type="date"
                value={form.publishedAt || ""}
                onChange={(e) => updateField("publishedAt", e.target.value)}
                className="admin-input"
              />
            </AdminField>

            <div className="md:col-span-2 xl:col-span-3">
              <AdminField label="Mô tả ngắn ở card">
                <textarea
                  value={form.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="admin-input min-h-[110px] resize-none leading-7"
                  placeholder="Mô tả ngắn hiển thị trong card project..."
                />
              </AdminField>
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <AdminField label="Nội dung bài viết chi tiết hiển thị trong trang slug">
                <textarea
                  value={form.content || ""}
                  onChange={(e) => updateField("content", e.target.value)}
                  className="admin-input min-h-[320px] resize-y leading-8"
                  placeholder={`Nhập nội dung bài viết chi tiết tại đây.

Ví dụ:
Dự án này tập trung vào...
Mục tiêu nghiên cứu...
Phương pháp thực hiện...
Kết quả kỳ vọng...`}
                />
              </AdminField>

              <p className="mt-2 text-sm font-semibold text-[#52657f]">
                Nội dung này sẽ hiện trong `/projects/{form.slug || "slug"}`.
              </p>
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <AdminField label="Ảnh cover">
                <div className="grid gap-4 rounded-2xl border border-dashed border-[#bfd0e8] bg-[#f7f9fc] p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={saving}
                      onChange={handleUploadImage}
                      className="w-full rounded-lg border border-[#d6e0ef] bg-white px-3 py-3 text-sm"
                    />

                    <input
                      value={form.image || ""}
                      onChange={(e) => updateField("image", e.target.value)}
                      className="admin-input mt-3"
                      placeholder="Hoặc dán URL ảnh"
                    />
                  </div>

                  <div className="overflow-hidden rounded-xl border border-[#d6e0ef] bg-white">
                    {form.image ? (
                      <img
                        src={imageUrl(form.image)}
                        alt={form.title}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center text-sm font-black text-[#52657f]">
                        No Image
                      </div>
                    )}
                  </div>
                </div>
              </AdminField>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#0b2f6b] px-6 py-3 text-sm font-black text-white hover:bg-[#123f8f] disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm project"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-[#d6e0ef] bg-white px-6 py-3 text-sm font-black text-[#0f2342] hover:bg-[#eef5ff]"
            >
              Reset
            </button>

            {editingId ? (
              <a
                href={`/projects/${form.slug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-[#0b2f6b] bg-[#eef5ff] px-6 py-3 text-sm font-black text-[#0b2f6b] hover:bg-[#dbeafe]"
              >
                Xem trang slug
              </a>
            ) : null}

            {editingId ? (
              <button
                type="button"
                onClick={() => handleDelete(editingId)}
                className="rounded-xl bg-red-600 px-6 py-3 text-sm font-black text-white hover:bg-red-700"
              >
                Xóa
              </button>
            ) : null}
          </div>

          <style jsx>{`
            .admin-input {
              width: 100%;
              border-radius: 0.75rem;
              border: 1px solid #d6e0ef;
              background: #ffffff;
              padding: 0.85rem 1rem;
              font-size: 0.95rem;
              font-weight: 600;
              color: #0f2342;
              outline: none;
            }

            .admin-input:focus {
              border-color: #0b2f6b;
              box-shadow: 0 0 0 3px rgba(11, 47, 107, 0.1);
            }
          `}</style>
        </form>

        <section className="rounded-[24px] border border-[#d6e0ef] bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2476d8]">
                List Projects
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#0f2342]">
                Danh sách Projects
              </h2>

              <p className="mt-1 text-sm font-semibold text-[#52657f]">
                {filteredProjects.length} project(s)
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Tìm project..."
                className="rounded-xl border border-[#d6e0ef] bg-white px-4 py-3 text-sm font-semibold text-[#0f2342] outline-none focus:border-[#0b2f6b]"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-[#d6e0ef] bg-white px-4 py-3 text-sm font-semibold text-[#0f2342] outline-none focus:border-[#0b2f6b]"
              >
                <option>All Status</option>
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-[#f7f9fc] p-10 text-center font-black text-[#52657f]">
              Loading projects...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#bfd0e8] bg-[#f7f9fc] p-10 text-center">
              <h3 className="text-xl font-black text-[#0f2342]">
                Chưa có project
              </h3>
              <p className="mt-2 text-sm font-semibold text-[#52657f]">
                Thêm project mới bằng form phía trên.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectAdminCard
                  key={project.id}
                  project={project}
                  onEdit={() => handleEdit(project)}
                  onDelete={() => handleDelete(project.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function AdminField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-[#0f2342]">
        {label}
      </label>
      {children}
    </div>
  );
}

function ProjectAdminCard({
  project,
  onEdit,
  onDelete,
}: {
  project: ProjectFormItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#d6e0ef] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-[150px] bg-[#e9eef7]">
        {project.image ? (
          <img
            src={imageUrl(project.image)}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-black text-[#52657f]">
            No Image
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-[#64bd3a] px-3 py-1 text-xs font-black text-white">
          {project.status || "In Progress"}
        </span>
      </div>

      <div className="p-5">
        <p className="text-xs font-black text-[#2476d8]">
          {project.category || "Research"}
        </p>

        <h3 className="mt-1 line-clamp-2 text-xl font-black text-[#0f2342]">
          {project.title || "Untitled Project"}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-[#52657f]">
          {project.description || "No description"}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-black text-[#52657f]">
          <span>📅 {project.yearRange || "No year"}</span>
          <span>👥 {project.membersCount || "0"} members</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-[#0b2f6b] px-4 py-2 text-xs font-black text-white hover:bg-[#123f8f]"
          >
            Edit
          </button>

          {project.slug ? (
            <a
              href={`/projects/${project.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[#0b2f6b] bg-white px-4 py-2 text-xs font-black text-[#0b2f6b] hover:bg-[#eef5ff]"
            >
              View slug
            </a>
          ) : null}

          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}