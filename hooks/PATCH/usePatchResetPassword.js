import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchResetPassword(token, body) {
  return await Fetch(token, "api", "reset-password", "PATCH", body);
}

export function usePatchResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, body }) => patchResetPassword(token, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["password", variables.token],
      });
    },
  });
}
