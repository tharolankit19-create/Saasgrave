"use client";

import Link from "next/link";
import Image from "next/image";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LayoutDashboard, Store, Tag, User, LogOut } from "lucide-react";

export function UserMenu({ name, avatarUrl }: { name: string | null; avatarUrl: string | null }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-black/10 p-1 pr-3 transition hover:border-black/25">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ember-600 text-xs font-semibold text-ink-950">
              {initial}
            </span>
          )}
          <span className="max-w-[120px] truncate text-sm text-bone-300">{name || "Account"}</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[200px] rounded-xl border border-black/10 bg-ink-850 p-1.5 shadow-2xl"
        >
          <Item href="/dashboard" icon={<LayoutDashboard size={15} />}>Dashboard</Item>
          <Item href="/sell" icon={<Store size={15} />}>List a startup</Item>
          <Item href="/sales" icon={<Tag size={15} />}>For-sale board</Item>
          <Item href="/profile/edit" icon={<User size={15} />}>Edit profile</Item>
          <DropdownMenu.Separator className="my-1.5 h-px bg-black/8" />
          <DropdownMenu.Item asChild>
            <a
              href="/logout"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-bone-300 outline-none transition hover:bg-ink-800 hover:text-bone-100"
            >
              <LogOut size={15} /> Sign out
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Item({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        href={href}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-bone-300 outline-none transition hover:bg-ink-800 hover:text-bone-100"
      >
        {icon}
        {children}
      </Link>
    </DropdownMenu.Item>
  );
}
