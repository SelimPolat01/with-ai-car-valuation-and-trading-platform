import { FastApiFetch } from "@/backend/lib/fastApiFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postCarDetection(token, body) {
  return await FastApiFetch(token, "car-detection-upload", null, "POST", body);
}

export function usePostCarDetection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, body }) => postCarDetection(token, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["carDetection", variables.token],
      });
    },
  });
}
