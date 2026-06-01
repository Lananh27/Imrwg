import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = express.Router();

function getJwtSecret() {
  if (!env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
  }

  return env.JWT_SECRET;
}

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({
        message: "Email và mật khẩu là bắt buộc",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Tài khoản này không có quyền quản trị",
      });
    }

    const isHashedPassword =
      typeof user.password === "string" &&
      (user.password.startsWith("$2a$") ||
        user.password.startsWith("$2b$") ||
        user.password.startsWith("$2y$"));

    if (!isHashedPassword) {
      return res.status(500).json({
        message:
          "Mật khẩu admin chưa được mã hóa. Vui lòng cập nhật password bằng bcrypt.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      getJwtSecret(),
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Lỗi server khi đăng nhập",
    });
  }
});

router.get("/me", authMiddleware, adminMiddleware, async (req, res) => {
  return res.json({
    user: req.user,
  });
});

export default router;