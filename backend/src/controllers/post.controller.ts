// backend/src/controllers/post.controller.ts

import { Request, Response } from "express";

// Giả lập dữ liệu bài viết (thay thế bằng dữ liệu thật từ cơ sở dữ liệu của bạn)
const posts = [
  { id: "1", title: "Bài viết 1", content: "Nội dung bài viết 1" },
  { id: "2", title: "Bài viết 2", content: "Nội dung bài viết 2" },
];

// Hàm để lấy bài viết theo ID
export const getPostById = (req: Request, res: Response) => {
  const { id } = req.params;

  // Tìm bài viết trong mảng giả lập (thay thế bằng truy vấn cơ sở dữ liệu thực tế)
  const post = posts.find((post) => post.id === id);

  // Nếu không tìm thấy bài viết, trả về lỗi 404
  if (!post) {
    return res.status(404).json({ message: "Bài viết không tồn tại" });
  }

  // Nếu tìm thấy bài viết, trả về dữ liệu bài viết
  res.json(post);
};