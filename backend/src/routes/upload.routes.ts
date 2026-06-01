import { Router } from "express";
import multer from "multer";
import AWS from "aws-sdk";
import path from "path";
import crypto from "crypto";
import { env } from "../config/env";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/x-png",
      "image/webp",
      "image/gif",
      "image/pjpeg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "File không hợp lệ. Chỉ cho phép JPG, PNG, WEBP, GIF hoặc PDF."
        )
      );
    }

    cb(null, true);
  },
});

function getS3Client() {
  if (
    !env.AWS_ACCESS_KEY_ID ||
    !env.AWS_SECRET_ACCESS_KEY ||
    !env.AWS_S3_BUCKET
  ) {
    throw new Error("Thiếu cấu hình AWS S3 trong biến môi trường");
  }

  return new AWS.S3({
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  });
}

function createSafeFileName(originalName: string) {
  const ext = path.extname(originalName).toLowerCase();

  const baseName = path
    .basename(originalName, ext)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const randomName = crypto.randomUUID();

  return `uploads/${Date.now()}-${baseName || "file"}-${randomName}${ext}`;
}

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("file"),
  async (req, res) => {
    console.log("S3 UPLOAD ROUTE HIT");

    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Không có file được tải lên",
        });
      }

      const s3 = getS3Client();
      const key = createSafeFileName(req.file.originalname);

      await s3
        .putObject({
          Bucket: env.AWS_S3_BUCKET as string,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
        .promise();

      const url = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

      console.log("S3 UPLOAD SUCCESS:", url);

      return res.status(200).json({
        message: "Upload thành công",
        url,
        key,
      });
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      const message = error instanceof Error ? error.message : "Upload thất bại";

      return res.status(500).json({
        message,
      });
    }
  }
);

export default router;