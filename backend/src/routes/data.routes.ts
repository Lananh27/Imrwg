import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

const DEFAULT_DATA_PAGES = [
  {
    slug: "conference-data",
    title: "Conference Data",
    subtitle: "Key information, materials, and records from IMRWG events.",
    description:
      "Explore conference-related data including event summaries, sessions, participants, and supporting materials.",
  },
  {
    slug: "attendance-statistics",
    title: "Attendance Statistics",
    subtitle: "Participation insights across meetings, workshops, and events.",
    description:
      "Track attendance trends, participant groups, institutions, and engagement statistics.",
  },
  {
    slug: "research-dataset",
    title: "Research Dataset",
    subtitle: "Curated datasets for Mekong-related research and education.",
    description:
      "Access organized research datasets supporting GIS, environmental studies, water systems, and climate analysis.",
  },
  {
    slug: "data-download",
    title: "Data Download",
    subtitle: "Download documents, datasets, reports, and educational resources.",
    description:
      "A centralized download center for data files and supporting materials.",
  },
];

function normalizeSlug(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function ensureArray(value: any) {
  return Array.isArray(value) ? value : [];
}

async function createDefaultPage(slug: string) {
  const defaultPage =
    DEFAULT_DATA_PAGES.find((item) => item.slug === slug) ||
    DEFAULT_DATA_PAGES[0];

  return prisma.dataContent.create({
    data: {
      slug,
      title: defaultPage.title,
      subtitle: defaultPage.subtitle,
      description: defaultPage.description,
      heroImage: null,
      cards: [
        {
          title: "Overview",
          value: "0",
          note: "Update this content in admin",
        },
        {
          title: "Records",
          value: "0",
          note: "Add cards, rows, and downloadable files",
        },
        {
          title: "Resources",
          value: "0",
          note: "Connect files and external links",
        },
      ],
      tableRows: [
        {
          label: "Sample item",
          value: "Update in admin",
          note: "You can change this row",
        },
      ],
      files: [],
      chartItems: [
        {
          label: "Sample",
          value: "10",
        },
      ],
    },
  });
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    const pages = await Promise.all(
      DEFAULT_DATA_PAGES.map(async (item) => {
        let page = await prisma.dataContent.findUnique({
          where: { slug: item.slug },
        });

        if (!page) {
          page = await createDefaultPage(item.slug);
        }

        return page;
      })
    );

    return res.status(200).json({
      success: true,
      data: pages,
    });
  } catch (error: any) {
    console.error("GET DATA PAGES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch data pages",
    });
  }
});

router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const slug = normalizeSlug(req.params.slug);

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug không hợp lệ",
      });
    }

    let page = await prisma.dataContent.findUnique({
      where: { slug },
    });

    if (!page) {
      page = await createDefaultPage(slug);
    }

    return res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error("GET DATA PAGE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch data page",
    });
  }
});

router.put(
  "/:slug",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const slug = normalizeSlug(req.params.slug);

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Slug không hợp lệ",
        });
      }

      const {
        title,
        subtitle,
        description,
        heroImage,
        cards,
        tableRows,
        files,
        chartItems,
      } = req.body;

      const existing = await prisma.dataContent.findUnique({
        where: { slug },
      });

      const payload = {
        title: title || null,
        subtitle: subtitle || null,
        description: description || null,
        heroImage: heroImage || null,
        cards: ensureArray(cards),
        tableRows: ensureArray(tableRows),
        files: ensureArray(files),
        chartItems: ensureArray(chartItems),
      };

      const page = existing
        ? await prisma.dataContent.update({
            where: { slug },
            data: payload,
          })
        : await prisma.dataContent.create({
            data: {
              slug,
              ...payload,
            },
          });

      return res.status(200).json({
        success: true,
        message: "Lưu Data thành công",
        data: page,
      });
    } catch (error: any) {
      console.error("UPDATE DATA PAGE ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to save data page",
      });
    }
  }
);

export default router;