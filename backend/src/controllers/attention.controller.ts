import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Create new Attention item
export const createAttention = async (req: Request, res: Response) => {
  const { title, content } = req.body;
  try {
    // Kiểm tra dữ liệu đầu vào
    if (typeof title !== 'string' || typeof content !== 'string') {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const newAttention = await prisma.attention.create({
      data: {
        title,
        content,
      },
    });
    res.status(201).json(newAttention);
  } catch (error) {
    console.error(error);  // In ra lỗi để dễ dàng debug
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Get all Attention items
export const getAllAttention = async (req: Request, res: Response) => {
  try {
    const attentionItems = await prisma.attention.findMany();
    res.json(attentionItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Update Attention item
export const updateAttention = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;

  // Kiểm tra kiểu dữ liệu của title và content
  if (typeof title !== 'string' || typeof content !== 'string') {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    // Kiểm tra nếu id có thể chuyển thành số hợp lệ
    const parsedId = parseInt(Array.isArray(id) ? id[0] : id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const updatedAttention = await prisma.attention.update({
      where: { id: parsedId },
      data: { title, content },
    });
    res.json(updatedAttention);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Delete Attention item
export const deleteAttention = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Kiểm tra ID hợp lệ
  const parsedId = parseInt(Array.isArray(id) ? id[0] : id);
  if (isNaN(parsedId)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    await prisma.attention.delete({
      where: { id: parsedId },
    });
    res.status(204).send();  // No content response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};