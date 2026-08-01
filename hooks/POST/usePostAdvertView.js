import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postAdvertView(advertId) {
  return await Fetch("adverts", `${advertId}/view`, "POST", null);
}

export function usePostAdvertView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ advertId }) => postAdvertView(advertId),
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["advertView", variables.advertId],
      });
    },
  });
}
