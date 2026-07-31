import { Fetch } from "@/backend/lib/fetch";
import { useMutation } from "@tanstack/react-query";

async function deleteAccount() {
  return await Fetch("infos", "account", "DELETE");
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => deleteAccount(),
  });
}
