"use client";

import Dropdown from "@/app/components/Dropdown";
import { useSearchParams } from "next/navigation";
import AiCarDetector from "@/app/components/AiCarDetector";

export default function Home() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  return (
    <div className="homeContainer">
      {mode === "form" ? (
        <div className="dropdownDiv">
          <div className="dropdownContainer">
            <div>
              <h2 style={{ margin: 0 }}>Araç bilgilerini gir.</h2>
            </div>
            <div>
              <p style={{ color: "#FF6B6B" }}>Aracını hemen sat.</p>
            </div>
            <Dropdown />
          </div>
        </div>
      ) : (
        <AiCarDetector />
      )}
    </div>
  );
}
