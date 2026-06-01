export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787"
).replace(/\/$/, "");

export function getToken() {
  if (typeof window === "undefined") return null;

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("accessToken");

  return token && token.trim() ? token.trim() : null;
}

async function readJsonSafely(res: Response) {
  return res.json().catch(() => null);
}

function getApiErrorMessage(result: any, fallback: string) {
  const message = result?.message || fallback;
  const detail = result?.error || result?.details;

  if (detail) {
    return `${message}: ${detail}`;
  }

  return message;
}

function withData<T>(result: T): T {
  if (result && typeof result === "object" && !Array.isArray(result) && !("data" in result)) {
    return {
      ...(result as object),
      data: result,
    } as T;
  }

  return result;
}

function withListData(result: any) {
  if (Array.isArray(result)) {
    return {
      data: result,
      items: result,
      results: result,
    };
  }

  return result;
}

const PUBLIC_CACHE_TTL = 60 * 1000;
const PUBLIC_FETCH_TIMEOUT = 2000;
const publicCache = new Map<string, { expiresAt: number; value: any }>();
const publicInflight = new Map<string, Promise<any>>();

type PublicGetOptions = {
  ttl?: number;
  cache?: RequestCache;
  bypassCache?: boolean;
};

function clearPublicCache(prefix?: string) {
  if (!prefix) {
    publicCache.clear();
    publicInflight.clear();
    return;
  }

  for (const key of publicCache.keys()) {
    if (key.startsWith(prefix)) publicCache.delete(key);
  }

  for (const key of publicInflight.keys()) {
    if (key.startsWith(prefix)) publicInflight.delete(key);
  }
}

export const FALLBACK_HOME_CONTENT = {
  siteName: "International Mekong Research Working Group (IMRWG)",
  headerLogo: "",
  headerBackgroundImage: "/images/background.png",
  partnerLogos: [],
  welcomeTitle: "Welcome to IMRWG",
  welcomeText:
    "Explore research, meetings, people, documents, data and education around the Mekong River system.",
  marqueeText:
    "Programmatic Meeting at the HCMC University of Natural Resources and Environment (HCMUNRE) - 20-21 April 2026.",
  heroSlides: [],
  infoItems: [],
  attentionItems: [],
  projectsItems: [],
  mapsItems: [],
  mapsSectionTitle: "Maps",
  footerLogo: "",
  footerBackgroundImage: "/images/background.png",
  footerMailingText: "International Mekong\nResearch Working Group\n(IMRWG)",
  footerContactText: "0123456789\ncontact@example.com",
  footerSocialText: "",
};

const FALLBACK_ABOUT_CONTENT = {
  title: "About IMRWG",
  subtitle: "",
  description: "",
  mission: "",
  vision: "",
  content: "",
};

const FALLBACK_EDUCATION_CONTENT = {
  heroBadge: "Education",
  heroTitle: "Education",
  heroSubtitle: "",
  heroDescription: "",
  heroImage: "",
  stats: [],
  featuredPrograms: [],
  resourceItems: [],
  timelineItems: [],
  ctaTitle: "",
  ctaDescription: "",
  ctaButtonText: "",
  ctaButtonLink: "",
};

async function publicGet(
  url: string,
  fallback: any,
  normalize: (value: any) => any = withData,
  options: PublicGetOptions = {}
) {
  const cached = options.bypassCache ? null : publicCache.get(url);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const existing = options.bypassCache ? null : publicInflight.get(url);

  if (existing) {
    return existing;
  }

  const request = (async () => {
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(
      () => controller.abort(),
      PUBLIC_FETCH_TIMEOUT
    );

    try {
      const res = await fetch(url, {
        cache: options.cache || "no-store",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      const result = await readJsonSafely(res);
      const value = normalize(res.ok ? result ?? fallback : fallback);

      publicCache.set(url, {
        expiresAt: Date.now() + (options.ttl ?? PUBLIC_CACHE_TTL),
        value,
      });

      return value;
    } catch {
      const value = normalize(fallback);

      publicCache.set(url, {
        expiresAt: Date.now() + 30 * 1000,
        value,
      });

      return value;
    } finally {
      globalThis.clearTimeout(timeoutId);
      publicInflight.delete(url);
    }
  })();

  publicInflight.set(url, request);
  return request;
}

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/* =========================
   HOME
========================= */

export async function getHomeContent() {
  return publicGet(`${API_URL}/api/home`, FALLBACK_HOME_CONTENT, withData);
}

export async function updateHomeContent(data: any) {
  const res = await authFetch(`${API_URL}/api/home`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, `Request failed: ${res.status}`));
  }

  return withData(result);
}

/* =========================
   ABOUT
========================= */

