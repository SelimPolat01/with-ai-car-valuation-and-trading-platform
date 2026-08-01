import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchSoldAdvert(body) {
  return await Fetch("adverts", `soldAdvert`, "PATCH", body);
}

export function usePatchSoldAdvert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }) => patchSoldAdvert(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["adverts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["available-slots"],
      });

      queryClient.invalidateQueries({
        queryKey: ["favoriteAdverts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["appointments"],
      });
    },
  });
}
