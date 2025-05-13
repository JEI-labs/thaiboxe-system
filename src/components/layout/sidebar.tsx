'use client';

import {
  BarChart2,
  Boxes,
  DollarSign,
  LayoutDashboard,
  Package,
  ReceiptCentIcon,
  ReceiptText,
  Settings,
  Users,
  UserSquare,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@/components/ui/sidebar';
import { MdCategory } from 'react-icons/md';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Separator } from '../ui/separator';

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ElementType;
}
interface SidebarRootItem {
  title: string;
  icon: React.ElementType;
  url?: string;
  items?: Array<SidebarItem>;
}

const registrationsItems = [
  {
    title: 'Fornecedores',
    url: '/registrations/suppliers',
    icon: UserSquare,
  },
  {
    title: 'Planos',
    url: '/registrations/plans',
    icon: Package,
  },
  {
    title: 'Categorias',
    url: '/registrations/categories',
    icon: MdCategory,
  },
];

const financialItems = [
  {
    title: 'Resumo',
    url: '/financial/summary',
    icon: BarChart2,
  },
  {
    title: 'Receitas',
    url: '/financial/revenues',
    icon: DollarSign,
  },
  {
    title: 'Despesas',
    url: '/financial/expenses',
    icon: ReceiptCentIcon,
  },
];

const footerItems: Array<SidebarItem> = [
  {
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
  },
];

const sidebarItems: Array<SidebarRootItem> = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    url: '/dashboard',
  },
  {
    title: 'Alunos',
    url: '/students',
    icon: Users,
  },
  {
    title: 'Financeiro',
    icon: ReceiptText,
    items: financialItems,
  },
  {
    title: 'Cadastros',
    icon: Boxes,
    items: registrationsItems,
  },
];

export function AppSidebar() {
  const path = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="jutify-center flex h-24 w-full items-center p-6">
          <Image src="/images/logo.png" alt="Logo" width={300} height={300} />
        </div>
        <p className="text-center font-bold">Team Sartorato</p>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url ?? ''} className="cursor-pointer py-5">
                    {item.icon && <item.icon />}
                    <span className="text-md font-normal">{item.title}</span>
                  </Link>
                </SidebarMenuButton>

                {Array.isArray(item.items) && item.items.length > 0 && (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuButton
                        asChild
                        key={subItem.title}
                        className={cn(
                          path === subItem.url
                            ? 'bg-accent'
                            : 'transparent text-muted-foreground',
                        )}
                      >
                        <Link
                          className={cn(
                            'flex items-center gap-4 rounded-lg px-3 py-1.5',
                          )}
                          href={subItem.url}
                        >
                          {subItem.icon && <subItem.icon />}
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {footerItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild className="py-5">
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
