import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchPersonalInfos(token, body) {
  return await Fetch(token, "infos", "personal-infos", "PATCH", body);
}

export function usePatchPersonalInfos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, body }) => patchPersonalInfos(token, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["personalInfos", variables.token],
      });
    },
  });
}