export type AboutPageData = {
  id?: number;
  slug?: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  mission?: string | null;
  vision?: string | null;
  content?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PartnerLogoItem = {
  url: string;
};

export type CollaborationAreaItem = {
  title: string;
  desc: string;
};

export type PartnersContent = {
  partnerLogos: PartnerLogoItem[];
  collaborationAreas: CollaborationAreaItem[];
  details: string;
};

export type ContactContent = {
  organizationName: string;
  address: string;
  contactEmail: string;
  phoneNumber: string;
  workingHours: string;
  socialMedia: string;
  mapEmbedUrl: string;
  details: string;
};

export const defaultPartnersContent: PartnersContent = {
  partnerLogos: [],
  collaborationAreas: [
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
  ],
  details: "",
};

export const defaultContactContent: ContactContent = {
  organizationName: "International Mekong Research Working Group (IMRWG)",
  address: "",
  contactEmail: "",
  phoneNumber: "",
  workingHours: "Monday – Friday, 08:00 – 17:00",
  socialMedia: "",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Ho%20Chi%20Minh%20City%2C%20Vietnam&output=embed",
  details: "",
};

export function parseAboutJsonContent<T>(content: unknown, fallback: T): T {
  if (!content) return fallback;

  if (typeof content === "object") {
    return {
      ...fallback,
      ...(content as object),
    } as T;
  }

  if (typeof content !== "string") return fallback;

  try {
    const parsed = JSON.parse(content);

    if (parsed && typeof parsed === "object") {
      return {
        ...fallback,
        ...parsed,
      };
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export function stringifyAboutJsonContent(data: unknown) {
  return JSON.stringify(data || {});
}

export async function getAboutContent() {
  return publicGet(`${API_URL}/api/about`, FALLBACK_ABOUT_CONTENT, withData);
}

export async function updateAboutContent(data: Partial<AboutPageData>) {
  const res = await authFetch(`${API_URL}/api/about`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, `Request failed: ${res.status}`));
  }

  return withData(result);
}

export async function getAllAboutPages() {
  return publicGet(`${API_URL}/api/about/all`, [], withListData);
}

export async function getAboutContentBySlug(slug: string) {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
  return publicGet(
    `${API_URL}/api/about/${cleanSlug}`,
    { ...FALLBACK_ABOUT_CONTENT, slug: cleanSlug },
    withData
  );
}

export async function updateAboutContentBySlug(
  slug: string,
  data: Partial<AboutPageData>
) {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");

  const res = await authFetch(`${API_URL}/api/about/${cleanSlug}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, `Request failed: ${res.status}`));
  }

  return withData(result);
}

/* =========================
   UPLOAD
========================= */

export async function uploadImage(file: File): Promise<{
  message: string;
  url: string;
  key?: string;
}> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await authFetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Upload file thất bại"));
  }

  if (!result?.url) {
    throw new Error("Upload thành công nhưng backend không trả về URL file");
  }

  return result;
}

/* =========================
   PEOPLE
========================= */

export type PeopleCategory = "speakers" | "guests" | "committee";

export type PersonItem = {
  id?: number;
  fullName: string;
  role?: string;
  institution?: string;
  email?: string;
  cvLink?: string;
  location?: string;
  avatar?: string;
  bio?: string;
  category?: PeopleCategory;

  phone?: string;
  website?: string;
  mapEmbedUrl?: string;
  specialties?: string[] | string;
  achievements?: string[] | string;

  createdAt?: string;
  updatedAt?: string;
};

export async function getPeople(params?: { category?: PeopleCategory }) {
  const query = new URLSearchParams();

  if (params?.category) {
    query.set("category", params.category);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return publicGet(`${API_URL}/api/people${suffix}`, [], withListData);
}

export async function createPerson(data: PersonItem) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/people`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Thêm people thất bại"));
  }

  return withData(result);
}

export async function updatePerson(id: number, data: PersonItem) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/people/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Cập nhật people thất bại"));
  }

  return withData(result);
}

export async function deletePerson(id: number) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/people/${id}`, {
    method: "DELETE",
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Xóa people thất bại"));
  }

  return withData(result);
}

/* =========================
   EDUCATION
========================= */

export async function getEducationContent() {
  return publicGet(`${API_URL}/api/education`, FALLBACK_EDUCATION_CONTENT, withData);
}

export async function updateEducationContent(data: any) {
  const res = await authFetch(`${API_URL}/api/education`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, `Request failed: ${res.status}`));
  }

  return withData(result);
}

/* =========================
   DATA
========================= */

export type DataItem = {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  value?: string | null;
  unit?: string | null;
  fileUrl?: string | null;
  imageUrl?: string | null;
  year?: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getDataItems(category?: string): Promise<DataItem[]> {
  const query = new URLSearchParams();

  if (category) {
    query.set("category", category);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  const result = await publicGet(`${API_URL}/api/data${suffix}`, [], withListData);
  return result?.data || result || [];
}

export async function getAdminDataItems(): Promise<DataItem[]> {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/data/admin`, {
    cache: "no-store",
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Failed to fetch admin data items"));
  }

  return result?.data || result || [];
}

