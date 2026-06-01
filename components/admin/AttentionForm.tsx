"use client";

import { useEffect, useMemo, useState } from "react";
import { getHomeContent, updateHomeContent, uploadImage } from "@/lib/api";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type ArticleStatus = "draft" | "published";

type AttentionItem = {
  title: string;
  content: string;
  postSlug: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  status?: ArticleStatus;
};

type HomeContent = {
  attentionItems?: AttentionItem[];
  [key: string]: any;
};

const emptyArticle = (): AttentionItem => ({
  title: "",
  content: "",
  postSlug: "",
  excerpt: "",
  category: "",
  coverImage: "",
  status: "draft",
});

export default function AttentionForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [articles, setArticles] = useState<AttentionItem[]>([emptyArticle()]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const activeArticle = articles[activeIndex] || emptyArticle();

  useEffect(() => {
    fetchArticleData();
  }, []);

  const fetchArticleData = async () => {
    try {
      setLoading(true);

      const result = await getHomeContent();
      const data: HomeContent = result?.data || result || {};

      if (Array.isArray(data.attentionItems) && data.attentionItems.length > 0) {
        const normalized = data.attentionItems.map((item) => ({
          title: item.title || "",
          content: item.content || "",
          postSlug: item.postSlug || "",
          excerpt: item.excerpt || "",
          category: item.category || "",
          coverImage: item.coverImage || "",
          status: item.status || "draft",
        }));

        setArticles(normalized);
        setActiveIndex(0);
      } else {
        setArticles([emptyArticle()]);
        setActiveIndex(0);
      }
    } catch (error) {
      console.error("FETCH ARTICLE ERROR:", error);
      alert("Không lấy được dữ liệu Article");
    } finally {
      setLoading(false);
    }
  };

  const makeSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const updateArticle = (
    index: number,
    field: keyof AttentionItem,
    value: string
  ) => {
    setArticles((current) => {
      const updated = [...current];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      if (field === "title") {
        updated[index].postSlug = makeSlug(value);
      }

      return updated;
    });
  };

  const addArticle = () => {
    setArticles((current) => {
      const next = [...current, emptyArticle()];
      setActiveIndex(next.length - 1);
      return next;
    });
  };

  const duplicateArticle = () => {
    setArticles((current) => {
      const source = current[activeIndex] || emptyArticle();

      const copied: AttentionItem = {
        ...source,
        title: source.title ? `${source.title} copy` : "Untitled copy",
        postSlug: source.postSlug
          ? `${source.postSlug}-copy`
          : `untitled-copy-${Date.now()}`,
        status: "draft",
      };

      const next = [...current, copied];
      setActiveIndex(next.length - 1);
      return next;
    });
  };

  const removeArticle = (index: number) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa bài viết này?");
    if (!confirmDelete) return;

    setArticles((current) => {
      const updated = current.filter((_, i) => i !== index);
      const safeArticles = updated.length > 0 ? updated : [emptyArticle()];

      setActiveIndex((currentIndex) => {
        if (index === currentIndex) return 0;
        if (index < currentIndex) return Math.max(currentIndex - 1, 0);
        return Math.min(currentIndex, safeArticles.length - 1);
      });

      return safeArticles;
    });
  };

  const handleUploadCover = async (index: number, file: File) => {
    try {
      setLoading(true);

      const result = await uploadImage(file);

      if (!result?.url) {
        throw new Error("Upload thành công nhưng không nhận được URL ảnh");
      }

      updateArticle(index, "coverImage", result.url);
    } catch (error: any) {
      console.error("COVER UPLOAD ERROR:", error);
      alert(error?.message || "Upload ảnh bìa thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleInsertImage = (index: number) => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        setLoading(true);

        const result = await uploadImage(file);
        const imageUrl = result?.url;

        if (!imageUrl) {
          throw new Error("Upload thành công nhưng không nhận được URL ảnh");
        }

        const currentContent = articles[index]?.content || "";
        const imageHtml = `<p><img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto; border-radius: 14px;" /></p>`;

        updateArticle(index, "content", `${currentContent}${imageHtml}`);
      } catch (error: any) {
        console.error("EDITOR IMAGE UPLOAD ERROR:", error);
        alert(error?.message || "Upload ảnh vào nội dung thất bại");
      } finally {
        setLoading(false);
      }
    };
  };

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
];

  const saveArticles = async () => {
    try {
      setSaving(true);

      const cleanedArticles = articles
        .map((item) => ({
          title: item.title?.trim() || "",
          content: item.content || "",
          postSlug: item.postSlug?.trim() || makeSlug(item.title || ""),
          excerpt: item.excerpt?.trim() || "",
          category: item.category?.trim() || "",
          coverImage: item.coverImage || "",
          status: item.status || "draft",
        }))
        .filter(
          (item) =>
            item.title !== "" ||
            item.content.trim() !== "" ||
            item.postSlug !== ""
        );

      const result = await getHomeContent();
      const currentData = result?.data || result || {};

      await updateHomeContent({
        ...currentData,
        attentionItems: cleanedArticles,
      });

      alert("Lưu bài viết thành công");
      await fetchArticleData();
    } catch (error: any) {
      console.error("SAVE ARTICLE ERROR:", error);
      alert(error?.message || "Lưu bài viết thất bại");
    } finally {
      setSaving(false);
    }
  };

  const clearOldLocalImages = () => {
    const cleaned = articles.map((item) => ({
      ...item,
      content: item.content.replace(
        /<p><img[^>]+src=["']\/uploads\/[^"']+["'][^>]*><\/p>/g,
        ""
      ),
    }));

    setArticles(cleaned);
    alert("Đã xóa các ảnh local /uploads cũ. Bấm Lưu bài viết để lưu lại.");
  };

  const filteredArticles = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return articles
      .map((article, index) => ({ article, index }))
      .filter(({ article }) => {
        if (!keyword) return true;

        return (
          article.title.toLowerCase().includes(keyword) ||
          article.postSlug.toLowerCase().includes(keyword) ||
          (article.category || "").toLowerCase().includes(keyword)
        );
      });
  }, [articles, searchText]);

  const wordCount = useMemo(() => {
    const text = activeArticle.content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) return 0;

    return text.split(" ").length;
  }, [activeArticle.content]);

  return (
    <div className="max-w-[1500px]">
      <div className="mb-8 rounded-[28px] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-950">
              Quản lý Article
            </h1>
            <p className="mt-2 text-slate-500">
              Viết bài, chỉnh slug, thêm ảnh bìa, lưu nháp hoặc xuất bản nội dung.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={clearOldLocalImages}
              disabled={loading || saving}
              className="rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              Xóa ảnh local cũ
            </button>

            <button
              type="button"
              onClick={addArticle}
              disabled={loading || saving}
              className="rounded-2xl bg-lime-400 px-5 py-3 font-black text-black disabled:opacity-60"
            >
              + Thêm bài
            </button>

            <button
              type="button"
              onClick={saveArticles}
              disabled={loading || saving}
              className="rounded-2xl bg-black px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu bài viết"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border bg-white p-5 shadow-sm xl:sticky xl:top-6 xl:self-start">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm bài viết..."
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-black"
          />

          <div className="mt-4 rounded-2xl bg-slate-100 p-4">
            <p className="font-black text-slate-900">{articles.length} bài viết</p>
            <p className="mt-1 text-sm text-slate-500">
              Chọn một bài để chỉnh sửa.
            </p>
          </div>

          <div className="mt-4 max-h-[720px] space-y-3 overflow-y-auto pr-1">
            {filteredArticles.map(({ article, index }) => {
              const active = activeIndex === index;

              return (
                <button
                  key={`${article.postSlug}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-lime-400 bg-lime-400 text-black"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="max-h-[54px] overflow-hidden text-base font-black leading-6">
                        {article.title || `Bài ${index + 1}`}
                      </p>

                      <p
                        className={`mt-2 break-all text-xs leading-5 ${
                          active ? "text-black/70" : "text-slate-500"
                        }`}
                      >
                        /{article.postSlug || "chua-co-slug"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${
                        article.status === "published"
                          ? active
                            ? "bg-black text-white"
                            : "bg-green-100 text-green-700"
                          : active
                          ? "bg-white text-black"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {article.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredArticles.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-center text-sm text-slate-500">
                Không tìm thấy bài viết.
              </div>
            ) : null}
          </div>
        </aside>

        <section className="min-w-0 rounded-[28px] border bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-600">
                Đang chỉnh bài viết
              </p>

              <h2 className="mt-2 max-w-4xl text-3xl font-black leading-tight text-slate-950">
                {activeArticle.title || `Bài ${activeIndex + 1}`}
              </h2>

              <p className="mt-2 break-all text-sm leading-6 text-slate-500">
                {wordCount} từ · Slug: /{activeArticle.postSlug || "chua-co-slug"}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowPreview((prev) => !prev)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                {showPreview ? "Tắt preview" : "Preview"}
              </button>

              <button
                type="button"
                onClick={duplicateArticle}
                disabled={loading || saving}
                className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                Nhân bản
              </button>

              <button
                type="button"
                onClick={() => removeArticle(activeIndex)}
                disabled={loading || saving}
                className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                Xóa bài
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border bg-slate-50 p-5">
              <h3 className="mb-5 text-xl font-black text-slate-900">
                Thông tin bài viết
              </h3>

              <div className="grid gap-5 lg:grid-cols-2">
                <Field className="lg:col-span-2">
                  <Label>Tiêu đề bài viết</Label>
                  <input
                    value={activeArticle.title}
                    onChange={(e) =>
                      updateArticle(activeIndex, "title", e.target.value)
                    }
                    placeholder="Nhập tiêu đề bài viết"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-black"
                  />
                </Field>

                <Field>
                  <Label>Slug URL</Label>
                  <div className="flex gap-2">
                    <input
                      value={activeArticle.postSlug}
                      onChange={(e) =>
                        updateArticle(activeIndex, "postSlug", e.target.value)
                      }
                      placeholder="vi-du-ten-bai-viet"
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-black"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        updateArticle(
                          activeIndex,
                          "postSlug",
                          makeSlug(activeArticle.title)
                        )
                      }
                      className="shrink-0 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
                    >
                      Tạo lại
                    </button>
                  </div>
                </Field>

                <Field>
                  <Label>Category</Label>
                  <input
                    value={activeArticle.category || ""}
                    onChange={(e) =>
                      updateArticle(activeIndex, "category", e.target.value)
                    }
                    placeholder="News, Event, Research..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-black"
                  />
                </Field>

                <Field>
                  <Label>Trạng thái</Label>
                  <select
                    value={activeArticle.status || "draft"}
                    onChange={(e) =>
                      updateArticle(
                        activeIndex,
                        "status",
                        e.target.value as ArticleStatus
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </Field>

                <Field className="lg:col-span-2">
                  <Label>Mô tả ngắn</Label>
                  <textarea
                    value={activeArticle.excerpt || ""}
                    onChange={(e) =>
                      updateArticle(activeIndex, "excerpt", e.target.value)
                    }
                    placeholder="Nhập mô tả ngắn cho bài viết"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-black"
                  />
                </Field>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
  <div className="rounded-[24px] border bg-slate-50 p-5">
    <h3 className="mb-4 text-xl font-black text-slate-900">
      Ảnh bìa
    </h3>

    {activeArticle.coverImage ? (
      <img
        src={activeArticle.coverImage}
        alt="Cover"
        className="mb-4 h-64 w-full rounded-2xl object-cover"
      />
    ) : (
      <div className="mb-4 flex h-64 items-center justify-center rounded-2xl border border-dashed bg-white text-sm text-slate-400">
        Chưa có ảnh bìa
      </div>
    )}

    <div className="flex flex-wrap gap-3">
      <label className="cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white">
        Upload ảnh bìa
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            await handleUploadCover(activeIndex, file);
          }}
        />
      </label>

      {activeArticle.coverImage ? (
        <button
          type="button"
          onClick={() =>
            updateArticle(activeIndex, "coverImage", "")
          }
          className="rounded-xl bg-red-500 px-4 py-3 font-semibold text-white"
        >
          Xóa ảnh bìa
        </button>
      ) : null}
    </div>
  </div>

  <div className="rounded-[24px] border bg-slate-50 p-5">
    <h3 className="mb-4 text-xl font-black text-slate-900">
      Tóm tắt nhanh
    </h3>

    <div className="grid gap-4 sm:grid-cols-2">
      <SummaryBox label="Số từ" value={`${wordCount}`} />
      <SummaryBox
        label="Trạng thái"
        value={
          activeArticle.status === "published"
            ? "Published"
            : "Draft"
        }
      />
      <SummaryBox
        label="Category"
        value={activeArticle.category || "Chưa nhập"}
      />
      <SummaryBox
        label="Slug"
        value={`/${activeArticle.postSlug || "chua-co-slug"}`}
      />
    </div>

    <div className="mt-5 rounded-2xl bg-white p-4 text-sm leading-7 text-slate-500">
      Sau khi chỉnh xong, bấm <b>Lưu bài viết</b> ở góc trên để lưu
      toàn bộ danh sách bài.
    </div>
  </div>
</div>

            <div className="rounded-[24px] border bg-white p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Nội dung bài viết
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Editor được mở rộng để viết nội dung dài dễ nhìn hơn.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleInsertImage(activeIndex)}
                  disabled={loading || saving}
                  className="w-fit rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
                >
                  Upload ảnh vào nội dung
                </button>
              </div>

              <div className="article-editor overflow-hidden rounded-2xl border bg-white">
  <ReactQuill
    theme="snow"
    value={activeArticle.content}
    onChange={(value) =>
      updateArticle(activeIndex, "content", value)
    }
    modules={quillModules}
    formats={quillFormats}
    placeholder="Nhập nội dung bài viết..."
  />
</div>
            </div>

            {showPreview ? (
              <div className="rounded-[24px] border bg-slate-50 p-6">
                <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                  Preview
                </p>

                <article className="max-w-none">
                  <h1 className="text-4xl font-black leading-tight text-slate-950">
                    {activeArticle.title || "Chưa có tiêu đề"}
                  </h1>

                  {activeArticle.excerpt ? (
                    <p className="mt-4 text-lg leading-8 text-slate-500">
                      {activeArticle.excerpt}
                    </p>
                  ) : null}

                  <div
  className="article-preview-content mt-8 rounded-2xl bg-white p-6 text-[18px] leading-8 text-slate-700"
  dangerouslySetInnerHTML={{
    __html:
      activeArticle.content ||
      "<p>Chưa có nội dung bài viết.</p>",
  }}
/>
                </article>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {(loading || saving) && (
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Đang xử lý...
        </p>
      )}
    </div>
  );
}

function Field({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block font-semibold">{children}</label>;
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-lg font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}