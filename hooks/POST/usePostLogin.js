import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postLogin(body) {
  return await Fetch("api", "login", "POST", body);
}

export function usePostLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }) => postLogin(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}
