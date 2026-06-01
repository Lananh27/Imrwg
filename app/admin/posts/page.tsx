"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-roym.onrender.com";

export default function AdminPostsPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const savePost = async () => {
    const token = localStorage.getItem("adminToken"); // Lấy token từ localStorage

    if (!token) {
      alert("Bạn chưa đăng nhập hoặc token không hợp lệ!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("content", content);
    if (coverImage) formData.append("coverImage", coverImage);

    const res = await fetch(`${API_URL}/api/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Gửi token trong header
      },
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || "Tạo bài thất bại");
      return;
    }

    alert("Tạo bài thành công");
    setTitle("");
    setSlug("");
    setContent("");
    setCoverImage(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Quản lý bài viết</h1>

      <section className="mt-6 space-y-6">
        <div>
          <label className="block font-medium">Tiêu đề</label>
          <input
            className="w-full rounded p-3 border"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Slug</label>
          <input
            className="w-full rounded p-3 border"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug-bai-viet"
          />
        </div>

        <div>
          <label className="block font-medium">Nội dung bài viết</label>
          <textarea
            className="w-full rounded p-3 border"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </div>

        <div>
          <label className="block font-medium">Ảnh đại diện</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
          />
        </div>

        <button
          type="button"
          className="px-6 py-3 bg-black text-white rounded"
          onClick={savePost}
        >
          Lưu bài viết
        </button>
      </section>
    </div>
  );
}