import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchRecoverAdvert(advertId) {
  return await Fetch("adverts", `recoverAdvert/${advertId}`, "PATCH", null);
}

export function usePatchRecoverAdvert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (advertId) => patchRecoverAdvert(advertId),
    onSuccess: (_, advertId) => {
      queryClient.invalidateQueries({ queryKey: ["adverts"] });
      queryClient.invalidateQueries({ queryKey: ["personalAdverts"] });
      queryClient.invalidateQueries({ queryKey: ["personalDeletedAdverts"] });
      queryClient.invalidateQueries({ queryKey: ["deletedAdverts"] });
      queryClient.invalidateQueries({ queryKey: ["personalAdvertsInfos"] });
      queryClient.invalidateQueries({ queryKey: ["soldAdverts"] });
      queryClient.invalidateQueries({ queryKey: ["personalAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      queryClient.invalidateQueries({ queryKey: ["personalTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteAdverts"] });

      if (advertId) {
        queryClient.invalidateQueries({ queryKey: ["advert", advertId] });
        queryClient.invalidateQueries({
          queryKey: ["favoriteCount", advertId],
        });
        queryClient.invalidateQueries({
          queryKey: ["checkFavorite", advertId],
        });
      }
    },
  });
}
