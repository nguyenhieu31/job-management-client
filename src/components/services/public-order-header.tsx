"use client";

import Link from "next/link";
import Image from "next/image";
import LogoImage from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useAppSelector } from "@/store/store";

export function PublicOrderHeader() {
  const { roleName, email } = useAppSelector((state) => state.authenticate);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/order-service" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <Image
            src={LogoImage}
            alt="Logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="text-xl font-bold tracking-tight">Job Manager</span>
        </Link>

        <div className="flex items-center gap-3">
          {roleName ? (
            <Link href="/dashboard/job">
              <Button variant="outline" size="sm" className="gap-2">
                <span className="max-w-[120px] truncate sm:max-w-[200px]">{email || "Dashboard"}</span>
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span>Staff Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
