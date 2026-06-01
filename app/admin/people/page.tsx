"use client";

import { useEffect, useMemo, useState } from "react";
import {
  API_URL,
  createPerson,
  deletePerson,
  getPeople,
  updatePerson,
  uploadImage,
} from "@/lib/api";

type PeopleCategory = "speakers" | "guests" | "committee";

type PersonItem = {
  id?: number;
  fullName: string;
  role: string;
  institution: string;
  email: string;
  cvLink: string;
  location: string;
  avatar: string;
  bio: string;
  category: PeopleCategory;
};

const categoryTabs: {
  key: PeopleCategory;
  label: string;
  description: string;
}[] = [
  {
    key: "speakers",
    label: "Speakers",
    description: "Quản lý diễn giả hiển thị trong mục Speakers.",
  },
  {
    key: "guests",
    label: "Guests",
    description: "Quản lý khách mời hiển thị trong mục Guests.",
  },
  {
    key: "committee",
    label: "Organizing Committee",
    description: "Quản lý ban tổ chức hiển thị trong mục Organizing Committee.",
  },
];

const emptyPerson = (category: PeopleCategory): PersonItem => ({
  fullName: "",
  role: "",
  institution: "",
  email: "",
  cvLink: "",
  location: "",
  avatar: "",
  bio: "",
  category,
});

function normalizePeople(data: any): PersonItem[] {
  const list = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];

  return list.map((item: any) => ({
    id: item.id,
    fullName: item.fullName || "",
    role: item.role || "",
    institution: item.institution || "",
    email: item.email || "",
    cvLink: item.cvLink || "",
    location: item.location || "",
    avatar: item.avatar || "",
    bio: item.bio || "",
    category: item.category || "speakers",
  }));
}

