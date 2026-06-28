"use client";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { AppAvatar } from "@/components/shared";

interface HeaderProps {
  title?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function Header({ title, className, actions }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6",
        className,
      )}
    >
      {title && (
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      )}
      <div className="ml-auto flex items-center gap-2">
        {actions}
        <ThemeToggle />
        <AppAvatar alt="User" size="sm" className="ml-2" />
      </div>
    </header>
  );
}
