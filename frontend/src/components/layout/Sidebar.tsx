"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AppText } from "@/components/shared";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SideNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  items?: SideNavItem[];
}

interface SidebarProps {
  items: SideNavItem[];
  title?: string;
  className?: string;
  mobileTrigger?: React.ReactNode;
}

export function Sidebar({ items, title = "Navigation", className, mobileTrigger }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile */}
      {mobileTrigger && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>{mobileTrigger}</SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SideNavContent
              items={items}
              title={title}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop */}
      <aside
        className={cn(
          "hidden w-60 shrink-0 border-r bg-sidebar lg:block",
          className,
        )}
      >
        <SideNavContent items={items} title={title} pathname={pathname} />
      </aside>
    </>
  );
}

function SideNavContent({
  items,
  title,
  pathname,
  onNavigate,
}: {
  items: SideNavItem[];
  title: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <AppText variant="h4">{title}</AppText>
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

function SidebarItem({
  item,
  pathname,
  onNavigate,
}: {
  item: SideNavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <div>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50",
        )}
      >
        {item.icon && <span className="size-4 shrink-0">{item.icon}</span>}
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge !== undefined && (
          <span className="flex size-5 items-center justify-center rounded-full bg-sidebar-primary text-[10px] font-medium text-sidebar-primary-foreground">
            {item.badge}
          </span>
        )}
      </Link>
      {item.items && isActive && (
        <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l pl-2">
          {item.items.map((sub) => (
            <Link
              key={sub.href}
              href={sub.href}
              onClick={onNavigate}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                pathname === sub.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
              )}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
