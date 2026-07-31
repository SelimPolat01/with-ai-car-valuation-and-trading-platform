import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchPersonalAppointmentCancel(appointmentId) {
  return await Fetch(
    "appointments",
    `personal-appointments/${appointmentId}?cancel=true`,
    "PATCH",
    null,
  );
}

export function usePatchPersonalAppointmentCancel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId }) =>
      patchPersonalAppointmentCancel(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["personalAppointments"],
      });
    },
  });
}
