'use client';

import { Suspense } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';

const breadcrumbItems = [
  {
    label: 'Home',
    href: '/dashboard',
  },
  {
    label: 'Configurações',
    href: '/settings',
  },
];

export default function FinancialPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="w-full">
        <BreadcrumbUpdater items={breadcrumbItems} />

        <main className="flex flex-col gap-8">
          <div>Configurações</div>
        </main>
      </div>
    </Suspense>
  );
}
