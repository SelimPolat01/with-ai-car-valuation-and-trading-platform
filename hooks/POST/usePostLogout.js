import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postLogout() {
  return await Fetch("api", "logout", "POST", null);
}

export function usePostLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      queryClient.setQueryData(["auth"], null);
      queryClient.clear();
    },
  });
}
