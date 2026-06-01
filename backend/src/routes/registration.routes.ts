import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

function mapRegistrationForClient(item: any) {
  return {
    _id: String(item.id),
    id: item.id,
    fullName: item.fullName,
    email: item.email,
    phone: item.phone,
    organization: item.organization,
    position: item.position || "",
    note: item.note || "",
    status: item.status,
    meetingId: String(item.meetingId),
    meetingTitle: item.meeting?.title || "",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// POST /api/registrations
// public: người dùng đăng ký meeting
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      phone,
      organization,
      position,
      note,
      meetingId,
    } = req.body;

    if (!fullName || !email || !phone || !organization || !meetingId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin đăng ký",
      });
    }

    const meetingIdNumber = Number(meetingId);

    if (!meetingIdNumber || Number.isNaN(meetingIdNumber)) {
      return res.status(400).json({
        success: false,
        message: "Meeting không hợp lệ",
      });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingIdNumber },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy meeting",
      });
    }

    if (meeting.type !== "upcoming" || !meeting.registrationOpen) {
      return res.status(400).json({
        success: false,
        message: "Meeting này chưa mở đăng ký",
      });
    }

    const registration = await prisma.registration.create({
      data: {
        fullName: String(fullName).trim(),
        email: String(email).trim(),
        phone: String(phone).trim(),
        organization: String(organization).trim(),
        position: position ? String(position).trim() : null,
        note: note ? String(note).trim() : null,
        meetingId: meetingIdNumber,
        status: "pending",
      },
      include: {
        meeting: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Đăng ký meeting thành công",
      data: mapRegistrationForClient(registration),
    });
  } catch (error: any) {
    console.error("CREATE REGISTRATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Lỗi đăng ký meeting",
    });
  }
});

// GET /api/registrations
// admin
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const search = String(req.query.search || "").trim();
      const status = String(req.query.status || "").trim();

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { organization: { contains: search, mode: "insensitive" } },
          { meeting: { title: { contains: search, mode: "insensitive" } } },
        ];
      }

      const registrations = await prisma.registration.findMany({
        where,
        include: {
          meeting: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        data: registrations.map(mapRegistrationForClient),
      });
    } catch (error: any) {
      console.error("GET REGISTRATIONS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Lỗi lấy danh sách đăng ký",
      });
    }
  }
);

// PATCH /api/registrations/:id/status
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const status = String(req.body.status || "");

      if (!id || Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID đăng ký không hợp lệ",
        });
      }

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái không hợp lệ",
        });
      }

      const registration = await prisma.registration.update({
        where: { id },
        data: { status },
        include: {
          meeting: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái thành công",
        data: mapRegistrationForClient(registration),
      });
    } catch (error: any) {
      console.error("UPDATE REGISTRATION STATUS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Lỗi cập nhật trạng thái",
      });
    }
  }
);

// DELETE /api/registrations/:id
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
          message: "ID đăng ký không hợp lệ",
        });
      }

      await prisma.registration.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Xóa đăng ký thành công",
      });
    } catch (error: any) {
      console.error("DELETE REGISTRATION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Lỗi xóa đăng ký",
      });
    }
  }
);

export default router;