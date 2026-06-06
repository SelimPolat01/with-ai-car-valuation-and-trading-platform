import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchTokenDuration(token, body) {
  return await Fetch(token, "infos", "token-duration", "PATCH", body);
}

export function usePatchTokenDuration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, body }) => patchTokenDuration(token, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tokenDuration", variables.token],
      });
    },
  });
}
