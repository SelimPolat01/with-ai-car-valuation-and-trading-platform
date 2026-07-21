import { FastApiFetch } from "@/backend/lib/fastApiFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postAdvertValidateContent(token, body) {
  return await FastApiFetch(token, "validate-content", null, "POST", body);
}

export function usePostAdvertValidateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, body }) => postAdvertValidateContent(token, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["advertValidateContent", variables.token],
      });
    },
  });
}
