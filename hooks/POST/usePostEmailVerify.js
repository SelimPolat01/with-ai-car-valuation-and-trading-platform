import { Fetch } from "@/backend/lib/fetch";
import { useMutation } from "@tanstack/react-query";

async function postEmailVerify(body) {
  return await Fetch(null, "api", "email", "POST", body);
}

export function usePostEmailVerify() {
  return useMutation({
    mutationFn: ({ body }) => postEmailVerify(body),
  });
}
