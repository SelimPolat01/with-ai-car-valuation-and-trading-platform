import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteAdvert(advertId) {
  return await Fetch("adverts", `${advertId}`, "DELETE");
}

export function useDeleteAdvert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ advertId }) => deleteAdvert(advertId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adverts"] });
      queryClient.invalidateQueries({
        queryKey: ["personalAdverts"],
      });
      queryClient.removeQueries({
        queryKey: ["advert", variables.advertId],
      });
    },
  });
}
