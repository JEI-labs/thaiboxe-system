'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import { IconType } from 'react-icons/lib';
import { LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface NavProps {
  title: string;
  href?: string;
  disabled?: boolean;
  label?: string;
  icon?: IconType | LucideIcon;
  close?: () => void;
}

export function NavLink(props: NavProps) {
  const path = usePathname();
  const active = path === props.href;

  return (
    <Link
      href={props.disabled ? '#' : (props.href ?? '#')}
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'lg' }),
        'w-full justify-start rounded-sm',
        props.disabled && 'cursor-not-allowed',
        active && 'bg-muted text-primary',
        'gap-4 transition-all duration-200 hover:gap-3 hover:text-primary',
      )}
      onClick={() => {
        if (props.close) props.close();
      }}
    >
      {props.icon && <props.icon className="h-4 w-4" />}
      {props.title}
      {props.label && <span className="ml-auto">{props.label}</span>}
    </Link>
  );
}
