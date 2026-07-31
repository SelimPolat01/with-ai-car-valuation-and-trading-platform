import { FastApiFetch } from "@/backend/lib/fastApiFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postCarSellTimePredict(body) {
  return await FastApiFetch("predict-sell-time", null, "POST", body);
}

export function usePostCarSellTimePredict() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body }) => postCarSellTimePredict(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["carValuePredict"],
      });
    },
  });
}
