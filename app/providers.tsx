"use client";

import { ReactNode, Suspense } from "react";
import VisitTracker from "@/components/analytics/VisitTracker";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <VisitTracker />
      </Suspense>
      {children}
    </>
  );
}
