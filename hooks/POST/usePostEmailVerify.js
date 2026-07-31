import { Fetch } from "@/backend/lib/fetch";
import { useMutation } from "@tanstack/react-query";

async function postEmailVerify(body, forLogin) {
  const queryString = forLogin ? "forLogin=true" : "forLogin=false";
  return await Fetch("api", `email?${queryString}`, "POST", body);
}

export function usePostEmailVerify() {
  return useMutation({
    mutationFn: ({ body, forLogin }) => postEmailVerify(body, forLogin),
  });
}
