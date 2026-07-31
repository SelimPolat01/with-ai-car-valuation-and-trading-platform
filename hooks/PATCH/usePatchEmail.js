import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchEmail(body) {
  return await Fetch("infos", "email", "PATCH", body);
}

export function usePatchEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body }) => patchEmail(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["email"],
      });
    },
  });
}
