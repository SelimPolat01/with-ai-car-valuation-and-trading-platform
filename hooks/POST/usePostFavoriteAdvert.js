import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postFavoriteAdvert(token, advertId) {
  return await Fetch(
    token,
    "adverts",
    `favoriteAdverts/${advertId}`,
    "POST",
    null,
  );
}

export function usePostFavoriteAdvert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, advertId }) => postFavoriteAdvert(token, advertId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["favoriteAdverts", variables.token],
      });
      queryClient.invalidateQueries({
        queryKey: ["advert", variables.advertId, variables.token],
      });
      queryClient.invalidateQueries({
        queryKey: ["favoriteAdvert", variables.advertId, variables.token],
      });
    },
  });
}
