"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_URL, authFetch } from "@/lib/api";

type DailyVisit = {
  date: string;
  visits: number;
};

type TopPage = {
  path: string;
  visits: number;
};

type AnalyticsSummary = {
  totalVisits?: number;
  todayVisits?: number;
  uniqueVisitors?: number;
  topPages?: TopPage[];
  last7Days?: DailyVisit[];
};

const dashboardItems = [
  { title: "Home", description: "Trang chủ, header, footer", href: "/admin/home" },
  { title: "About us", description: "Giới thiệu, contact, partenaires", href: "/admin/about" },
  { title: "Meetings", description: "Cuộc họp và đăng ký", href: "/admin/meetings" },
  { title: "People", description: "Thành viên và speakers", href: "/admin/people" },
  { title: "Projects", description: "Dự án nghiên cứu", href: "/admin/projects" },
  { title: "Maps", description: "Bản đồ và địa điểm", href: "/admin/maps" },
  { title: "Data", description: "Dữ liệu và download", href: "/admin/data" },
  { title: "News article", description: "Attention posts", href: "/admin/attention" },
  { title: "Education", description: "Giáo dục và resources", href: "/admin/education" },
  { title: "Library", description: "Tài liệu và file", href: "/admin/library" },
];

function formatNumber(value?: number) {
  return new Intl.NumberFormat("vi-VN").format(value || 0);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLast7Days(source: DailyVisit[]) {
  const map = new Map(
    source.map((item) => [item.date.slice(0, 10), Number(item.visits) || 0])
  );

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));

    const key = toDateKey(date);

    return {
      date: key,
      label: date.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }),
      visits: map.get(key) || 0,
    };
  });
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError("");

        const res = await authFetch(`${API_URL}/api/analytics/summary`, {
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Không lấy được thống kê truy cập");
        }

        if (!cancelled) setSummary(data || {});
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Không lấy được thống kê truy cập");
          setSummary({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  const last7Days = useMemo(
    () => getLast7Days(summary.last7Days || []),
    [summary.last7Days]
  );

  const maxVisits = Math.max(1, ...last7Days.map((item) => item.visits));
  const weekTotal = last7Days.reduce((sum, item) => sum + item.visits, 0);
  const activeDays = last7Days.filter((item) => item.visits > 0).length;
  const topPages = Array.isArray(summary.topPages) ? summary.topPages : [];

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-lime-600">
              Website analytics
            </p>
            <h2 className="mt-2 text-[38px] font-black leading-tight text-slate-950">
              Dashboard
            </h2>
            <p className="mt-3 max-w-3xl text-[16px] leading-7 text-slate-500">
              Theo dõi lượt truy cập 7 ngày gần nhất, trang xem nhiều và tình trạng hoạt động website.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Khoảng thời gian
            </p>
            <p className="mt-1 text-xl font-black">7 ngày gần nhất</p>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            {error}
          </div>
        ) : null}

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold text-white/60">Tổng lượt truy cập</p>
            <p className="mt-4 text-4xl font-black">
              {loading ? "..." : formatNumber(summary.totalVisits)}
            </p>
          </div>

          <div className="rounded-[22px] bg-lime-300 p-6 text-slate-950">
            <p className="text-sm font-bold text-slate-700">Hôm nay</p>
            <p className="mt-4 text-4xl font-black">
              {loading ? "..." : formatNumber(summary.todayVisits)}
            </p>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-6">
            <p className="text-sm font-bold text-slate-500">Lượt trong 7 ngày</p>
            <p className="mt-4 text-4xl font-black text-slate-950">
              {loading ? "..." : formatNumber(weekTotal)}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              {activeDays} ngày có truy cập
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                Lượt truy cập 7 ngày
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-400">
                Mỗi cột tương ứng một ngày
              </p>
            </div>

            <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-500">
              Live từ backend
            </span>
          </div>

          <div className="mt-8 grid h-[330px] grid-cols-7 items-end gap-3">
            {last7Days.map((item) => {
              const height = Math.max(8, (item.visits / maxVisits) * 230);

              return (
                <div key={item.date} className="flex h-full flex-col items-center justify-end gap-3">
                  <div className="flex h-[245px] w-full items-end rounded-2xl bg-slate-100 px-2">
                    <div
                      className="w-full rounded-t-xl bg-lime-400 transition-all"
                      style={{ height }}
                      title={`${item.date}: ${item.visits} lượt`}
                    />
                  </div>
                  <p className="text-sm font-black text-slate-900">{item.visits}</p>
                  <p className="text-center text-xs font-semibold text-slate-400">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-black text-slate-950">Quản lý nội dung</h3>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {dashboardItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[18px] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-950 hover:shadow-lg"
            >
              <h4 className="text-[17px] font-black text-slate-950">
                {item.title}
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}