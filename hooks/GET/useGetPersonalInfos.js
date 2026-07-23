import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalInfos(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(token, "infos", "personal-infos", "GET", null);
}

export function useGetPersonalInfos(token) {
  const isValidToken = !!token && token !== "null" && token !== "undefined";

  return useQuery({
    queryKey: ["personalInfos", token],
    queryFn: () => getPersonalInfos(token),
    enabled: isValidToken,
    retry: false,
  });
}
