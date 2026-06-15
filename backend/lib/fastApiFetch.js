export async function FastApiFetch(
  token = null,
  param1 = null,
  param2 = null,
  method = "GET",
  body = null,
) {
  const url = param2
    ? `${process.env.NEXT_PUBLIC_FAST_API_URL}/${param1}/${param2}`
    : `${process.env.NEXT_PUBLIC_FAST_API_URL}/${param1}`;

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
      localStorage.removeItem("token");
      window.location.href = "/login";
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
