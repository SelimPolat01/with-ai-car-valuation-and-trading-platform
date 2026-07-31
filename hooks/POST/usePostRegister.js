import { Fetch } from "@/backend/lib/fetch";
import { useMutation } from "@tanstack/react-query";

async function postRegister(body) {
  return await Fetch("api", "register", "POST", body);
}

export function usePostRegister() {
  return useMutation({
    mutationFn: ({ body }) => postRegister(body),
  });
}
