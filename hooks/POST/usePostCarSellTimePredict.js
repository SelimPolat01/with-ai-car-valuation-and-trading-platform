import { FastApiFetch } from "@/backend/lib/fastApiFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postCarSellTimePredict(token, body) {
  return await FastApiFetch(token, "predict-sell-time", null, "POST", body);
}

export function usePostCarSellTimePredict() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, body }) => postCarSellTimePredict(token, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["carValuePredict", variables.token],
      });
    },
  });
}
