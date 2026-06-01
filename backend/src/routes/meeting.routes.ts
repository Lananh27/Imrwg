import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

type MeetingType = "past" | "upcoming";
type MeetingStatus = "draft" | "published";

function parseDate(value: any) {
  if (!value) return null;

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function normalizeMeetingType(value: any): MeetingType {
  return value === "upcoming" ? "upcoming" : "past";
}

function normalizeMeetingStatus(value: any): MeetingStatus {
  return value === "draft" ? "draft" : "published";
}

function mapMeetingForClient(meeting: any) {
  return {
    _id: String(meeting.id),
    id: meeting.id,

    title: meeting.title,
    location: meeting.location || "",
    date: meeting.startDate,
    time: meeting.time || "",
    description: meeting.summary || "",
    image: meeting.heroImage || "",

    type: meeting.type || "past",
    status: meeting.status || "published",
    registrationOpen: Boolean(meeting.registrationOpen),

    startDate: meeting.startDate,
    endDate: meeting.endDate,
    summary: meeting.summary || "",
    heroImage: meeting.heroImage || "",
    agendaFileUrl: meeting.agendaFileUrl || "",
    reportFileUrl: meeting.reportFileUrl || "",
    photosLink: meeting.photosLink || "",

    createdAt: meeting.createdAt,
    updatedAt: meeting.updatedAt,
  };
}

// GET /api/meetings
router.get("/", async (req: Request, res: Response) => {
  try {
    const type = req.query.type ? normalizeMeetingType(req.query.type) : null;
    const admin = String(req.query.admin || "") === "true";

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (!admin) {
      where.status = "published";
    }

    const meetings = await prisma.meeting.findMany({
      where,
      orderBy: {
        startDate: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: meetings.map(mapMeetingForClient),
    });
  } catch (error: any) {
    console.error("GET MEETINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Lỗi lấy danh sách meetings",
    });
  }
});

// GET /api/meetings/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID meeting không hợp lệ",
      });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy meeting",
      });
    }

    return res.status(200).json({
      success: true,
      data: mapMeetingForClient(meeting),
    });
  } catch (error: any) {
    console.error("GET MEETING DETAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Lỗi lấy chi tiết meeting",
    });
  }
});

// POST /api/meetings
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const title = String(req.body.title || "").trim();
      const location = String(req.body.location || "").trim();

      const dateValue = req.body.date || req.body.startDate;
      const parsedDate = parseDate(dateValue);

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Tiêu đề meeting là bắt buộc",
        });
      }

      if (!location) {
        return res.status(400).json({
          success: false,
          message: "Địa điểm meeting là bắt buộc",
        });
      }

      if (!parsedDate) {
        return res.status(400).json({
          success: false,
          message: "Ngày meeting không hợp lệ",
        });
      }

      const type = normalizeMeetingType(req.body.type);
      const status = normalizeMeetingStatus(req.body.status);

      const meeting = await prisma.meeting.create({
        data: {
          title,
          location,
          startDate: parsedDate,
          endDate: parsedDate,

          time: req.body.time ? String(req.body.time).trim() : null,
          summary: req.body.description
            ? String(req.body.description).trim()
            : req.body.summary
            ? String(req.body.summary).trim()
            : null,
          heroImage: req.body.image
            ? String(req.body.image).trim()
            : req.body.heroImage
            ? String(req.body.heroImage).trim()
            : null,

          agendaFileUrl: req.body.agendaFileUrl
            ? String(req.body.agendaFileUrl).trim()
            : null,
          reportFileUrl: req.body.reportFileUrl
            ? String(req.body.reportFileUrl).trim()
            : null,
          photosLink: req.body.photosLink ? String(req.body.photosLink).trim() : null,

          type,
          status,
          registrationOpen:
            type === "upcoming" ? Boolean(req.body.registrationOpen) : false,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Thêm meeting thành công",
        data: mapMeetingForClient(meeting),
      });
    } catch (error: any) {
      console.error("CREATE MEETING ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Lỗi thêm meeting",
      });
    }
  }
);

// PUT /api/meetings/:id
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
          message: "ID meeting không hợp lệ",
        });
      }

      const existingMeeting = await prisma.meeting.findUnique({
        where: { id },
      });

      if (!existingMeeting) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy meeting",
        });
      }

      const title = String(req.body.title || "").trim();
      const location = String(req.body.location || "").trim();

      const dateValue = req.body.date || req.body.startDate;
      const parsedDate = parseDate(dateValue);

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Tiêu đề meeting là bắt buộc",
        });
      }

      if (!location) {
        return res.status(400).json({
          success: false,
          message: "Địa điểm meeting là bắt buộc",
        });
      }

      if (!parsedDate) {
        return res.status(400).json({
          success: false,
          message: "Ngày meeting không hợp lệ",
        });
      }

      const type = normalizeMeetingType(req.body.type);
      const status = normalizeMeetingStatus(req.body.status);

      const meeting = await prisma.meeting.update({
        where: { id },
        data: {
          title,
          location,
          startDate: parsedDate,
          endDate: parsedDate,

          time: req.body.time ? String(req.body.time).trim() : null,
          summary: req.body.description
            ? String(req.body.description).trim()
            : req.body.summary
            ? String(req.body.summary).trim()
            : null,
          heroImage: req.body.image
            ? String(req.body.image).trim()
            : req.body.heroImage
            ? String(req.body.heroImage).trim()
            : null,

          agendaFileUrl: req.body.agendaFileUrl
            ? String(req.body.agendaFileUrl).trim()
            : existingMeeting.agendaFileUrl,
          reportFileUrl: req.body.reportFileUrl
            ? String(req.body.reportFileUrl).trim()
            : existingMeeting.reportFileUrl,
          photosLink: req.body.photosLink
            ? String(req.body.photosLink).trim()
            : existingMeeting.photosLink,

          type,
          status,
          registrationOpen:
            type === "upcoming" ? Boolean(req.body.registrationOpen) : false,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Cập nhật meeting thành công",
        data: mapMeetingForClient(meeting),
      });
    } catch (error: any) {
      console.error("UPDATE MEETING ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Lỗi cập nhật meeting",
      });
    }
  }
);

// DELETE /api/meetings/:id
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
          message: "ID meeting không hợp lệ",
        });
      }

      const existingMeeting = await prisma.meeting.findUnique({
        where: { id },
      });

      if (!existingMeeting) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy meeting",
        });
      }

      await prisma.meeting.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Xóa meeting thành công",
      });
    } catch (error: any) {
      console.error("DELETE MEETING ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Lỗi xóa meeting",
      });
    }
  }
);

export default router;