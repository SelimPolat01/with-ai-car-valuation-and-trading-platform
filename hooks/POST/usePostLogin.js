import { Fetch } from "@/backend/lib/fetch";
import { useMutation } from "@tanstack/react-query";

async function postLogin(body) {
  return await Fetch(null, "api", "login", "POST", body);
}

export function usePostLogin() {
  return useMutation({
    mutationFn: ({ body }) => postLogin(body),
  });
}
