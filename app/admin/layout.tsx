"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

type AdminUser = {
  id?: number;
  email?: string;
  role?: string;
};

type MenuItem = {
  key: string;
  label: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "home", label: "Home", href: "/admin/home" },
  { key: "about", label: "About us", href: "/admin/about" },
  { key: "meetings", label: "Meetings", href: "/admin/meetings" },
  { key: "people", label: "People", href: "/admin/people" },
  { key: "projects", label: "Projects", href: "/admin/projects" },
  { key: "maps", label: "Maps", href: "/admin/maps" },
  { key: "data", label: "Data", href: "/admin/data" },
  { key: "library", label: "Library", href: "/admin/library" },
  { key: "education", label: "Education", href: "/admin/education" },
  { key: "attention", label: "News article", href: "/admin/attention" },
];

function isTokenExpired(token: string) {
  try {
    const payloadBase64 = token.split(".")[1];

    if (!payloadBase64) {
      return false;
    }

    const payload = JSON.parse(atob(payloadBase64));

    if (!payload?.exp) {
      return false;
    }

    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}

function clearAdminSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("accessToken");
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setUser(null);
      setChecked(true);
      return;
    }

    setChecked(false);

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("accessToken");
    const rawUser = localStorage.getItem("user");

    if (!token) {
      clearAdminSession();
      if (pathname !== "/admin/login") router.replace("/admin/login");
      return;
    }

    if (isTokenExpired(token)) {
      clearAdminSession();
      if (pathname !== "/admin/login") router.replace("/admin/login");
      return;
    }

    const sessionToken = token;

    let parsedUser: AdminUser | null = null;

    try {
      parsedUser = rawUser ? JSON.parse(rawUser) : null;
    } catch {
      parsedUser = null;
    }

    if (parsedUser?.role && parsedUser.role !== "ADMIN") {
      clearAdminSession();
      if (pathname !== "/admin/login") router.replace("/admin/login");
      return;
    }

    let cancelled = false;

    async function verifySession() {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || data?.user?.role !== "ADMIN") {
          clearAdminSession();
          if (!cancelled) setChecked(false);
          if (pathname !== "/admin/login") router.replace("/admin/login");
          return;
        }

        if (!cancelled) {
          const verifiedUser = {
            ...parsedUser,
            ...data.user,
          };

          localStorage.setItem("token", sessionToken);
          localStorage.setItem("user", JSON.stringify(verifiedUser));
          setUser(verifiedUser);
          setChecked(true);
        }
      } catch {
        clearAdminSession();
        if (!cancelled) setChecked(false);
        if (pathname !== "/admin/login") router.replace("/admin/login");
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [isLoginPage, router, pathname]);

  function handleLogout() {
    clearAdminSession();
    router.replace("/admin/login");
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#efefef]">
        <div className="rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-500 shadow-sm">
          Đang kiểm tra đăng nhập...
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#efefef]">
      <div className="flex min-h-screen">
        <aside className="fixed left-0 top-0 z-30 h-screen w-[250px] overflow-y-auto bg-black text-white">
          <div className="px-6 py-6">
            <div className="text-[24px] font-black">Admin Panel</div>

            {user?.email ? (
              <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-white/50">
                  Signed in
                </p>
                <p className="mt-1 break-all text-sm font-semibold text-white">
                  {user.email}
                </p>
              </div>
            ) : null}
          </div>

          <nav className="space-y-2 px-4 pb-6">
            {menuItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-[16px] transition ${
                    active
                      ? "bg-lime-400 font-semibold text-black"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="ml-[250px] flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-start justify-between border-b border-black/10 bg-[#efefef]/95 px-8 py-5 backdrop-blur">
            <div>
              <h1 className="text-[22px] font-black text-[#1f2d3d]">
                Quản trị website
              </h1>
              <p className="text-[14px] text-gray-500">
                Quản lý nội dung toàn bộ website IMRWG
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-black px-5 py-3 text-[16px] font-semibold transition hover:bg-black hover:text-white"
            >
              Đăng xuất
            </button>
          </header>

          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
