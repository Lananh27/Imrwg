import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

function ensureArray(value: any) {
  return Array.isArray(value) ? value : [];
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    let education = await prisma.educationContent.findFirst({
      where: { slug: "main-education" },
    });

    if (!education) {
      education = await prisma.educationContent.create({
        data: {
          slug: "main-education",
          heroBadge: "Education",
          heroTitle: "Learning for a Resilient Mekong Future",
          heroSubtitle:
            "Training, resources, and collaborative learning opportunities for researchers, students, and institutions.",
          heroDescription:
            "Explore educational materials, featured programs, and upcoming learning activities curated by IMRWG.",
          heroImage: null,
          stats: [
            { value: "12+", label: "Learning modules", note: "Updated regularly" },
            { value: "08", label: "Partner institutions", note: "Collaborative network" },
            { value: "500+", label: "Learners reached", note: "Students & professionals" },
          ],
          featuredPrograms: [
            {
              title: "GIS & Remote Sensing",
              description:
                "Foundational and applied learning content for spatial analysis, environmental monitoring, and Mekong research.",
              image: "",
              tag: "Featured",
              link: "",
            },
            {
              title: "Climate & Water Systems",
              description:
                "Interdisciplinary educational content focused on climate risks, water governance, and resilience.",
              image: "",
              tag: "New",
              link: "",
            },
            {
              title: "Research Methods",
              description:
                "Practical academic and field-based methods for young researchers and technical experts.",
              image: "",
              tag: "Popular",
              link: "",
            },
          ],
          resourceItems: [
            {
              title: "Training handbook",
              description: "Downloadable study materials and practical reference resources.",
              type: "Guide",
              image: "",
              link: "",
            },
            {
              title: "Lecture slides",
              description: "Presentation decks and teaching materials for classrooms and workshops.",
              type: "Slides",
              image: "",
              link: "",
            },
            {
              title: "Learning video",
              description: "Short-form educational video content and explainers.",
              type: "Video",
              image: "",
              link: "",
            },
          ],
          timelineItems: [
            {
              time: "May 2026",
              title: "Student workshop",
              description: "Hands-on practical session for research students and early career scholars.",
            },
            {
              time: "July 2026",
              title: "Open lecture series",
              description: "A public lecture connecting education with Mekong sustainability challenges.",
            },
            {
              time: "September 2026",
              title: "Field methods bootcamp",
              description: "Applied research and data collection activities with partner institutions.",
            },
          ],
          ctaTitle: "Ready to learn with IMRWG?",
          ctaDescription:
            "Join educational activities, access curated learning resources, and collaborate with our network.",
          ctaButtonText: "Explore more",
          ctaButtonLink: "/about",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: education,
    });
  } catch (error: any) {
    console.error("GET EDUCATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch education content",
    });
  }
});

router.put(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        heroBadge,
        heroTitle,
        heroSubtitle,
        heroDescription,
        heroImage,
        stats,
        featuredPrograms,
        resourceItems,
        timelineItems,
        ctaTitle,
        ctaDescription,
        ctaButtonText,
        ctaButtonLink,
      } = req.body;

      const existing = await prisma.educationContent.findFirst({
        where: { slug: "main-education" },
      });

      const payload = {
        heroBadge: heroBadge || null,
        heroTitle: heroTitle || null,
        heroSubtitle: heroSubtitle || null,
        heroDescription: heroDescription || null,
        heroImage: heroImage || null,

        stats: ensureArray(stats),
        featuredPrograms: ensureArray(featuredPrograms),
        resourceItems: ensureArray(resourceItems),
        timelineItems: ensureArray(timelineItems),

        ctaTitle: ctaTitle || null,
        ctaDescription: ctaDescription || null,
        ctaButtonText: ctaButtonText || null,
        ctaButtonLink: ctaButtonLink || null,
      };

      let education;

      if (existing) {
        education = await prisma.educationContent.update({
          where: { id: existing.id },
          data: payload,
        });
      } else {
        education = await prisma.educationContent.create({
          data: {
            slug: "main-education",
            ...payload,
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: "Education content saved successfully",
        data: education,
      });
    } catch (error: any) {
      console.error("UPDATE EDUCATION ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to save education content",
      });
    }
  }
);

export default router;