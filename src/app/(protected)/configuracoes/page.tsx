'use client';

import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import { MessageTemplatesCard } from '@/components/whatsapp/messageTemplatesCard.component';
import { WhatsappConfigCard } from '@/components/whatsapp/whatsappConfigCard.component';

const breadcrumbItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Configurações', href: '/settings' },
];

export default function SettingsPage() {
  return (
    <div className="w-full">
      <BreadcrumbUpdater items={breadcrumbItems} />

      <main className="mt-4 flex flex-col gap-6">
        <WhatsappConfigCard />
        <MessageTemplatesCard />
      </main>
    </div>
  );
}
