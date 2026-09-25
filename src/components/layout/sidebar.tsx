'use client';

import { Boxes, LayoutDashboard, ReceiptText, Users } from 'lucide-react';
/* Glifo da marca vem do react-icons, que já é dependência: desenhar logo de
   memória sai errado. */
import { FaWhatsapp } from 'react-icons/fa';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

/**
 * Quatro destinos, e só. Financeiro e Cadastros abrem uma tela-índice com os
 * seus assuntos: a lista inteira aberta na lateral virava um paredão de links
 * que ninguém lia.
 */
const sidebarItems: Array<SidebarItem> = [
  { title: 'Dashboard', url: '/painel', icon: LayoutDashboard },
  { title: 'Alunos', url: '/alunos', icon: Users },
  { title: 'Financeiro', url: '/financeiro', icon: ReceiptText },
  { title: 'Cadastros', url: '/cadastros', icon: Boxes },
  { title: 'WhatsApp', url: '/whatsapp', icon: FaWhatsapp },
];

const MENU_BUTTON = 'h-11 gap-3 px-4 text-base [&>svg]:size-5';

export function AppSidebar() {
  const path = usePathname();
  return (
    <Sidebar>
      <SidebarHeader>
        {/* o nome vai no alt: some da tela, mas segue no leitor de tela */}
        <div className="flex h-28 w-full items-center px-4">
          <Image
            src="/images/logo.png"
            alt="Team Sartorato"
            width={300}
            height={300}
            className="h-20 w-auto"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  /* as telas de dentro mantêm o assunto aceso no menu */
                  isActive={
                    path === item.url || path.startsWith(`${item.url}/`)
                  }
                  className={MENU_BUTTON}
                >
                  <Link href={item.url} className="cursor-pointer">
                    <item.icon />
                    <span className="font-normal">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
