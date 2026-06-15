import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postCarValuePredict(token, body) {
  return await Fetch(token, "predict", null, "POST", body);
}

export function usePostCarValuePredict() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, body }) => postCarValuePredict(token, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["carValuePredict", variables.token],
      });
    },
  });
}
