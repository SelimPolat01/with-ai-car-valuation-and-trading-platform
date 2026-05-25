"use client";

import Dropdown from "@/app/components/Dropdown";
import { useSearchParams } from "next/navigation";
import AiCarDetector from "@/app/components/AiCarDetector";

export default function Home() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  return (
    <main className="container">
      {mode === "form" ? (
        <div className="dropdownContainer">
          <div>
            <h2>Araç bilgilerini gir.</h2>
          </div>
          <div>
            <p style={{ color: "#FF6B6B" }}>Aracını hemen sat.</p>
          </div>
          <Dropdown />
        </div>
      ) : (
        <AiCarDetector />
      )}
      {/* <div>
          <h1>
            Aracın değerini biliyor musun ?
            <p>
              Senden istenilen formları eksiksiz doldur,
              <br />
              aracın değeri, senin için <span>saniyeler içinde</span>
              hesaplansın! <br />
            </p>
          </h1>
        </div> */}
    </main>
  );
}
