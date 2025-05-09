'use client';

import { Suspense } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';

const breadcrumbItems = [
  {
    label: 'Home',
    href: '/dashboard',
  },
  {
    label: 'Fornecedores',
    href: '/registrations/suppliers',
  },
];

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="w-full">
        <BreadcrumbUpdater items={breadcrumbItems} />

        <main className="flex flex-col gap-8">
          <div>Fornecedores</div>
        </main>
      </div>
    </Suspense>
  );
}
