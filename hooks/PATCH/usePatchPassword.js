import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchPassword(body) {
  return await Fetch("infos", "password", "PATCH", body);
}

export function usePatchPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body }) => patchPassword(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["password"],
      });
    },
  });
}
