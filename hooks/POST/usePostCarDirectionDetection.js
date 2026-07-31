import { FastApiFetch } from "@/backend/lib/fastApiFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postCarDirectionDetection(body) {
  return await FastApiFetch(
    "car-direction-detection-upload",
    null,
    "POST",
    body,
  );
}

export function usePostCarDirectionDetection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body }) => postCarDirectionDetection(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["carDirectionDetection"],
      });
    },
  });
}
