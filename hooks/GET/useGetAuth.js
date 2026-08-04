import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getAuth() {
  return await Fetch("auth", "me", "GET", null);
}

export function useGetAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: getAuth,
    retry: false,
    throwOnError: true,
  });
}
