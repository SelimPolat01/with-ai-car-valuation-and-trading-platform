"use client";

import { useSearchParams } from "next/navigation";

export default function HomeLayout({ children }) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  return (
    <div className={`${mode == "form" ? "bgForm" : "bgAiCarDetector"}`}>
      <main className="homeMain">{children}</main>
    </div>
  );
}
