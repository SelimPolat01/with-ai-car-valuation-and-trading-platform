import { Fetch } from "@/backend/lib/fetch";
import { useQuery } from "@tanstack/react-query";

export async function getPersonalTransactions(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(
    token,
    "transactions",
    "personal-transactions",
    "GET",
    null,
  );
}

export default function useGetPersonalTransactions(token) {
  const isValidToken = !!token && token !== "null" && token !== "undefined";

  return useQuery({
    queryKey: ["personalTransactions", token],
    queryFn: () => getPersonalTransactions(token),
    enabled: isValidToken,
    retry: false,
  });
}
