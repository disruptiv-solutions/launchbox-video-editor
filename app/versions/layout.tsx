"use client";
import Banner from "@/components/shared/banner";
import { usePathname } from "next/navigation";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lastRoute = pathname.split("/").pop() || "";

  return (
    <>
      <Banner version={lastRoute} />
      {children}
    </>
  );
}
