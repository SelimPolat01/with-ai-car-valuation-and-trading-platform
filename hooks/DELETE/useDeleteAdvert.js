import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteAdvert(token, advertId) {
  return await Fetch(token, "adverts", `${advertId}`, "DELETE");
}

export function useDeleteAdvert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, advertId }) => deleteAdvert(token, advertId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adverts", variables.token] });
      queryClient.invalidateQueries({
        queryKey: ["personalAdverts", variables.token],
      });
      queryClient.removeQueries({
        queryKey: ["advert", variables.advertId, variables.token],
      });
    },
  });
}
