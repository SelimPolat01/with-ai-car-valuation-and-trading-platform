import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchPersonalAppointmentCancel(token, appointmentId) {
  return await Fetch(
    token,
    "appointments",
    `personal-appointments/${appointmentId}`,
    "PATCH",
    null,
  );
}

export function usePatchPersonalAppointmentCancel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, appointmentId }) =>
      patchPersonalAppointmentCancel(token, appointmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["personalAppointments", variables.token],
      });
    },
  });
}
