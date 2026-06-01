"use client";

import Link from "next/link";

const dashboardItems = [
  {
    title: "Home",
    description: "Chỉnh sửa nội dung trang chủ",
    href: "/admin/home",
  },
  {
    title: "About us",
    description: "Quản lý phần giới thiệu",
    href: "/admin/about",
  },
  {
    title: "Meetings",
    description: "Quản lý danh sách cuộc họp",
    href: "/admin/meetings",
  },
  {
    title: "People",
    description: "Quản lý thành viên / speakers",
    href: "/admin/people",
  },
  {
    title: "Projects",
    description: "Quản lý dự án",
    href: "/admin/projects",
  },
  {
    title: "Maps",
    description: "Quản lý mục bản đồ",
    href: "/admin/maps",
  },
  {
    title: "Data",
    description: "Quản lý dữ liệu",
    href: "/admin/data",
  },
  {
    title: "News article",
    description: "Quản lý các mục Attention",
    href: "/admin/attention",
  },
  {
    title: "Education",
    description: "Quản lý mục giáo dục",
    href: "/admin/education",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[24px] font-bold text-[#1f2d3d]">Dashboard</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {dashboardItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-black/50 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h3 className="text-[18px] font-bold text-black">{item.title}</h3>
            <p className="mt-3 text-[16px] text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}