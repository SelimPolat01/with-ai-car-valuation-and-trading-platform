"use client";

import ErrorDisplay from "@/app/components/ErrorDisplay";

export default function Error({ error, reset }) {
  return <ErrorDisplay error={error} reset={reset} />;
}
