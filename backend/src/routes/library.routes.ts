import { Router } from "express";
import { prisma } from "../lib/prisma";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeLibraryBody(body: any) {
  const title = String(body.title || "").trim();
  const slug = String(body.slug || "").trim() || slugify(title);

  return {
    title,
    slug,
    description: body.description || "",
    category: body.category || "Research",
    author: body.author || "",
    publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
    fileType: body.fileType || "",
    fileUrl: body.fileUrl || "",
    coverImage: body.coverImage || "",
    status: body.status || "PUBLISHED",
    isFeatured: Boolean(body.isFeatured),
  };
}

router.get("/", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const category = String(req.query.category || "").trim();
    const year = String(req.query.year || "").trim();
    const fileType = String(req.query.fileType || "").trim();
    const status = String(req.query.status || "").trim();

    const where: any = {};

    if (q) {
      where.OR = [
        {
          title: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          author: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: q,
            mode: "insensitive",
          },
        },
      ];
    }

    if (category && category !== "All") {
      where.category = category;
    }

    if (fileType && fileType !== "All") {
      where.fileType = fileType;
    }

    if (status && status !== "All") {
      where.status = status;
    }

    const documents = await prisma.libraryDocument.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    const filteredByYear =
      year && year !== "All"
        ? documents.filter((doc) => {
            if (!doc.publishedAt) return false;
            return String(doc.publishedAt.getFullYear()) === year;
          })
        : documents;

    return res.json({
      data: filteredByYear,
    });
  } catch (error) {
    console.error("GET LIBRARY ERROR:", error);
    return res.status(500).json({
      message: "Cannot get library documents",
    });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;

    const document = await prisma.libraryDocument.findUnique({
      where: {
        slug,
      },
    });

    if (!document) {
      return res.status(404).json({
        message: "Không tìm thấy tài liệu",
      });
    }

    return res.json({
      data: document,
    });
  } catch (error) {
    console.error("GET LIBRARY DETAIL ERROR:", error);
    return res.status(500).json({
      message: "Cannot get library document",
    });
  }
});

router.post("/", adminMiddleware, async (req, res) => {
  try {
    const data = normalizeLibraryBody(req.body);

    if (!data.title) {
      return res.status(400).json({
        message: "Vui lòng nhập tiêu đề tài liệu",
      });
    }

    const exists = await prisma.libraryDocument.findUnique({
      where: {
        slug: data.slug,
      },
    });

    const finalSlug = exists ? `${data.slug}-${Date.now()}` : data.slug;

    const document = await prisma.libraryDocument.create({
      data: {
        ...data,
        slug: finalSlug,
      },
    });

    return res.status(201).json({
      message: "Thêm tài liệu thành công",
      data: document,
    });
  } catch (error) {
    console.error("CREATE LIBRARY ERROR:", error);
    return res.status(500).json({
      message: "Cannot create library document",
    });
  }
});

router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    const data = normalizeLibraryBody(req.body);

    if (!data.title) {
      return res.status(400).json({
        message: "Vui lòng nhập tiêu đề tài liệu",
      });
    }

    const oldDocument = await prisma.libraryDocument.findUnique({
      where: {
        id,
      },
    });

    if (!oldDocument) {
      return res.status(404).json({
        message: "Không tìm thấy tài liệu",
      });
    }

    const slugExists = await prisma.libraryDocument.findFirst({
      where: {
        slug: data.slug,
        NOT: {
          id,
        },
      },
    });

    const finalSlug = slugExists ? `${data.slug}-${Date.now()}` : data.slug;

    const document = await prisma.libraryDocument.update({
      where: {
        id,
      },
      data: {
        ...data,
        slug: finalSlug,
      },
    });

    return res.json({
      message: "Cập nhật tài liệu thành công",
      data: document,
    });
  } catch (error) {
    console.error("UPDATE LIBRARY ERROR:", error);
    return res.status(500).json({
      message: "Cannot update library document",
    });
  }
});

router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    const oldDocument = await prisma.libraryDocument.findUnique({
      where: {
        id,
      },
    });

    if (!oldDocument) {
      return res.status(404).json({
        message: "Không tìm thấy tài liệu",
      });
    }

    await prisma.libraryDocument.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "Xóa tài liệu thành công",
    });
  } catch (error) {
    console.error("DELETE LIBRARY ERROR:", error);
    return res.status(500).json({
      message: "Cannot delete library document",
    });
  }
});

export default router;