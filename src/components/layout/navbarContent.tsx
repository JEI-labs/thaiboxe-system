"use client";

import { ReceiptText, LayoutDashboard, CreditCard } from "lucide-react";
import { NavLink } from "./navLink";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
import { Separator } from "../ui/separator";

export function NavbarContent({ close }: { close?: Function }) {
  const [logoSrc, setLogoSrc] = useState("");

  useEffect(() => {
    setLogoSrc("/images/logo.png");
  }, []);

  return (
    <div>
      <div>
        <div className="flex w-full items-center gap-2 pb-6 pt-8 text-xl font-bold">
          {logoSrc ? (
            <Image src={logoSrc} alt="Logo" width={300} height={24} />
          ) : (
            <Skeleton className="h-12 w-full" />
          )}
        </div>
        <Separator />
        <div className="mt-4 grid gap-1">
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

          {/* <Accordion
            type="single"
            collapsible
            defaultValue={
              path?.startsWith("/payments/") ? "payments" : undefined
            }
          >
            <AccordionItem value="payments" className="border-none">
              <AccordionTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-8 w-full justify-between rounded-md px-3 text-xs hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <div className="flex items-center">
                  <MdOutlinePayments className="mr-2 h-4 w-4" />
                  <span className="text-nowrap fade-in">Pagamentos</span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </AccordionTrigger>
              <AccordionContent>
                <NavLink
                  title="Pix"
                  href="/payments/pix"
                  icon={GoDot}
                  close={close}
                />
                <NavLink
                  title="Ted"
                  href="/payments/ted"
                  icon={GoDot}
                  close={close}
                />
                <NavLink
                  title="Boleto"
                  href="/payments/boleto"
                  icon={GoDot}
                  close={close}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion
            type="single"
            collapsible
            defaultValue={path?.startsWith("/account/") ? "account" : undefined}
          >
            <AccordionItem value="account" className="border-none">
              <AccordionTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-8 w-full justify-between rounded-md px-3 text-xs hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <div className="flex items-center">
                  <Cog className="mr-2 h-4 w-4" />
                  <span className="text-nowrap fade-in">Configurações</span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </AccordionTrigger>
              <AccordionContent>
                <NavLink
                  title="Limites"
                  href="/account/limits"
                  icon={GoDot}
                  close={close}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion> */}
        </div>
      </div>
    </div>
  );
}
