"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { API_URL, getHomeContent, getProjects } from "@/lib/api";

type ProjectStatus = "In Progress" | "Completed" | "Planned";

type ProjectItem = {
  id?: number;
  slug?: string;
  title: string;
  subtitle?: string;
  description: string;
  bullets?: string[];
  image: string;
  readMoreLink?: string;
  publishedAt?: string;

  category?: string;
  researchArea?: string;
  status?: ProjectStatus;
  yearRange?: string;
  membersCount?: string;
};

type HomeContent = {
  siteName?: string;
  headerLogo?: string;
  partnerLogos?: string[] | null;
  footerMailingText?: string;
  footerContactText?: string;
  footerSocialText?: string;
  footerLogo?: string;

  projectsSectionTitle?: string;
  projectsItems?: ProjectItem[];
};

const statusOptions: ProjectStatus[] = ["In Progress", "Completed", "Planned"];

function parseJsonArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeHome(data: any): HomeContent | null {
  const raw =
    data?.data?.content ||
    data?.data?.home ||
    data?.data?.homeContent ||
    data?.data ||
    data?.home ||
    data?.content ||
    data?.homeContent ||
    data?.result ||
    data;

  if (!raw || typeof raw !== "object") return null;

  return {
    ...raw,
    partnerLogos: parseJsonArray<string>(raw.partnerLogos),
    projectsItems: parseJsonArray<ProjectItem>(raw.projectsItems),
  };
}

