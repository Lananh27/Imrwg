"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuChild = {
  label: string;
  href: string;
};

type MenuItem = {
  label: string;
  href: string;
  children?: MenuChild[];
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Home", href: "/admin/home" },
  { label: "About us", href: "/admin/about" },
  { label: "Meetings", href: "/admin/meetings" },
  { label: "People", href: "/admin/people" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Maps", href: "/admin/maps" },
  {
    label: "Data",
    href: "/admin/data",
    children: [
      { label: "Conference data", href: "/admin/data/conference-data" },
      { label: "Data download", href: "/admin/data/data-download" },
    ],
  },
  { label: "Library", href: "/admin/library" },
  { label: "Education", href: "/admin/education" },
  { label: "News article", href: "/admin/attention" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-h-screen w-64 bg-black p-6 text-white">
      <h2 className="mb-8 text-2xl font-bold">Admin Panel</h2>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const hasChildren = Boolean(item.children?.length);

          const active = hasChildren
            ? pathname === item.href || pathname.startsWith(`${item.href}/`)
            : pathname === item.href;

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-lg px-4 py-3 transition ${
                  active
                    ? "bg-lime-400 font-semibold text-black"
                    : "hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>

              {hasChildren && active ? (
                <div className="mt-2 space-y-1 pl-4">
                  {item.children?.map((child) => {
                    const childActive = pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block rounded-lg px-4 py-2 text-sm transition ${
                          childActive
                            ? "bg-white font-semibold text-black"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}