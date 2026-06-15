import { FastApiFetch } from "@/backend/lib/fastApiFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postCarDirectionDetection(token, body) {
  return await FastApiFetch(
    token,
    "car-direction-detection-upload",
    null,
    "POST",
    body,
  );
}

export function usePostCarDirectionDetection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, body }) => postCarDirectionDetection(token, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["carDirectionDetection", variables.token],
      });
    },
  });
}