function imageUrl(url?: string | null) {
  if (!url || !url.trim()) return "";

  if (url.startsWith("http")) return url;

  if (url.startsWith("/images")) return url;

  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function statusClass(status?: string) {
  if (status === "Completed") return "bg-[#2781e7] text-white";
  if (status === "Planned") return "bg-[#f6c23e] text-black";
  return "bg-[#64bd3a] text-white";
}

function slugify(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getProjectHref(project: ProjectItem) {
  const readMoreLink = project.readMoreLink?.trim();

  if (readMoreLink && readMoreLink !== "#") {
    return readMoreLink;
  }

  const slug = project.slug?.trim() || slugify(project.title || "");

  if (!slug) return "/projects";

  return `/projects/${slug}`;
}

function normalizeBullets(value: any): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function extractProjectList(data: any): any[] {
  if (Array.isArray(data)) return data;

  const candidates = [
    data?.data,
    data?.data?.items,
    data?.data?.projects,
    data?.data?.result,
    data?.data?.data,
    data?.projects,
    data?.projectsItems,
    data?.items,
    data?.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function normalizeProjects(data: any): ProjectItem[] {
  const list = extractProjectList(data);

  console.log("PROJECTS NORMALIZE INPUT:", data);
  console.log("PROJECTS NORMALIZE LIST:", list);

  return list
    .filter((item: any) => item && typeof item === "object")
    .map((item: any) => {
      const title = String(item.title || "").trim();
      const slug = String(item.slug || slugify(title)).trim();

      const publishedAt = item.publishedAt || item.createdAt || "";

      return {
        id: item.id,
        slug,
        title,
        subtitle: item.subtitle || "",
        description: item.description || item.summary || item.subtitle || "",
        bullets: normalizeBullets(item.bullets),
        image: item.image || item.heroImage || item.imageUrl || "",
        readMoreLink: item.readMoreLink || "",
        publishedAt,
        category: item.category || "Research",
        researchArea: item.researchArea || item.category || "General",
        status: item.status || "In Progress",
        yearRange:
          item.yearRange ||
          (publishedAt ? String(publishedAt).slice(0, 4) : "2024 - 2026"),
        membersCount: String(item.membersCount || "5"),
      };
    });
}

function getErrorText(error: any) {
  if (!error) return "";

  if (typeof error === "string") return error;

  return (
    error?.message ||
    error?.error ||
    error?.response?.data?.message ||
    String(error)
  );
}

export default function ProjectsPage() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectError, setProjectError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [researchFilter, setResearchFilter] = useState("All Areas");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [yearFilter, setYearFilter] = useState("All Years");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    setProjectError("");

    try {
      const [homeResult, projectsResult] = await Promise.allSettled([
        getHomeContent(),
        getProjects(),
      ]);

      if (homeResult.status === "fulfilled") {
        const homeData = normalizeHome(homeResult.value);
        setHome(homeData);

        console.log("PROJECTS HOME RAW:", homeResult.value);
        console.log("PROJECTS HOME NORMALIZED:", homeData);
      } else {
        console.error("PROJECTS HOME API ERROR:", homeResult.reason);
        setHome(null);
      }

      if (projectsResult.status === "fulfilled") {
        const projectList = normalizeProjects(projectsResult.value);
        setProjects(projectList);

        console.log("PROJECTS RAW:", projectsResult.value);
        console.log("PROJECTS NORMALIZED:", projectList);
      } else {
        const errorText = getErrorText(projectsResult.reason);

        console.error("PROJECTS API ERROR:", projectsResult.reason);

        setProjectError(
          errorText ||
            "Không lấy được dữ liệu Projects. Kiểm tra API /api/projects."
        );
        setProjects([]);
      }
    } catch (error) {
      const errorText = getErrorText(error);

      console.error("FETCH PROJECTS ERROR:", error);

      setProjectError(
        errorText || "Không lấy được dữ liệu Projects. Kiểm tra backend."
      );
      setHome(null);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    return [
      "All Categories",
      ...Array.from(
        new Set(
          projects
            .map((item) => item.category)
            .filter((item): item is string => Boolean(item))
        )
      ),
    ];
  }, [projects]);

  const researchAreas = useMemo(() => {
    return [
      "All Areas",
      ...Array.from(
        new Set(
          projects
            .map((item) => item.researchArea)
            .filter((item): item is string => Boolean(item))
        )
      ),
    ];
  }, [projects]);

  const years = useMemo(() => {
    return [
      "All Years",
      ...Array.from(
        new Set(
          projects
            .map((item) => item.yearRange)
            .filter((item): item is string => Boolean(item))
        )
      ),
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    const result = projects.filter((project) => {
      const matchSearch =
        !keyword ||
        project.title.toLowerCase().includes(keyword) ||
        (project.subtitle || "").toLowerCase().includes(keyword) ||
        project.description.toLowerCase().includes(keyword) ||
        (project.category || "").toLowerCase().includes(keyword) ||
        (project.researchArea || "").toLowerCase().includes(keyword);

      const matchCategory =
        categoryFilter === "All Categories" ||
        project.category === categoryFilter;

      const matchResearch =
        researchFilter === "All Areas" ||
        project.researchArea === researchFilter;

      const matchStatus =
        statusFilter === "All Status" || project.status === statusFilter;

      const matchYear =
        yearFilter === "All Years" || project.yearRange === yearFilter;

      return (
        matchSearch &&
        matchCategory &&
        matchResearch &&
        matchStatus &&
        matchYear
      );
    });

    return result.sort((a, b) => {
      const timeA = new Date(a.publishedAt || "1970-01-01").getTime();
      const timeB = new Date(b.publishedAt || "1970-01-01").getTime();

      if (sortOrder === "Oldest First") return timeA - timeB;
      return timeB - timeA;
    });
  }, [
    projects,
    searchText,
    categoryFilter,
    researchFilter,
    statusFilter,
    yearFilter,
    sortOrder,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, categoryFilter, researchFilter, statusFilter, yearFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / itemsPerPage)
  );

  const currentProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage]);

  const showingStart =
    filteredProjects.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  const showingEnd = Math.min(
    currentPage * itemsPerPage,
    filteredProjects.length
  );

  function resetFilters() {
    setSearchText("");
    setCategoryFilter("All Categories");
    setResearchFilter("All Areas");
    setStatusFilter("All Status");
    setYearFilter("All Years");
    setSortOrder("Newest First");
  }

  return (
    <>
      <Header
        siteName={home?.siteName}
        headerLogo={home?.headerLogo}
        partnerLogos={home?.partnerLogos}
      />

      <main className="min-h-screen bg-[#fbfcff] text-[#0f2342]">
        <section className="px-5 py-8">
          <div className="projects-page">
            <aside className="filter-panel">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[15px] font-black text-[#0f2342]">
                  Filter Projects
                </h2>
                <span className="text-[18px] text-[#0f2342]">▽</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[11px] font-black text-[#0f2342]">
                    Search projects...
                  </label>

                  <div className="relative">
                    <input
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search projects..."
                      className="filter-input pr-9"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#52657f]">
                      🔍
                    </span>
                  </div>
                </div>

                <FilterSelect
                  label="Category"
                  value={categoryFilter}
                  options={categories}
                  onChange={setCategoryFilter}
                />

                <FilterSelect
                  label="Research Area"
                  value={researchFilter}
                  options={researchAreas}
                  onChange={setResearchFilter}
                />

                <FilterSelect
                  label="Status"
                  value={statusFilter}
                  options={["All Status", ...statusOptions]}
                  onChange={setStatusFilter}
                />

                <FilterSelect
                  label="Year"
                  value={yearFilter}
                  options={years}
                  onChange={setYearFilter}
                />

                <button
                  type="button"
                  onClick={resetFilters}
                  className="reset-filter-btn"
                >
                  <span className="text-[13px] leading-none">↻</span>
                  <span>Reset Filters</span>
                </button>
              </div>
            </aside>

            <section className="min-w-0">
              <div className="projects-toolbar">
                <p className="toolbar-count">
                  Showing {showingStart}–{showingEnd} of{" "}
                  {filteredProjects.length} projects
                </p>

                <div className="toolbar-actions">
                  <div className="view-toggle">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`view-toggle-btn ${
                        viewMode === "grid" ? "view-toggle-btn-active" : ""
                      }`}
                      title="Grid view"
                    >
                      ▦
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`view-toggle-btn ${
                        viewMode === "list" ? "view-toggle-btn-active" : ""
                      }`}
                      title="List view"
                    >
                      ☰
                    </button>
                  </div>

                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="sort-select"
                  >
                    <option>Newest First</option>
                    <option>Oldest First</option>
                  </select>
                </div>
              </div>

              {projectError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold leading-6 text-red-700">
                  <p className="font-black">Projects API đang lỗi:</p>
                  <p className="mt-1 break-words">{projectError}</p>
                  <p className="mt-2 text-red-600">
                    Mở trực tiếp {API_URL}/api/projects để xem lỗi chi tiết.
                  </p>
                </div>
              )}

              {loading ? (
                <div className="rounded-xl border border-[#d6e0ef] bg-white p-12 text-center shadow-sm">
                  <p className="font-black text-[#0f2342]">
                    Loading projects...
                  </p>
                </div>
              ) : currentProjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#bfd0e8] bg-white p-12 text-center">
                  <h3 className="text-2xl font-black text-[#0f2342]">
                    No projects found
                  </h3>
                  <p className="mt-2 text-sm font-medium text-[#52657f]">
                    {projectError
                      ? "Backend đang lỗi nên chưa thể hiển thị project."
                      : "Try another keyword or reset filters."}
                  </p>
                </div>
              ) : (
                <div
                  className={viewMode === "grid" ? "project-grid" : "grid gap-5"}
                >
                  {currentProjects.map((project, index) => (
                    <ProjectCard
                      key={`${project.slug || project.title}-${index}`}
                      project={project}
                      listMode={viewMode === "list"}
                    />
                  ))}
                </div>
              )}

              <div className="mt-7 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="page-btn disabled:opacity-40"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;

                  if (
                    totalPages > 6 &&
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - currentPage) > 1
                  ) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span
                          key={page}
                          className="flex h-9 w-9 items-center justify-center text-[12px] font-black text-[#52657f]"
                        >
                          ...
                        </span>
                      );
                    }

                    return null;
                  }

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`page-btn ${
                        currentPage === page
                          ? "border-[#071f4a] bg-[#071f4a] text-white"
                          : "border-[#d6e0ef] bg-white text-[#0f2342] hover:bg-[#eef5ff]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="page-btn disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </section>
          </div>
        </section>

        <style jsx>{`
          .projects-page {
            width: 100%;
            max-width: 1180px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 260px minmax(0, 1fr);
            gap: 28px;
            align-items: start;
          }

          .filter-panel {
            border: 1px solid #d6e0ef;
            border-radius: 16px;
            background: #ffffff;
            padding: 20px;
            box-shadow: 0 4px 16px rgba(15, 35, 66, 0.04);
            position: sticky;
            top: 24px;
          }

          .filter-input {
            width: 100%;
            height: 40px;
            border-radius: 8px;
            border: 1px solid #d6e0ef;
            background: white;
            padding: 0 12px;
            font-size: 13px;
            font-weight: 500;
            color: #0f2342;
            outline: none;
          }

          .filter-input:focus {
            border-color: #0b2f6b;
          }

          .reset-filter-btn {
            margin-top: 8px;
            width: 100%;
            height: 38px;
            border-radius: 8px;
            border: 1px solid #08245a;
            background: #061d49;
            color: white;
            font-size: 12px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            box-shadow: 0 6px 12px rgba(6, 29, 73, 0.16);
            transition: all 0.2s ease;
          }

          .reset-filter-btn:hover {
            background: #0b2f6b;
            transform: translateY(-1px);
          }

          .projects-toolbar {
            margin-bottom: 20px;
            min-height: 42px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }

          .toolbar-count {
            font-size: 13px;
            font-weight: 800;
            color: #0f2342;
          }

          .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .view-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .view-toggle-btn {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            border: 1px solid #d6e0ef;
            background: #ffffff;
            color: #52657f;
            font-size: 14px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(15, 35, 66, 0.04);
            transition: all 0.2s ease;
          }

          .view-toggle-btn:hover {
            background: #eef5ff;
            color: #061d49;
          }

          .view-toggle-btn-active {
            border-color: #061d49;
            background: #061d49;
            color: #ffffff;
            box-shadow: 0 8px 16px rgba(6, 29, 73, 0.18);
          }

          .sort-select {
            width: 150px;
            height: 40px;
            border-radius: 8px;
            border: 1px solid #d6e0ef;
            background: #ffffff;
            padding: 0 14px;
            font-size: 13px;
            font-weight: 700;
            color: #0f2342;
            outline: none;
            box-shadow: 0 4px 10px rgba(15, 35, 66, 0.04);
          }

          .sort-select:focus {
            border-color: #0b2f6b;
          }

          .project-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 22px;
          }

          .page-btn {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            border: 1px solid #d6e0ef;
            background: white;
            color: #0f2342;
            font-size: 13px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          @media (max-width: 1100px) {
            .projects-page {
              max-width: 900px;
              grid-template-columns: 1fr;
            }

            .filter-panel {
              position: static;
            }

            .project-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 640px) {
            .project-grid {
              grid-template-columns: 1fr;
            }

            .projects-toolbar {
              align-items: flex-start;
              flex-direction: column;
            }

            .toolbar-actions {
              width: 100%;
              justify-content: space-between;
            }

            .sort-select {
              flex: 1;
            }
          }
        `}</style>
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

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-black text-[#0f2342]">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-[8px] border border-[#d6e0ef] bg-white px-3 text-[13px] font-medium text-[#0f2342] outline-none transition focus:border-[#0b2f6b]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function ProjectCard({
  project,
  listMode,
}: {
  project: ProjectItem;
  listMode: boolean;
}) {
  const href = getProjectHref(project);

  return (
    <Link
      href={href}
      className={`group block overflow-hidden rounded-[12px] border border-[#d6e0ef] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        listMode ? "md:grid md:grid-cols-[300px_minmax(0,1fr)]" : ""
      }`}
    >
      <div className="relative h-[150px] overflow-hidden bg-[#e9eef7]">
        {project.image ? (
          <img
            src={imageUrl(project.image)}
            alt={project.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[13px] font-black text-[#52657f]">
            No Image
          </div>
        )}

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black ${statusClass(
            project.status
          )}`}
        >
          {project.status || "In Progress"}
        </span>
      </div>

      <div className="p-4">
        <div className="h-[16px]" aria-hidden="true" />

        <h3 className="mt-1 line-clamp-2 text-[18px] font-black leading-tight text-[#0f2342] transition group-hover:text-[#2476d8]">
          {project.title || "Untitled Project"}
        </h3>

        <p className="mt-2 line-clamp-3 text-[13px] font-medium leading-5 text-[#52657f]">
          {project.description ||
            project.subtitle ||
            "No description for this project yet."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] font-black text-[#52657f]">
          <span>
            📅 {project.yearRange || project.publishedAt || "No year"}
          </span>

          <span>👥 {project.membersCount || "0"} members</span>

          <span
            className="ml-auto text-[18px] text-[#0f2342] transition group-hover:text-[#2476d8]"
            title="View project"
          >
            ♡
          </span>
        </div>
      </div>
    </Link>
  );
}