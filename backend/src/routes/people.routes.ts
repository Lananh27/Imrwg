import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

const allowedCategories = ["speakers", "guests", "committee"];

function normalizeCategory(value: any) {
  const category = String(value || "").trim().toLowerCase();

  if (allowedCategories.includes(category)) {
    return category;
  }

  return "speakers";
}

/* =========================
   GET PEOPLE - PUBLIC
   GET /api/people
   GET /api/people?category=speakers
========================= */
router.get("/", async (req: Request, res: Response) => {
  try {
    const category = req.query.category
      ? normalizeCategory(req.query.category)
      : null;

    const where = category ? { category } : {};

    const people = await prisma.person.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: people,
    });
  } catch (error: any) {
    console.error("GET PEOPLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Lỗi lấy danh sách people",
    });
  }
});

/* =========================
   CREATE PERSON - ADMIN
   POST /api/people
========================= */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        fullName,
        role,
        institution,
        email,
        cvLink,
        location,
        avatar,
        bio,
        category,
      } = req.body;

      if (!fullName || String(fullName).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Họ tên là bắt buộc",
        });
      }

      const person = await prisma.person.create({
        data: {
          fullName: String(fullName).trim(),
          role: role ? String(role).trim() : null,
          institution: institution ? String(institution).trim() : null,
          email: email ? String(email).trim() : null,
          cvLink: cvLink ? String(cvLink).trim() : null,
          location: location ? String(location).trim() : null,
          avatar: avatar ? String(avatar).trim() : null,
          bio: bio ? String(bio).trim() : null,
          category: normalizeCategory(category),
        },
      });

      return res.status(201).json({
        success: true,
        message: "Thêm person thành công",
        data: person,
      });
    } catch (error: any) {
      console.error("CREATE PERSON ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Lỗi thêm person",
      });
    }
  }
);

/* =========================
   UPDATE PERSON - ADMIN
   PUT /api/people/:id
========================= */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (!id || Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID person không hợp lệ",
        });
      }

      const existingPerson = await prisma.person.findUnique({
        where: {
          id,
        },
      });

      if (!existingPerson) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy person",
        });
      }

      const {
        fullName,
        role,
        institution,
        email,
        cvLink,
        location,
        avatar,
        bio,
        category,
      } = req.body;

      if (!fullName || String(fullName).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Họ tên là bắt buộc",
        });
      }

      const person = await prisma.person.update({
        where: {
          id,
        },
        data: {
          fullName: String(fullName).trim(),
          role: role ? String(role).trim() : null,
          institution: institution ? String(institution).trim() : null,
          email: email ? String(email).trim() : null,
          cvLink: cvLink ? String(cvLink).trim() : null,
          location: location ? String(location).trim() : null,
          avatar: avatar ? String(avatar).trim() : null,
          bio: bio ? String(bio).trim() : null,
          category: normalizeCategory(category),
        },
      });

      return res.status(200).json({
        success: true,
        message: "Cập nhật person thành công",
        data: person,
      });
    } catch (error: any) {
      console.error("UPDATE PERSON ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Lỗi cập nhật person",
      });
    }
  }
);

/* =========================
   DELETE PERSON - ADMIN
   DELETE /api/people/:id
========================= */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (!id || Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID person không hợp lệ",
        });
      }

      const existingPerson = await prisma.person.findUnique({
        where: {
          id,
        },
      });

      if (!existingPerson) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy person",
        });
      }

      await prisma.person.delete({
        where: {
          id,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Xóa person thành công",
      });
    } catch (error: any) {
      console.error("DELETE PERSON ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Lỗi xóa person",
      });
    }
  }
);

export default router;