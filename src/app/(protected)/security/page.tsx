'use client';

import { Suspense } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';

const breadcrumbItems = [
  {
    label: 'Home',
    href: '/dashboard',
  },
  {
    label: 'Segurança',
    href: '/security',
  },
];

export default function FinancialPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="w-full">
        <BreadcrumbUpdater items={breadcrumbItems} />

        <main className="flex flex-col gap-8">
          <div>Segurança</div>
        </main>
      </div>
    </Suspense>
  );
}
