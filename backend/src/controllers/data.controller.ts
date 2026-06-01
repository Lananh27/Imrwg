import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const getAllDataItems = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const items = await prisma.dataItem.findMany({
      where: {
        isPublished: true,
        ...(category ? { category: String(category) } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to get data items", error });
  }
};

export const getAdminDataItems = async (_req: Request, res: Response) => {
  try {
    const items = await prisma.dataItem.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to get admin data items", error });
  }
};

export const getDataItemBySlug = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    const item = await prisma.dataItem.findUnique({
      where: { slug },
    });

    if (!item) {
      return res.status(404).json({ message: "Data item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to get data item", error });
  }
};

export const createDataItem = async (req: Request, res: Response) => {
  try {
    const {
      title,
      category,
      description,
      value,
      unit,
      fileUrl,
      imageUrl,
      year,
      isPublished,
    } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        message: "Title, category and description are required",
      });
    }

    const baseSlug = createSlug(title);
    let slug = baseSlug;
    let count = 1;

    while (await prisma.dataItem.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const item = await prisma.dataItem.create({
      data: {
        title,
        slug,
        category,
        description,
        value,
        unit,
        fileUrl,
        imageUrl,
        year: year ? Number(year) : null,
        isPublished: isPublished ?? true,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create data item", error });
  }
};

export const updateDataItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      title,
      category,
      description,
      value,
      unit,
      fileUrl,
      imageUrl,
      year,
      isPublished,
    } = req.body;

    const item = await prisma.dataItem.update({
      where: { id: Number(id) },
      data: {
        title,
        category,
        description,
        value,
        unit,
        fileUrl,
        imageUrl,
        year: year ? Number(year) : null,
        isPublished,
      },
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update data item", error });
  }
};

export const deleteDataItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.dataItem.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Data item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete data item", error });
  }
};