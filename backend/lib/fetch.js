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

  const result = await response.json();

  if (!response.ok)
    throw {
      ok: false,
      status: response.status,
      message: result.message,
      data: result,
    };

  return { result: result, status: response.status };
}
