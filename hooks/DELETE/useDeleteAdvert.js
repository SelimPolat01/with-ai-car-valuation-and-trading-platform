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
      queryClient.invalidateQueries({ queryKey: ["favoriteAdverts"] });
      queryClient.invalidateQueries({ queryKey: ["personalAdverts"] });
      queryClient.invalidateQueries({ queryKey: ["personalAdvertsInfos"] });
      queryClient.invalidateQueries({ queryKey: ["soldAdverts"] });
      queryClient.invalidateQueries({ queryKey: ["personalAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      queryClient.invalidateQueries({ queryKey: ["personalTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["deletedAdverts"] });

      queryClient.removeQueries({
        queryKey: ["advert", variables.advertId],
      });
      queryClient.removeQueries({
        queryKey: ["favoriteCount", variables.advertId],
      });
      queryClient.removeQueries({
        queryKey: ["advertView", variables.advertId],
      });
      queryClient.removeQueries({
        queryKey: ["checkFavorite", variables.advertId],
      });
    },
  });
}
