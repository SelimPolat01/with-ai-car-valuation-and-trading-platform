"use client";

import PriceOffer from "@/app/components/PriceOffer";
import { useParams } from "next/navigation";

export default function EditAdvert() {
  const params = useParams();
  return <PriceOffer advertId={params.advertId} />;
}
