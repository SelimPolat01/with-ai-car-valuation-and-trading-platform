import { FastApiFetch } from "@/backend/lib/fastApiFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postCarDetection(body) {
  return await FastApiFetch("car-detection-upload", null, "POST", body);
}

export function usePostCarDetection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body }) => postCarDetection(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["carDetection"],
      });
    },
  });
}
