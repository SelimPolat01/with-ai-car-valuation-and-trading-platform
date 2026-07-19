import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchNotificationRead(token, notificationId) {
  return await Fetch(
    token,
    "notifications",
    `${notificationId}/read`,
    "PATCH",
    null,
  );
}

export function usePatchNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, notificationId }) =>
      patchNotificationRead(token, notificationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["personalNotifications", variables.token],
      });
    },
  });
}
