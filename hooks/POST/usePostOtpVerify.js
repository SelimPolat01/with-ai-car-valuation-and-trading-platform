import { Fetch } from "@/backend/lib/fetch";
import { useMutation } from "@tanstack/react-query";

async function postOtpVerify(body, forLogin) {
  const queryString = forLogin ? "forLogin=true" : "forLogin=false";
  return await Fetch("api", `otp?${queryString}`, "POST", body);
}

export function usePostOtpVerify() {
  return useMutation({
    mutationFn: ({ body, forLogin }) => postOtpVerify(body, forLogin),
  });
}
