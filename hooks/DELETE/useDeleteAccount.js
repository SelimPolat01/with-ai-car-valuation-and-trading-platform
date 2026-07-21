import { Fetch } from "@/backend/lib/fetch";
import { useMutation } from "@tanstack/react-query";

async function deleteAccount(token) {
  return await Fetch(token, "infos", "account", "DELETE");
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: ({ token }) => deleteAccount(token),
  });
}
