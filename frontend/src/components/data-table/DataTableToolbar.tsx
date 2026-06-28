"use client";

import { AppInput } from "@/components/shared";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

interface DataTableToolbarProps {
  searchKey?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar({
  searchKey,
  searchPlaceholder = "Search...",
  onSearch,
  children,
  className,
}: DataTableToolbarProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      onSearch?.(value);
    },
    [onSearch],
  );

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {(searchKey || onSearch) && (
        <AppInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={handleSearch}
          className="max-w-sm"
        />
      )}
      <div className="flex items-center gap-2 ml-auto">{children}</div>
    </div>
  );
}
