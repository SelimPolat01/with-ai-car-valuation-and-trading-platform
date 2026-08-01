import { Fetch } from "@/backend/lib/fetch";
import { useQuery } from "@tanstack/react-query";

export async function getPersonalTransactions() {
  return await Fetch("transactions", "personal-transactions", "GET", null);
}

export default function useGetPersonalTransactions(user) {
  return useQuery({
    queryKey: ["personalTransactions", user?.id],
    queryFn: () => getPersonalTransactions(),
    enabled: !!user,
    retry: false,
  });
}
