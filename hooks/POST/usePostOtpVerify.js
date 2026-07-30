import { Fetch } from "@/backend/lib/fetch";
import { useMutation } from "@tanstack/react-query";

async function postOtpVerify(body) {
  return await Fetch(null, "api", "otp", "POST", body);
}

export function usePostOtpVerify() {
  return useMutation({
    mutationFn: ({ body }) => postOtpVerify(body),
  });
}
