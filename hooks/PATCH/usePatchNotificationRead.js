import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchNotificationRead(notificationId) {
  return await Fetch("notifications", `${notificationId}/read`, "PATCH", null);
}

export function usePatchNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId }) => patchNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["personalNotifications"],
      });
    },
  });
}
