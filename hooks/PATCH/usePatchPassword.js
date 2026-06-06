import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchPassword(token, body) {
  return await Fetch(token, "infos", "password", "PATCH", body);
}

export function usePatchPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, body }) => patchPassword(token, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["password", variables.token],
      });
    },
  });
}
