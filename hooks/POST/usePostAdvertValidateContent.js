import { FastApiFetch } from "@/backend/lib/fastApiFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postAdvertValidateContent(body) {
  return await FastApiFetch("validate-content", null, "POST", body);
}

export function usePostAdvertValidateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body }) => postAdvertValidateContent(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["advertValidateContent"],
      });
    },
  });
}
