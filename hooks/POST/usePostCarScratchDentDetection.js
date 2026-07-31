import { FastApiFetch } from "@/backend/lib/fastApiFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postCarScratchDentDection(body) {
  return await FastApiFetch(
    "car-scratch-dent-detection-upload",
    null,
    "POST",
    body,
  );
}

export function usePostCarScratchDentDection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body }) => postCarScratchDentDection(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["carScratchDentDetection"],
      });
    },
  });
}
