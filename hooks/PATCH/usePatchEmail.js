import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchEmail(token, body) {
  return await Fetch(token, "infos", "email", "PATCH", body);
}

export function usePatchEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, body }) => patchEmail(token, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["email", variables.token],
      });
    },
  });
}
