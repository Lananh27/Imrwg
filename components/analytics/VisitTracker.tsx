"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    const sessionKey = `visit-tracked:${path}`;

    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");

    const timer = window.setTimeout(() => {
      fetch(`${API_URL}/api/analytics/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
        keepalive: true,
      }).catch(() => {});
    }, 800);

    return () => window.clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}