import { FastApiFetch } from "@/backend/lib/fastApiFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postCarScratchDentDection(token, body) {
  return await FastApiFetch(
    token,
    "car-scratch-dent-detection-upload",
    null,
    "POST",
    body,
  );
}

export function usePostCarScratchDentDection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, body }) => postCarScratchDentDection(token, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["carScratchDentDetection", variables.token],
      });
    },
  });
}