function imgUrl(url?: string) {
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

function getMapUrl(location?: string) {
  if (!location) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(
    location
  )}&output=embed`;
}

export default function AdminPeoplePage() {
  const [activeCategory, setActiveCategory] =
    useState<PeopleCategory>("speakers");

  const [people, setPeople] = useState<PersonItem[]>([]);
  const [form, setForm] = useState<PersonItem>(emptyPerson("speakers"));

  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewPerson, setViewPerson] = useState<PersonItem | null>(null);

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      category: activeCategory,
    }));
  }, [activeCategory]);

  async function fetchPeople() {
    try {
      setLoading(true);
      const res = await getPeople();
      setPeople(normalizePeople(res));
    } catch (error) {
      console.error("FETCH PEOPLE ERROR:", error);
      alert("Không lấy được danh sách people");
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(category: PeopleCategory) {
    setActiveCategory(category);
    setEditingId(null);
    setForm(emptyPerson(category));
    setSearchText("");
  }

  function updateField(field: keyof PersonItem, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyPerson(activeCategory));
  }

  function handleEdit(person: PersonItem) {
    setEditingId(person.id || null);
    setActiveCategory(person.category || "speakers");

    setForm({
      id: person.id,
      fullName: person.fullName || "",
      role: person.role || "",
      institution: person.institution || "",
      email: person.email || "",
      cvLink: person.cvLink || "",
      location: person.location || "",
      avatar: person.avatar || "",
      bio: person.bio || "",
      category: person.category || "speakers",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const result = await uploadImage(file);

      if (!result?.url) {
        throw new Error("Upload thành công nhưng không có URL ảnh");
      }

      setForm((prev) => ({
        ...prev,
        avatar: result.url,
      }));
    } catch (error) {
      console.error("UPLOAD AVATAR ERROR:", error);
      alert(error instanceof Error ? error.message : "Upload avatar thất bại");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!form.fullName.trim()) {
      alert("Vui lòng nhập họ tên");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        fullName: form.fullName.trim(),
        role: form.role.trim(),
        institution: form.institution.trim(),
        email: form.email.trim(),
        cvLink: form.cvLink.trim(),
        location: form.location.trim(),
        avatar: form.avatar.trim(),
        bio: form.bio.trim(),
        category: form.category,
      };

      if (editingId) {
        await updatePerson(editingId, payload);
        alert("Cập nhật người thành công");
      } else {
        await createPerson(payload);
        alert("Thêm người thành công");
      }

      resetForm();
      await fetchPeople();
    } catch (error) {
      console.error("SAVE PEOPLE ERROR:", error);
      alert(error instanceof Error ? error.message : "Lưu People thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id?: number) {
    if (!id) return;

    const confirmDelete = window.confirm("Bạn có chắc muốn xóa người này?");
    if (!confirmDelete) return;

    try {
      setSaving(true);
      await deletePerson(id);

      if (editingId === id) resetForm();
      if (viewPerson?.id === id) setViewPerson(null);

      await fetchPeople();
    } catch (error) {
      console.error("DELETE PERSON ERROR:", error);
      alert(error instanceof Error ? error.message : "Xóa person thất bại");
    } finally {
      setSaving(false);
    }
  }

  const currentTab = categoryTabs.find((item) => item.key === activeCategory);

  const filteredPeople = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return people
      .filter((person) => person.category === activeCategory)
      .filter((person) => {
        if (!keyword) return true;

        return (
          person.fullName.toLowerCase().includes(keyword) ||
          person.role.toLowerCase().includes(keyword) ||
          person.institution.toLowerCase().includes(keyword) ||
          person.email.toLowerCase().includes(keyword) ||
          person.location.toLowerCase().includes(keyword) ||
          person.bio.toLowerCase().includes(keyword)
        );
      });
  }, [people, activeCategory, searchText]);

  const speakersCount = people.filter(
    (item) => item.category === "speakers"
  ).length;
  const guestsCount = people.filter((item) => item.category === "guests").length;
  const committeeCount = people.filter(
    (item) => item.category === "committee"
  ).length;

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-6 text-black">
      <div className="mx-auto max-w-[1500px] space-y-8">
        <section className="overflow-hidden rounded-[32px] border border-[#bfc9d8] bg-white shadow-sm">
          <div className="bg-[#eef4ff] p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-black">
                  People Manager
                </p>

                <h1 className="mt-3 text-4xl font-black text-black">
                  Quản lý People
                </h1>

                <p className="mt-3 max-w-3xl text-[18px] leading-8 text-black">
                  Quản lý Speakers, Guests và Organizing Committee. Tạo người ở
                  phía trên, danh sách hiển thị ở phía dưới.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="/people"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-black bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-[#e7eefc]"
                >
                  Xem frontend
                </a>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-black bg-[#fde68a] px-5 py-3 text-sm font-black text-black transition hover:bg-[#fcd34d]"
                >
                  + Thêm người mới
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 bg-white p-5 md:grid-cols-3">
            <MiniStat label="Speakers" value={`${speakersCount}`} />
            <MiniStat label="Guests" value={`${guestsCount}`} />
            <MiniStat label="Committee" value={`${committeeCount}`} />
          </div>
        </section>

        <section className="rounded-[28px] border border-[#bfc9d8] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            {categoryTabs.map((tab) => {
              const active = activeCategory === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    active
                      ? "border-black bg-[#dbeafe] text-black shadow-sm"
                      : "border-[#bfc9d8] bg-white text-black hover:bg-[#f5f8ff]"
                  }`}
                >
                  <p className="text-lg font-black text-black">{tab.label}</p>
                  <p className="mt-2 text-sm leading-6 text-black">
                    {tab.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <form
          onSubmit={handleSave}
          className="rounded-[30px] border border-[#bfc9d8] bg-white p-6 shadow-sm"
        >
          <div className="mb-6 rounded-2xl bg-[#f5f8ff] p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-black">
              {editingId ? "Edit person" : "Create person"}
            </p>

            <h2 className="mt-2 text-2xl font-black text-black">
              {currentTab?.label}
            </h2>

            <p className="mt-2 text-sm leading-6 text-black">
              {editingId
                ? "Bạn đang chỉnh sửa người đã chọn."
                : currentTab?.description}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Họ tên">
              <input
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                required
                className="admin-input"
                placeholder="Dr. Elena Rossi"
              />
            </Field>

            <Field label="Chức danh / Vai trò">
              <input
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
                className="admin-input"
                placeholder="Astrophysicist, Conference Chair..."
              />
            </Field>

            <Field label="Cơ quan / Công ty">
              <input
                value={form.institution}
                onChange={(e) => updateField("institution", e.target.value)}
                className="admin-input"
                placeholder="European Space Agency, University..."
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="admin-input"
                placeholder="example@email.com"
              />
            </Field>

            <Field label="CV / Profile Link">
              <input
                value={form.cvLink}
                onChange={(e) => updateField("cvLink", e.target.value)}
                className="admin-input"
                placeholder="https://..."
              />
            </Field>

            <Field label="Địa điểm">
              <input
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="admin-input"
                placeholder="Paris, France"
              />
            </Field>

            <Field label="Nhóm hiển thị">
              <select
                value={form.category}
                onChange={(e) =>
                  updateField("category", e.target.value as PeopleCategory)
                }
                className="admin-input"
              >
                <option value="speakers">Speakers</option>
                <option value="guests">Guests</option>
                <option value="committee">Organizing Committee</option>
              </select>
            </Field>

            <Field label="Avatar">
              <div className="rounded-2xl border border-dashed border-[#bfc9d8] bg-[#f9fbff] p-4">
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingAvatar}
                  onChange={handleAvatarUpload}
                  className="w-full rounded-xl border border-[#bfc9d8] bg-white px-4 py-3 text-black disabled:opacity-60"
                />

                {uploadingAvatar ? (
                  <p className="mt-2 text-sm font-black text-black">
                    Đang upload avatar...
                  </p>
                ) : null}

                <input
                  value={form.avatar}
                  onChange={(e) => updateField("avatar", e.target.value)}
                  className="admin-input mt-3"
                  placeholder="Hoặc dán URL avatar"
                />
              </div>
            </Field>

            <Field label="Preview avatar">
              <div className="flex h-full min-h-[124px] items-center gap-4 rounded-2xl border border-[#bfc9d8] bg-[#f5f8ff] p-4">
                {form.avatar ? (
                  <img
                    src={imgUrl(form.avatar)}
                    alt={form.fullName}
                    className="h-20 w-20 rounded-full border object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e5edff] text-xl font-black text-black">
                    {getInitials(form.fullName)}
                  </div>
                )}

                {form.avatar ? (
                  <button
                    type="button"
                    onClick={() => updateField("avatar", "")}
                    className="rounded-full border border-black bg-[#fecaca] px-4 py-2 text-sm font-black text-black hover:bg-[#fca5a5]"
                  >
                    Xóa ảnh
                  </button>
                ) : (
                  <p className="text-sm font-semibold text-black">
                    Chưa có avatar
                  </p>
                )}
              </div>
            </Field>

            <div className="md:col-span-2 xl:col-span-3">
              <Field label="Mô tả chi tiết / Bio">
                <textarea
                  value={form.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={5}
                  className="admin-input leading-7"
                  placeholder="Tiểu sử, lĩnh vực nghiên cứu, thành tựu, thông tin thêm..."
                />
              </Field>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || uploadingAvatar}
              className="rounded-full border border-black bg-[#dbeafe] px-7 py-3 font-black text-black hover:bg-[#bfdbfe] disabled:bg-slate-300"
            >
              {saving
                ? "Đang lưu..."
                : editingId
                ? "Cập nhật"
                : "Thêm người"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-black bg-white px-7 py-3 font-black text-black hover:bg-[#f3f4f6]"
            >
              Reset
            </button>

            {editingId ? (
              <button
                type="button"
                onClick={() => setViewPerson(form)}
                className="rounded-full border border-black bg-[#fde68a] px-7 py-3 font-black text-black hover:bg-[#fcd34d]"
              >
                Xem người này
              </button>
            ) : null}
          </div>

          <style jsx>{`
            .admin-input {
              width: 100%;
              border-radius: 1rem;
              border: 1px solid #bfc9d8;
              background: #ffffff;
              padding: 0.85rem 1rem;
              outline: none;
              color: #000000;
              font-weight: 600;
            }

            .admin-input::placeholder {
              color: #4b5563;
              font-weight: 500;
            }

            .admin-input:focus {
              border-color: #111111;
              box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
            }
          `}</style>
        </form>

        <section className="rounded-[30px] border border-[#bfc9d8] bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-black">
                List people
              </p>

              <h2 className="mt-2 text-3xl font-black text-black">
                {currentTab?.label}
              </h2>

              <p className="mt-1 text-sm font-semibold text-black">
                Total: {filteredPeople.length} person(s)
              </p>
            </div>

            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm theo tên, vai trò, cơ quan..."
              className="w-full rounded-2xl border border-[#bfc9d8] bg-white px-4 py-3 font-semibold text-black outline-none focus:border-black md:w-[420px]"
            />
          </div>

          {loading ? (
            <div className="rounded-2xl bg-[#f5f8ff] p-8 font-semibold text-black">
              Loading people...
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="rounded-2xl bg-[#f5f8ff] p-8 font-semibold text-black">
              Chưa có dữ liệu trong mục này.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredPeople.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onView={() => setViewPerson(person)}
                  onEdit={() => handleEdit(person)}
                  onDelete={() => handleDelete(person.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {viewPerson ? (
        <PersonViewModal
          person={viewPerson}
          onClose={() => setViewPerson(null)}
          onEdit={() => {
            setViewPerson(null);
            handleEdit(viewPerson);
          }}
        />
      ) : null}
    </main>
  );
}

function PersonCard({
  person,
  onView,
  onEdit,
  onDelete,
}: {
  person: PersonItem;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-[#bfc9d8] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-black hover:shadow-lg">
      <div className="flex gap-4">
        {person.avatar ? (
          <img
            src={imgUrl(person.avatar)}
            alt={person.fullName}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-[#e5edff]"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e5edff] text-xl font-black text-black">
            {getInitials(person.fullName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-lg font-black text-black">
            {person.fullName}
          </h3>

          {person.role ? (
            <p className="mt-1 text-sm font-black text-black">{person.role}</p>
          ) : null}

          {person.institution ? (
            <p className="mt-1 line-clamp-1 text-sm font-semibold text-black">
              {person.institution}
            </p>
          ) : null}

          {person.location ? (
            <p className="mt-1 text-sm font-semibold text-black">
              {person.location}
            </p>
          ) : null}
        </div>
      </div>

      {person.bio ? (
        <p className="mt-4 line-clamp-3 text-sm font-medium leading-6 text-black">
          {person.bio}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onView}
          className="rounded-full border border-black bg-[#dbeafe] px-4 py-2 text-xs font-black text-black hover:bg-[#bfdbfe]"
        >
          Xem
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-black bg-[#fde68a] px-4 py-2 text-xs font-black text-black hover:bg-[#fcd34d]"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-full border border-black bg-[#fecaca] px-4 py-2 text-xs font-black text-black hover:bg-[#fca5a5]"
        >
          Delete
        </button>

        {person.email ? (
          <a
            href={`mailto:${person.email}`}
            className="rounded-full border border-black bg-white px-4 py-2 text-xs font-black text-black hover:bg-[#f3f4f6]"
          >
            Email
          </a>
        ) : null}

        {person.cvLink ? (
          <a
            href={person.cvLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black bg-white px-4 py-2 text-xs font-black text-black hover:bg-[#f3f4f6]"
          >
            CV
          </a>
        ) : null}
      </div>
    </article>
  );
}

function PersonViewModal({
  person,
  onClose,
  onEdit,
}: {
  person: PersonItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  const mapUrl = getMapUrl(person.location);

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
                <img
                  src={imgUrl(person.avatar)}
                  alt={person.fullName}
                  className="h-56 w-56 rounded-full object-cover ring-8 ring-[#e5edff]"
                />
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
                {person.fullName || "No name"}
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
                {person.role ? (
                  <span className="rounded-full border border-black bg-[#f3f4f6] px-4 py-2 text-sm font-black text-black">
                    {person.role}
                  </span>
                ) : null}

                {person.location ? (
                  <span className="rounded-full border border-black bg-[#f3f4f6] px-4 py-2 text-sm font-black text-black">
                    {person.location}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-lg font-black text-black">About</h3>
            <p className="whitespace-pre-line text-base font-medium leading-8 text-black">
              {person.bio || "Profile information is being updated."}
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
            <div className="rounded-2xl border border-[#bfc9d8] bg-white p-5 shadow-sm">
              <h3 className="mb-5 text-lg font-black text-black">Contact</h3>

              <div className="space-y-4 text-sm font-semibold text-black">
                {person.email ? (
                  <p className="break-all">✉️ {person.email}</p>
                ) : (
                  <p>Chưa có email</p>
                )}

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

              <button
                type="button"
                onClick={onEdit}
                className="mt-3 flex w-full items-center justify-center rounded-xl border border-black bg-white px-4 py-3 text-sm font-black text-black hover:bg-[#f3f4f6]"
              >
                Chỉnh sửa người này
              </button>
            </div>

            <div className="rounded-2xl border border-[#bfc9d8] bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-black text-black">Location</h3>

              {mapUrl ? (
                <div className="overflow-hidden rounded-2xl border border-[#bfc9d8]">
                  <iframe
                    src={mapUrl}
                    className="h-[230px] w-full"
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-black">
        {label}
      </label>
      {children}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#bfc9d8] bg-white p-5">
      <p className="text-sm font-black text-black">{label}</p>
      <p className="mt-2 text-3xl font-black text-black">{value}</p>
    </div>
  );
}