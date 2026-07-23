"use client"

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/store";
import useRouter from "@/hooks/use-router";

export default function DashboardPage() {
  const { roleName, email } = useAppSelector((state) => state.authenticate);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/dashboard") return;
    if (roleName === "CUSTOMER") {
      router.replace("/dashboard/order-service");
    } else if (roleName) {
      router.replace("/dashboard/job");
    }
  }, [roleName, email, pathname, router]);

  return null;
}
