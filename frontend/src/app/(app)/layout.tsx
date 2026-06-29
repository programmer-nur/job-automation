"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Mail,
  CheckSquare,
  Bell,
  Settings,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton } from "@/components/shared";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard className="size-4" /> },
  { label: "Jobs", href: "/jobs", icon: <Briefcase className="size-4" /> },
  { label: "Applications", href: "/applications", icon: <FileText className="size-4" /> },
  { label: "Resumes", href: "/resumes", icon: <FileText className="size-4" /> },
  { label: "Cover Letters", href: "/cover-letters", icon: <Mail className="size-4" /> },
  { label: "Tasks", href: "/tasks", icon: <CheckSquare className="size-4" /> },
  { label: "Notifications", href: "/notifications", icon: <Bell className="size-4" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="size-4" /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        items={NAV_ITEMS}
        title="Job Tracker"
        mobileTrigger={
          <AppButton
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleMobile}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </AppButton>
        }
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Dashboard" />
        <main className="flex-1 overflow-y-auto">
          <PageContainer maxWidth="xl">{children}</PageContainer>
        </main>
      </div>
    </div>
  );
}
