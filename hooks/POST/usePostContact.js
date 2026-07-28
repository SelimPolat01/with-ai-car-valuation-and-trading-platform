import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postContact(body) {
  return await Fetch(null, "api", "contact", "POST", body);
}

export function usePostContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }) => postContact(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contacts"],
      });
    },
  });
}
