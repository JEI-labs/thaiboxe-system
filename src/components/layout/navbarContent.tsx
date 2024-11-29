import Image from "next/image";
import { Separator } from "../ui/separator";
import { NavLink } from "./navLink";

const navItems = [
  {
    name: "/dashboard",
    label: "Dashboard",
  },
  {
    name: "/transactions",
    label: "Movimentações",
  },
  {
    name: "/indicate",
    label: "Indique",
  },
];

export const NavbarContent = ({ close }: { close?: () => void }) => {
  return (
    <div className="flex h-fit flex-row gap-6 max-sm:flex-col">
      <Image src="/logo/logo.svg" alt="Logo" width={125} height={31} />
      <div className="hidden max-sm:flex">
        <Separator className="w-full bg-muted" />
      </div>
      <div className="flex gap-4 max-sm:flex-col">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            title={item.label}
            href={item.name}
            close={close}
          />
        ))}
      </div>
    </div>
  );
};
