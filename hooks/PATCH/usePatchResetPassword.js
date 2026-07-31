import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchResetPassword(body) {
  return await Fetch("api", "reset-password", "PATCH", body);
}

export function usePatchResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body }) => patchResetPassword(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["password"],
      });
    },
  });
}
