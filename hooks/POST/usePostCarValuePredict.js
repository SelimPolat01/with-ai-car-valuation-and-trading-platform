import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postCarValuePredict(body) {
  return await Fetch("predict", null, "POST", body);
}

export function usePostCarValuePredict() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body }) => postCarValuePredict(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["carValuePredict"],
      });
    },
  });
}
