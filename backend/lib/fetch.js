export async function Fetch(
  token = null,
  param1 = null,
  param2 = null,
  method = "GET",
  body = null,
) {
  const url = param2
    ? `${process.env.NEXT_PUBLIC_URL}/${param1}/${param2}`
    : `${process.env.NEXT_PUBLIC_URL}/${param1}`;

  const isFormData = body instanceof FormData;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method: method,
    headers: headers,
    body:
      method !== "GET" && body
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      const hasExpiredToken = !!localStorage.getItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpire");

      const currentPath = window.location.pathname;
      const isPublicPage =
        currentPath === "/" ||
        currentPath.startsWith("/tum-ilanlar") ||
        currentPath.startsWith("/ilan/");

      if (!isPublicPage) {
        window.location.href = "/login";
      } else if (hasExpiredToken) {
        window.location.reload();
      }
    }
    throw { ok: false, status: 401, message: "Oturum süresi doldu." };
  }

  let result = null;
  try {
    result = await response.json();
  } catch (error) {}

  if (!response.ok) {
    throw {
      ok: false,
      status: response.status,
      message: result?.message || "Sunucu kaynaklı bir hata oluştu.",
      data: result,
    };
  }

  return { result: result, status: response.status };
}
