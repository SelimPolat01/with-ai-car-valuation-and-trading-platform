"use client";

import Header from "@/app/components/Header";
import { useSearchParams } from "next/navigation";

export default function HomeLayout({ children }) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  return (
    <div className={`${mode == "form" ? "bgForm" : "bgAiCarDetector"}`}>
      <Header />
      <main className="homeMain">{children}</main>
    </div>
  );
}
