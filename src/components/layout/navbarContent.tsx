'use client';

import { ReceiptText, LayoutDashboard, CreditCard } from 'lucide-react';
import { NavLink } from './navLink';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { useEffect, useState } from 'react';
import { Separator } from '../ui/separator';

export function NavbarContent({ close }: { close?: () => void }) {
  const [logoSrc, setLogoSrc] = useState('');

  useEffect(() => {
    setLogoSrc('/images/logo.png');
  }, []);

  return (
    <div>
      <div className="jutify-center flex h-24 w-full items-center p-6">
        {logoSrc ? (
          <Image src={logoSrc} alt="Logo" width={300} height={300} />
        ) : (
          <Skeleton className="h-12 w-full" />
        )}
      </div>
      <Separator />
      <div className="mt-4">
        <NavLink
          title="Resumo"
          href="/dashboard"
          icon={LayoutDashboard}
          close={close}
        />
        <NavLink
          title="Financeiro"
          href="/financial"
          icon={ReceiptText}
          close={close}
        />
        <NavLink
          title="Alunos"
          href="/students"
          icon={CreditCard}
          close={close}
        />
      </div>
    </div>
  );
}
