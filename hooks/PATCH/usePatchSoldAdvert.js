import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchSoldAdvert(token, body) {
  return await Fetch(token, "adverts", `soldAdvert`, "PATCH", body);
}

export function usePatchSoldAdvert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, body }) => patchSoldAdvert(token, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["adverts", variables.token],
      });
    },
  });
}
