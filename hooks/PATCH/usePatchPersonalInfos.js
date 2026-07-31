import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchPersonalInfos(body) {
  return await Fetch("infos", "personal-infos", "PATCH", body);
}

export function usePatchPersonalInfos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body }) => patchPersonalInfos(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["personalInfos"],
      });
    },
  });
}