export async function createDataItem(payload: Partial<DataItem>) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/data`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Failed to create data item"));
  }

  return withData(result);
}

export async function updateDataItem(id: number, payload: Partial<DataItem>) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/data/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Failed to update data item"));
  }

  return withData(result);
}

export async function deleteDataItem(id: number) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/data/${id}`, {
    method: "DELETE",
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Failed to delete data item"));
  }

  return withData(result);
}

export async function getAllDataPages() {
  return publicGet(`${API_URL}/api/data`, [], withListData);
}

export async function getDataContentBySlug(slug: string) {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
  return publicGet(`${API_URL}/api/data/${cleanSlug}`, { slug: cleanSlug }, withData);
}

export async function updateDataContentBySlug(slug: string, data: any) {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");

  const res = await authFetch(`${API_URL}/api/data/${cleanSlug}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, `Request failed: ${res.status}`));
  }

  return withData(result);
}

/* =========================
   LIBRARY
========================= */

export type LibraryDocument = {
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
  createdAt?: string;
  updatedAt?: string;
};

export async function getLibraryDocuments(params?: {
  q?: string;
  category?: string;
  year?: string;
  fileType?: string;
  status?: string;
}) {
  const query = new URLSearchParams();

  if (params?.q) query.set("q", params.q);
  if (params?.category) query.set("category", params.category);
  if (params?.year) query.set("year", params.year);
  if (params?.fileType) query.set("fileType", params.fileType);
  if (params?.status) query.set("status", params.status);

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return publicGet(`${API_URL}/api/library${suffix}`, [], withListData);
}

export async function getLibraryDocumentBySlug(slug: string) {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
  return publicGet(
    `${API_URL}/api/library/${cleanSlug}`,
    { slug: cleanSlug, title: "Untitled document" },
    withData
  );
}

export async function createLibraryDocument(data: LibraryDocument) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/library`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Cannot create library document"));
  }

  return result;
}

export async function updateLibraryDocument(id: number, data: LibraryDocument) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/library/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Cannot update library document"));
  }

  return result;
}

export async function deleteLibraryDocument(id: number) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/library/${id}`, {
    method: "DELETE",
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Cannot delete library document"));
  }

  return result;
}

export async function uploadLibraryAsset(file: File) {
  return uploadImage(file);
}

/* =========================
   MEETINGS
========================= */

export type MeetingItem = {
  id?: number;
  title: string;
  summary?: string | null;
  location?: string | null;
  startDate: string;
  endDate: string;
  heroImage?: string | null;
  agendaFileUrl?: string | null;
  reportFileUrl?: string | null;
  photosLink?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function getMeetings() {
  return publicGet(`${API_URL}/api/meetings`, [], withListData, {
    ttl: 0,
    cache: "no-store",
    bypassCache: true,
  });
}

export async function createMeeting(data: Partial<MeetingItem>) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/meetings`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Failed to create meeting"));
  }
  clearPublicCache(`${API_URL}/api/meetings`);
  return result;
}

export async function updateMeeting(id: number, data: Partial<MeetingItem>) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/meetings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Failed to update meeting"));
  }
  clearPublicCache(`${API_URL}/api/meetings`);
  return result;
}

export async function deleteMeeting(id: number) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/meetings/${id}`, {
    method: "DELETE",
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Failed to delete meeting"));
  }
  clearPublicCache(`${API_URL}/api/meetings`);
  return result;
}

/* =========================
   PROJECTS
========================= */

export type ProjectItem = {
  id?: number;
  title: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  bullets?: string[];
  image?: string;
  readMoreLink?: string;
  publishedAt?: string;
  category?: string;
  researchArea?: string;
  status?: "In Progress" | "Completed" | "Planned";
  yearRange?: string;
  membersCount?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getProjects() {
  const url = `${API_URL}/api/projects`;
  return publicGet(url, [], withListData, {
    ttl: 0,
    cache: "no-store",
    bypassCache: true,
  });
}
export async function getProjectBySlug(slug: string) {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
  return publicGet(
    `${API_URL}/api/projects/${cleanSlug}`,
    { slug: cleanSlug, title: "Untitled project" },
    withData,
    {
      ttl: 0,
      cache: "no-store",
      bypassCache: true,
    }
  );
}

export async function createProject(payload: ProjectItem) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/projects`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Failed to create project"));
  }
  clearPublicCache(`${API_URL}/api/projects`);
  return result;
}

export async function updateProject(id: number, payload: ProjectItem) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Failed to update project"));
  }
  clearPublicCache(`${API_URL}/api/projects`);
  return result;
}

export async function deleteProject(id: number) {
  const token = getToken();

  if (!token) {
    throw new Error("Bạn chưa đăng nhập hoặc token đã mất. Vui lòng đăng nhập lại.");
  }

  const res = await authFetch(`${API_URL}/api/projects/${id}`, {
    method: "DELETE",
  });

  const result = await readJsonSafely(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(result, "Failed to delete project"));
  }
  clearPublicCache(`${API_URL}/api/projects`);
  return result;
}

