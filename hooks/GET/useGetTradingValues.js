import { Fetch } from "@/backend/lib/fetch";
import { useQuery } from "@tanstack/react-query";

export async function getTradingValues(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(token, "transactions", "trading-values", "GET", null);
}

export default function useGetTradingValues(token) {
  return useQuery({
    queryKey: ["tradingValues", token],
    queryFn: () => getTradingValues(token),
    enabled: !!token,
    retry: false,
  });
}
