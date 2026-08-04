export async function Fetch(
  param1 = null,
  param2 = null,
  method = "GET",
  body = null,
) {
  const url = param2
    ? `${process.env.NEXT_PUBLIC_URL}/${param1}/${param2}`
    : `${process.env.NEXT_PUBLIC_URL}/${param1}`;

  const isFormData = body instanceof FormData;

  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method: method,
    headers: headers,
    credentials: "include",
    body:
      method !== "GET" && body
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const PUBLIC_ROUTES = [
        "/",
        "/tum-ilanlar",
        "/hakkimizda",
        "/sikca-sorulan-sorular",
        "/iletisim",
        "/register",
        "/login",
      ];

      const isPublicPage = PUBLIC_ROUTES.some(
        (route) => currentPath === route || currentPath.startsWith("/ilan/"),
      );

      if (!isPublicPage) {
        window.location.href = "/login";
      }
    }

    const error = new Error("Oturum süresi doldu.");
    error.status = 401;
    throw error;
  }

  let result = null;
  try {
    result = await response.json();
  } catch (error) {}

  if (!response.ok) {
    const error = new Error(
      result?.message || "Sunucu kaynaklı bir hata oluştu.",
    );
    error.status = response.status;
    error.data = result;
    throw error;
  }

  return { result: result, status: response.status };
}
