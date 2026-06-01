import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

function slugify(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeBullets(value: any): string[] {
  if (Array.isArray(value)) {
    return value.map((item: any) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item: any) => String(item || "").trim())
          .filter(Boolean);
      }
    } catch {
      return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeDate(value: any) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getErrorMessage(error: any) {
  return error?.message || String(error);
}

function normalizeProjectBody(body: any) {
  const title = String(body.title || "").trim();
  const slug = String(body.slug || "").trim() || slugify(title);
  const readMoreLink = String(body.readMoreLink || "").trim();

  return {
    title,
    slug,
    subtitle: String(body.subtitle || "").trim(),
    description: String(body.description || "").trim(),
    content: String(body.content || "").trim(),
    bullets: normalizeBullets(body.bullets),
    image: String(body.image || "").trim(),
    readMoreLink,
    publishedAt: normalizeDate(body.publishedAt),
    category: String(body.category || "Research").trim(),
    researchArea: String(body.researchArea || "General").trim(),
    status: String(body.status || "In Progress").trim(),
    yearRange: String(body.yearRange || "").trim(),
    membersCount: String(body.membersCount || "0").trim(),
  };
}

function finalReadMoreLink(readMoreLink: string, slug: string) {
  if (!readMoreLink || readMoreLink === "#") {
    return `/projects/${slug}`;
  }

  return readMoreLink;
}

// GET /api/projects
router.get("/", async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
    });

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error("GET PROJECTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách projects",
      error: getErrorMessage(error),
    });
  }
});

// GET /api/projects/:slug
router.get("/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim();

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug không hợp lệ",
      });
    }

    const project = await prisma.project.findUnique({
      where: { slug },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy project",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("GET PROJECT DETAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi lấy chi tiết project",
      error: getErrorMessage(error),
    });
  }
});

// POST /api/projects
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = normalizeProjectBody(req.body);

    if (!data.title) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên project",
      });
    }

    const exists = await prisma.project.findUnique({
      where: { slug: data.slug },
    });

    const finalSlug = exists ? `${data.slug}-${Date.now()}` : data.slug;

    const project = await prisma.project.create({
      data: {
        ...data,
        slug: finalSlug,
        readMoreLink: finalReadMoreLink(data.readMoreLink, finalSlug),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Tạo project thành công",
      data: project,
    });
  } catch (error: any) {
    console.error("CREATE PROJECT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi tạo project",
      error: getErrorMessage(error),
    });
  }
});

// PUT /api/projects/:id
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    const data = normalizeProjectBody(req.body);

    if (!data.title) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên project",
      });
    }

    const oldProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!oldProject) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy project",
      });
    }

    const slugExists = await prisma.project.findFirst({
      where: {
        slug: data.slug,
        NOT: {
          id,
        },
      },
    });

    const finalSlug = slugExists ? `${data.slug}-${Date.now()}` : data.slug;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        slug: finalSlug,
        readMoreLink: finalReadMoreLink(data.readMoreLink, finalSlug),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật project thành công",
      data: project,
    });
  } catch (error: any) {
    console.error("UPDATE PROJECT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi cập nhật project",
      error: getErrorMessage(error),
    });
  }
});

// DELETE /api/projects/:id
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    const oldProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!oldProject) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy project",
      });
    }

    await prisma.project.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Xóa project thành công",
    });
  } catch (error: any) {
    console.error("DELETE PROJECT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi xóa project",
      error: getErrorMessage(error),
    });
  }
});

export default router;