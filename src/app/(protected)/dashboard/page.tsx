"use client";

import { Suspense } from "react";
import { BreadcrumbUpdater } from "@/contexts/breadcrumb";

const breadcrumbItems = [
  {
    label: "Home",
    href: "/dashboard",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
  },
];

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="w-full">
        <BreadcrumbUpdater items={breadcrumbItems} />

        <main className="flex flex-col gap-8">
          <div>Dashboard</div>
        </main>
      </div>
    </Suspense>
  );
}
