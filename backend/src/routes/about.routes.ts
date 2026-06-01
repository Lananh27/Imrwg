import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

const DEFAULT_ABOUT_SLUG = "main-about";

const allowedSlugs = ["main-about", "partners", "contact"];

function normalizeSlug(slug?: string | string[]) {
  if (Array.isArray(slug)) {
    return slug[0] || DEFAULT_ABOUT_SLUG;
  }

  if (!slug || slug.trim() === "") {
    return DEFAULT_ABOUT_SLUG;
  }

  return slug.trim();
}

function stringifyContent(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (content === null || content === undefined) {
    return "";
  }

  return JSON.stringify(content);
}

function getDefaultContentBySlug(slug: string) {
  const defaults: Record<
    string,
    {
      title: string;
      subtitle: string;
      description: string;
      mission?: string;
      vision?: string;
      content: string;
    }
  > = {
    "main-about": {
      title: "About IMRWG",
      subtitle: "International Mekong Research Working Group",
      description:
        "A collaborative research network advancing knowledge, partnerships, and sustainable solutions for the Mekong region.",
      mission: "",
      vision: "",
      content: "",
    },

    partners: {
      title: "Partenaires",
      subtitle: "Institutions and organizations collaborating with IMRWG.",
      description:
        "Partners support research, education, events, data sharing, and regional knowledge exchange.",
      mission: "",
      vision: "",
      content: JSON.stringify({
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
      }),
    },

    contact: {
      title: "Contact information",
      subtitle: "Official contact information for IMRWG.",
      description: "Contact information for IMRWG inquiries and communication.",
      mission: "",
      vision: "",
      content: JSON.stringify({
        organizationName: "International Mekong Research Working Group (IMRWG)",
        address: "",
        contactEmail: "",
        phoneNumber: "",
        workingHours: "Monday – Friday, 08:00 – 17:00",
        socialMedia: "",
        mapEmbedUrl:
          "https://www.google.com/maps?q=Ho%20Chi%20Minh%20City%2C%20Vietnam&output=embed",
        details: "",
      }),
    },
  };

  return (
    defaults[slug] || {
      title: slug,
      subtitle: "",
      description: "",
      mission: "",
      vision: "",
      content: "",
    }
  );
}

async function getOrCreateAboutContent(slug: string) {
  const found = await prisma.aboutContent.findUnique({
    where: { slug },
  });

  if (found) {
    return found;
  }

  const defaultContent = getDefaultContentBySlug(slug);

  const created = await prisma.aboutContent.create({
    data: {
      slug,
      title: defaultContent.title,
      subtitle: defaultContent.subtitle,
      description: defaultContent.description,
      mission: defaultContent.mission || null,
      vision: defaultContent.vision || null,
      content: defaultContent.content,
    },
  });

  return created;
}

async function saveAboutContent(slug: string, body: any) {
  const defaultContent = getDefaultContentBySlug(slug);

  const data = {
    title:
      typeof body.title === "string"
        ? body.title
        : defaultContent.title,

    subtitle:
      typeof body.subtitle === "string"
        ? body.subtitle
        : defaultContent.subtitle,

    description:
      typeof body.description === "string"
        ? body.description
        : defaultContent.description,

    mission:
      typeof body.mission === "string"
        ? body.mission
        : null,

    vision:
      typeof body.vision === "string"
        ? body.vision
        : null,

    content:
      body.content !== undefined
        ? stringifyContent(body.content)
        : defaultContent.content,
  };

  const found = await prisma.aboutContent.findUnique({
    where: { slug },
  });

  if (found) {
    return prisma.aboutContent.update({
      where: { slug },
      data,
    });
  }

  return prisma.aboutContent.create({
    data: {
      slug,
      ...data,
    },
  });
}

/**
 * GET /api/about
 * Lấy nội dung About IMRWG chính
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const about = await getOrCreateAboutContent(DEFAULT_ABOUT_SLUG);

    return res.status(200).json({
      success: true,
      data: about,
    });
  } catch (error: any) {
    console.error("GET ABOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Lỗi lấy nội dung About",
    });
  }
});

/**
 * GET /api/about/all
 * Lấy đủ 3 trang about
 */
router.get("/all", async (_req: Request, res: Response) => {
  try {
    const pages = await Promise.all(
      allowedSlugs.map((slug) => getOrCreateAboutContent(slug))
    );

    return res.status(200).json({
      success: true,
      data: pages,
    });
  } catch (error: any) {
    console.error("GET ALL ABOUT PAGES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Lỗi lấy danh sách About",
    });
  }
});

/**
 * GET /api/about/:slug
 * Lấy theo slug: main-about / partners / contact
 */
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const slug = normalizeSlug(req.params.slug);
    const about = await getOrCreateAboutContent(slug);

    return res.status(200).json({
      success: true,
      data: about,
    });
  } catch (error: any) {
    console.error("GET ABOUT BY SLUG ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Lỗi lấy nội dung About",
    });
  }
});

/**
 * PUT /api/about
 * Cập nhật About IMRWG chính
 */
router.put(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const about = await saveAboutContent(DEFAULT_ABOUT_SLUG, req.body);

      return res.status(200).json({
        success: true,
        message: "Lưu About thành công",
        data: about,
      });
    } catch (error: any) {
      console.error("UPDATE ABOUT ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Lỗi cập nhật About",
      });
    }
  }
);

/**
 * PUT /api/about/:slug
 * Cập nhật theo slug: main-about / partners / contact
 */
router.put(
  "/:slug",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const slug = normalizeSlug(req.params.slug);
      const about = await saveAboutContent(slug, req.body);

      return res.status(200).json({
        success: true,
        message: "Lưu nội dung About thành công",
        data: about,
      });
    } catch (error: any) {
      console.error("UPDATE ABOUT BY SLUG ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Lỗi cập nhật nội dung About",
      });
    }
  }
);

export default router;