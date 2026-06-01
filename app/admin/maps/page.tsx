"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type MapItem = {
  title: string;
  slug: string;
  topic: string;
  content: string;
  link: string;
  buttonText: string;
  publishedAt: string;
};

type HomeContent = {
  mapsSectionTitle?: string;
  mapsItems?: MapItem[];
};

const today = () => new Date().toISOString().slice(0, 10);

const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const emptyMap = (): MapItem => ({
  title: "",
  slug: "",
  topic: "",
  content: "",
  link: "",
  buttonText: "View Map",
  publishedAt: today(),
});

export default function AdminMapsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mapsSectionTitle, setMapsSectionTitle] = useState("Maps");
  const [mapsItems, setMapsItems] = useState<MapItem[]>([emptyMap()]);

  useEffect(() => {
    fetchMapsData();
  }, []);

  const fetchMapsData = async () => {
    try {
      setFetching(true);

      const res = await fetch(`${API_URL}/api/home`);
      const result = await res.json();
      const data: HomeContent = result?.data || result || {};

      setMapsSectionTitle(data.mapsSectionTitle || "Maps");

      setMapsItems(
        Array.isArray(data.mapsItems) && data.mapsItems.length > 0
          ? data.mapsItems.map((item: any) => ({
              title: item.title || "",
              slug: item.slug || createSlug(item.title || ""),
              topic: item.topic || "",
              content: item.content || "",
              link: item.link || item.embedUrl || "",
              buttonText: item.buttonText || "View Map",
              publishedAt: item.publishedAt || today(),
            }))
          : [emptyMap()]
      );
    } catch (error) {
      console.error("FETCH MAPS ERROR:", error);
      alert("Không lấy được dữ liệu Maps");
    } finally {
      setFetching(false);
    }
  };

  const updateMap = (index: number, field: keyof MapItem, value: string) => {
    const updated = [...mapsItems];

    if (field === "title") {
      updated[index] = {
        ...updated[index],
        title: value,
        slug: updated[index].slug || createSlug(value),
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }

    setMapsItems(updated);
  };

  const autoSlug = (index: number) => {
    const updated = [...mapsItems];

    updated[index] = {
      ...updated[index],
      slug: createSlug(updated[index].title),
    };

    setMapsItems(updated);
  };

  const addMap = () => {
    setMapsItems([...mapsItems, emptyMap()]);
  };

  const removeMap = (index: number) => {
    const updated = mapsItems.filter((_, i) => i !== index);
    setMapsItems(updated.length > 0 ? updated : [emptyMap()]);
  };

  const saveMaps = async () => {
    try {
      setLoading(true);

      const getRes = await fetch(`${API_URL}/api/home`);
      const getResult = await getRes.json();
      const currentData = getResult?.data || getResult || {};

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("adminToken") ||
        localStorage.getItem("accessToken");

      const cleanedMaps = mapsItems
        .filter(
          (item) =>
            item.title.trim() !== "" ||
            item.topic.trim() !== "" ||
            item.content.trim() !== "" ||
            item.link.trim() !== ""
        )
        .map((item) => ({
          title: item.title.trim(),
          slug: item.slug.trim() || createSlug(item.title),
          topic: item.topic.trim(),
          content: item.content.trim(),
          link: item.link.trim(),
          buttonText: item.buttonText.trim() || "View Map",
          publishedAt: item.publishedAt || today(),
        }));

      const body = {
        ...currentData,
        mapsSectionTitle,
        mapsItems: cleanedMaps,
      };

      const res = await fetch(`${API_URL}/api/home`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Lưu Maps thất bại");
      }

      alert("Lưu Maps thành công");
      fetchMapsData();
    } catch (error) {
      console.error("SAVE MAPS ERROR:", error);
      alert(error instanceof Error ? error.message : "Lưu Maps thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 pb-28">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Quản lý Maps
              </h1>

              <p className="mt-2 text-[16px] text-slate-500">
                Thêm map, chủ đề, link nhúng và nội dung hiển thị ngoài
                frontend.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={addMap}
                className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-green-700"
              >
                + Thêm map
              </button>

              <button
                type="button"
                onClick={saveMaps}
                disabled={loading}
                className="rounded-xl bg-red-600 px-8 py-3 font-extrabold text-white shadow-lg ring-2 ring-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang lưu..." : "Lưu Maps"}
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {fetching && (
          <div className="rounded-2xl bg-white p-5 text-slate-500 shadow-sm">
            Đang tải dữ liệu Maps...
          </div>
        )}

        {/* Section title */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <label className="mb-2 block font-semibold text-slate-700">
            Tiêu đề trang Maps ngoài frontend
          </label>

          <input
            value={mapsSectionTitle}
            onChange={(e) => setMapsSectionTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[16px] outline-none focus:border-[#0f6fb8]"
            placeholder="Maps"
          />
        </div>

        {/* Maps list */}
        <div className="space-y-6">
          {mapsItems.map((item, index) => (
            <div key={index} className="rounded-2xl bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Map {index + 1}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Nhập thông tin cho map này.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeMap(index)}
                  className="w-fit rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
                >
                  Xóa map
                </button>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold text-slate-700">
                    Tiêu đề map
                  </label>

                  <input
                    value={item.title}
                    onChange={(e) => updateMap(index, "title", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[16px] outline-none focus:border-[#0f6fb8]"
                    placeholder="Ví dụ: Conference Location Map"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-700">
                    Chủ đề map
                  </label>

                  <input
                    value={item.topic}
                    onChange={(e) => updateMap(index, "topic", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[16px] outline-none focus:border-[#0f6fb8]"
                    placeholder="Ví dụ: Conference Venue"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-700">
                    Slug đường dẫn
                  </label>

                  <div className="flex gap-2">
                    <input
                      value={item.slug}
                      onChange={(e) =>
                        updateMap(index, "slug", createSlug(e.target.value))
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[16px] outline-none focus:border-[#0f6fb8]"
                      placeholder="conference-location-map"
                    />

                    <button
                      type="button"
                      onClick={() => autoSlug(index)}
                      className="rounded-xl bg-slate-800 px-4 py-3 font-semibold text-white transition hover:bg-slate-700"
                    >
                      Auto
                    </button>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    Link chi tiết: /maps/{item.slug || "slug-map"}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-700">
                    Ngày đăng
                  </label>

                  <input
                    type="date"
                    value={item.publishedAt || ""}
                    onChange={(e) =>
                      updateMap(index, "publishedAt", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[16px] outline-none focus:border-[#0f6fb8]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block font-semibold text-slate-700">
                    Link nhúng Google Map
                  </label>

                  <input
                    value={item.link}
                    onChange={(e) => updateMap(index, "link", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[16px] outline-none focus:border-[#0f6fb8]"
                    placeholder="Dán link src của iframe Google Maps"
                  />

                  <p className="mt-2 text-sm text-slate-500">
                    Google Maps → Share → Embed a map → copy phần <b>src</b>{" "}
                    trong iframe.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-700">
                    Text nút bấm
                  </label>

                  <input
                    value={item.buttonText}
                    onChange={(e) =>
                      updateMap(index, "buttonText", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[16px] outline-none focus:border-[#0f6fb8]"
                    placeholder="View Map"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-700">
                    Trạng thái
                  </label>

                  <div className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-[16px] text-slate-600">
                    {item.link ? "Đã có link map" : "Chưa có link map"}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block font-semibold text-slate-700">
                    Nội dung mô tả
                  </label>

                  <textarea
                    value={item.content}
                    onChange={(e) =>
                      updateMap(index, "content", e.target.value)
                    }
                    className="min-h-[130px] w-full rounded-xl border border-slate-300 px-4 py-3 text-[16px] outline-none focus:border-[#0f6fb8]"
                    placeholder="Nhập mô tả ngắn cho map..."
                  />
                </div>

                {item.link && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block font-semibold text-slate-700">
                      Preview map
                    </label>

                    <div className="h-[300px] overflow-hidden rounded-xl border border-slate-300 bg-slate-100">
                      <iframe
                        src={item.link}
                        title={item.title || `Map ${index + 1}`}
                        className="h-full w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Thanh lưu ở cuối nội dung */}
        <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-medium text-slate-600">
              Sau khi nhập xong, bấm nút đỏ để lưu và hiển thị Maps ngoài
              frontend.
            </p>

            <button
              type="button"
              onClick={saveMaps}
              disabled={loading}
              className="rounded-xl bg-red-600 px-8 py-3 font-extrabold text-white shadow-lg ring-2 ring-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang lưu..." : "Lưu Maps"}
            </button>
          </div>
        </div>
      </div>

      {/* Nút lưu nổi cố định */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          type="button"
          onClick={saveMaps}
          disabled={loading}
          className="rounded-full bg-red-600 px-10 py-5 text-[18px] font-extrabold text-white shadow-2xl ring-4 ring-red-200 transition hover:scale-105 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Đang lưu..." : "Lưu Maps"}
        </button>
      </div>
    </div>
  );
}
