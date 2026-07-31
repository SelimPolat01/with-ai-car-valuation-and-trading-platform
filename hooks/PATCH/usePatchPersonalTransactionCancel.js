import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchPersonalTransactionCancel(transactionId) {
  return await Fetch(
    "transactions",
    `personal-transactions/${transactionId}?cancel=true`,
    "PATCH",
    null,
  );
}

export function usePatchPersonalTransactionCancel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transactionId }) =>
      patchPersonalTransactionCancel(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["personalTransactions"],
      });
    },
  });
}
