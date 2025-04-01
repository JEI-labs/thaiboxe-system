'use client';

import {
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  Users,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';

export function AppSidebar() {
  const [logoSrc, setLogoSrc] = useState('');

  useEffect(() => {
    setLogoSrc('/images/logo.png');
  }, []);

  const items = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Alunos',
      url: '/students',
      icon: Users,
    },
    {
      title: 'Financeiro',
      url: '/financial',
      icon: ReceiptText,
    },
    {
      title: 'Planos',
      url: '/plans',
      icon: Package,
    },
  ];

  const footerItems = [
    {
      title: 'Configurações',
      url: '/settings',
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="jutify-center flex h-24 w-full items-center p-6">
          {logoSrc ? (
            <Image src={logoSrc} alt="Logo" width={300} height={300} />
          ) : (
            <Skeleton className="h-12 w-full" />
          )}
        </div>
        <div className="-mb-6 text-center font-bold">Team Sartorato</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Separator />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {footerItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarFooter>
    </Sidebar>
  );
}
