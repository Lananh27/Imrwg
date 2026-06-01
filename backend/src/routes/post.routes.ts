import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error: any) {
    console.error("GET POSTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Lấy bài viết thất bại",
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bài viết không tồn tại",
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error("GET POST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Lấy bài viết thất bại",
    });
  }
});

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { title, content } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tiêu đề bài viết",
        });
      }

      const post = await prisma.post.create({
        data: {
          title,
          content: content || null,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Tạo bài viết thành công",
        data: post,
      });
    } catch (error: any) {
      console.error("CREATE POST ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Tạo bài thất bại",
      });
    }
  }
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { title, content } = req.body;

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID không hợp lệ",
        });
      }

      const post = await prisma.post.update({
        where: { id },
        data: {
          title,
          content: content || null,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Cập nhật bài viết thành công",
        data: post,
      });
    } catch (error: any) {
      console.error("UPDATE POST ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Cập nhật bài viết thất bại",
      });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID không hợp lệ",
        });
      }

      await prisma.post.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Xóa bài viết thành công",
      });
    } catch (error: any) {
      console.error("DELETE POST ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Xóa bài viết thất bại",
      });
    }
  }
);

export default router;