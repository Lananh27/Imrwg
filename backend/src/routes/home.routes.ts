import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

const HOME_SLUG = "main-home";

// GET public home content
router.get("/", async (_req: Request, res: Response) => {
  try {
    const home = await prisma.homeContent.findFirst({
      where: { slug: HOME_SLUG },
    });

    return res.status(200).json({
      success: true,
      data: home,
    });
  } catch (error: any) {
    console.error("GET HOME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch home content",
    });
  }
});

// UPDATE home content
router.put(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        siteName,
        headerLogo,
        welcomeTitle,
        welcomeText,
        marqueeText,

        heroImage,
        heroTitle,
        heroDescription,
        heroButtonText,
        heroButtonLink,
        heroSlides,

        infoItems,
        attentionItems,
        partnerLogos,

        projectsSectionTitle,
        projectsItems,

        mapsSectionTitle,
        mapsItems,

        footerMailingText,
        footerContactText,
        footerSocialText,
        footerLogo,
      } = req.body;

      const data = {
        siteName: siteName ?? null,
        headerLogo: headerLogo ?? null,
        welcomeTitle: welcomeTitle ?? null,
        welcomeText: welcomeText ?? null,
        marqueeText: marqueeText ?? null,

        heroImage: heroImage ?? null,
        heroTitle: heroTitle ?? null,
        heroDescription: heroDescription ?? null,
        heroButtonText: heroButtonText ?? null,
        heroButtonLink: heroButtonLink ?? null,
        heroSlides: heroSlides ?? null,

        infoItems: infoItems ?? null,
        attentionItems: attentionItems ?? null,
        partnerLogos: partnerLogos ?? null,

        projectsSectionTitle: projectsSectionTitle ?? null,
        projectsItems: projectsItems ?? null,

        mapsSectionTitle: mapsSectionTitle ?? null,
        mapsItems: mapsItems ?? null,

        footerMailingText: footerMailingText ?? null,
        footerContactText: footerContactText ?? null,
        footerSocialText: footerSocialText ?? null,
        footerLogo: footerLogo ?? null,
      };

      const existingHome = await prisma.homeContent.findFirst({
        where: { slug: HOME_SLUG },
      });

      let home;

      if (existingHome) {
        home = await prisma.homeContent.update({
          where: { id: existingHome.id },
          data,
        });
      } else {
        home = await prisma.homeContent.create({
          data: {
            slug: HOME_SLUG,
            ...data,
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: "Home content saved successfully",
        data: home,
      });
    } catch (error: any) {
      console.error("UPDATE HOME ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to save home content",
      });
    }
  }
);

export default router;