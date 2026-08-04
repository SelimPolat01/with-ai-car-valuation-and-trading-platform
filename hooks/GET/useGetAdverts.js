import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getAdverts() {
  return await Fetch("adverts", null, "GET", null);
}

export function useGetAdverts() {
  return useQuery({
    queryKey: ["adverts"],
    queryFn: () => getAdverts(),
    retry: false,
    throwOnError: true,
  });
}
