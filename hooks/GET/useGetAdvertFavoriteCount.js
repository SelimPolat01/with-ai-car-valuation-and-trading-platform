import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getAdvertFavoriteCount(token, advertId) {
  const safeToken =
    !token || token === "null" || token === "undefined" || token === ""
      ? null
      : token;

  return await Fetch(
    safeToken,
    "adverts",
    `favoriteCount/${advertId}`,
    "GET",
    null,
  );
}

export default function useGetAdvertFavoriteCount(
  token,
  advertId,
  isTokenLoaded = true,
) {
  return useQuery({
    queryFn: () => getAdvertFavoriteCount(token, advertId),
    queryKey: ["favoriteCount", advertId],
    enabled:
      isTokenLoaded &&
      !!advertId &&
      advertId !== "undefined" &&
      advertId !== "null",
    retry: false,
  });
}
