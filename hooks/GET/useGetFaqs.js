import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getFaqs() {
  return await Fetch(null, "faqs", null, "GET", null);
}

export default function useGetFaqs() {
  return useQuery({
    queryFn: () => getFaqs(),
    queryKey: ["faqs"],
    retry: false,
  });
}
