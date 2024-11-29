"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

interface NavProps {
  title: string;
  href?: string;
  disabled?: boolean;
  label?: string;
  icon?: LucideIcon;
  close?: () => void;
}

export function NavLink(props: NavProps) {
  const path = usePathname();
  const active = path === props.href;

  return (
    <Link
      href={props.disabled ? "#" : (props.href ?? "#")}
      className={cn(
        "mr-4 w-full rounded-sm text-left text-muted-foreground",
        props.disabled && "cursor-not-allowed",
        active ? "text-lg font-bold text-primary" : "text-sm",
        props.href === "/dashboard" ? "sm:ml-8" : "ml-0",
      )}
      onClick={() => {
        if (props.close) props.close();
      }}
    >
      {props.icon && <props.icon className="mr-2 h-4 w-4" />}
      {props.title}
      {props.label && <span className="ml-auto">{props.label}</span>}
    </Link>
  );
}
