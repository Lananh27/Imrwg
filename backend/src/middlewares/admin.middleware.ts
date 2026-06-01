import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

type AdminJwtPayload = {
  userId?: number;
  id?: number;
  email?: string;
  role?: string;
};

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : authHeader.trim();

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        message: "Vui lòng đăng nhập",
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as AdminJwtPayload;

    const role = String(decoded.role || "").toUpperCase();

    if (role !== "ADMIN") {
      return res.status(403).json({
        message: "Không có quyền quản trị",
      });
    }

    (req as any).user = decoded;

    return next();
  } catch (error) {
    console.error("ADMIN MIDDLEWARE ERROR:", error);

    return res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
}