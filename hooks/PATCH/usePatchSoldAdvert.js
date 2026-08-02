import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchSoldAdvert(body) {
  return await Fetch("adverts", `soldAdvert`, "PATCH", body);
}

export function usePatchSoldAdvert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }) => patchSoldAdvert(body),
    onSuccess: (data, variables) => {
      const advertId = variables?.body?.advertId;

      queryClient.invalidateQueries({ queryKey: ["adverts"] });
      queryClient.invalidateQueries({ queryKey: ["boughtAdverts"] });
      queryClient.invalidateQueries({ queryKey: ["soldAdverts"] });
      queryClient.invalidateQueries({ queryKey: ["personalAdverts"] });
      queryClient.invalidateQueries({ queryKey: ["personalAdvertsInfos"] });
      if (advertId) {
        queryClient.invalidateQueries({ queryKey: ["advert", advertId] });
      }
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      queryClient.invalidateQueries({ queryKey: ["personalAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteAdverts"] });
      if (advertId) {
        queryClient.invalidateQueries({
          queryKey: ["favoriteCount", advertId],
        });
        queryClient.invalidateQueries({
          queryKey: ["checkFavorite", advertId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["personalTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["personalNotifications"] });
    },
  });
}
