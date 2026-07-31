import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalAdverts() {
  return await Fetch("adverts", "myAdverts", "GET", null);
}

export function useGetPersonalAdverts() {
  return useQuery({
    queryKey: ["personalAdverts"],
    queryFn: () => getPersonalAdverts(),
    retry: false,
  });
}
