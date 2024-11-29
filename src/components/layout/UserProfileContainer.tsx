"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { ThemeToggler } from "../theme/theme-toggler";

export function UserProfileContainer(): JSX.Element {
  // const { data: session } = useSession();

  // if (!session) return <Skeleton className="w-32 rounded-lg py-5" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-fit gap-4 px-3 py-2 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <div className="max-sm:hidden">
            {/* {session.user?.name?.split(" ")[0]} */}
            Teste User
          </div>
          <Avatar className="h-8 w-8 ring-2 ring-primary ring-offset-2 ring-offset-muted">
            {/* <AvatarImage src={session.user?.image ?? ""} className="ring-0" /> */}
            <AvatarImage src={""} className="ring-0" />
            <AvatarFallback className="bg-primary/40">
              {/* {session.user?.name?.substring(0, 2).toUpperCase()} */}
              TU
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit">
        {/* <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer gap-2 py-2 pl-3 pr-4">
            <UserIcon className="h-4 w-4" />
            Minha conta
          </DropdownMenuItem>
        </Link> */}
        {/* <Link href="#">
          <DropdownMenuItem className="cursor-not-allowed gap-2 py-2 pl-3 pr-4">
            <ShieldCheck className="h-4 w-4" />
            Segurança
          </DropdownMenuItem>
        </Link> */}

        {/* <DropdownMenuSeparator /> */}

        <DropdownMenuItem className="py-0 pl-3 pr-4">
          <ThemeToggler />
        </DropdownMenuItem>

        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuItem
          className="cursor-pointer gap-2 py-2 pl-3 pr-4"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
