import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postFavoriteAdvert(advertId) {
  return await Fetch("adverts", `favoriteAdverts/${advertId}`, "POST", null);
}

export function usePostFavoriteAdvert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ advertId }) => postFavoriteAdvert(advertId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["favoriteAdverts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["adverts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["advert", variables.advertId],
      });
      queryClient.invalidateQueries({
        queryKey: ["favoriteCount", variables.advertId],
      });
    },
  });
}
