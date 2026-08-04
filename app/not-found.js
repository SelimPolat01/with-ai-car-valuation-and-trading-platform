"use client";

import ErrorDisplay from "@/app/components/ErrorDisplay";

export default function NotFound() {
  return (
    <ErrorDisplay
      title="404"
      message="Hay aksi! Aradığınız sayfa duman olmuş."
      imageSrc="/images/not-found.svg"
    />
  );
}
