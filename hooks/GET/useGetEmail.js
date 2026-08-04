import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getEmail() {
  return await Fetch("infos", "email", "GET", null);
}

export function useGetEmail() {
  return useQuery({
    queryKey: ["email"],
    queryFn: () => getEmail(),
    retry: false,
    throwOnError: true,
  });
}
