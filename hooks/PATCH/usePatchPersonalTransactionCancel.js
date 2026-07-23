import { Fetch } from "@/backend/lib/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function patchPersonalTransactionCancel(token, transactionId) {
  return await Fetch(
    token,
    "transactions",
    `personal-transactions/${transactionId}?cancel=true`,
    "PATCH",
    null,
  );
}

export function usePatchPersonalTransactionCancel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, transactionId }) =>
      patchPersonalTransactionCancel(token, transactionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["personalTransactions", variables.token],
      });
    },
  });
}
