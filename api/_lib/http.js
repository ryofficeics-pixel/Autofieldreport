export function json(res, statusCode, body) {
  res.status(statusCode).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function badRequest(res, message, details = null) {
  return json(res, 400, { code: "bad_request", message, details });
}

export function unauthorized(res, message = "Unauthorized") {
  return json(res, 401, { code: "unauthorized", message });
}

export function forbidden(res, message = "Forbidden") {
  return json(res, 403, { code: "forbidden", message });
}

export function methodNotAllowed(res, allowed = ["POST"]) {
  res.setHeader("Allow", allowed.join(", "));
  return json(res, 405, {
    code: "method_not_allowed",
    message: `Allowed methods: ${allowed.join(", ")}`
  });
}

export function serverError(res, error) {
  return json(res, 500, {
    code: "internal_error",
    message: "Unexpected server error",
    details: process.env.NODE_ENV === "production" ? undefined : error.message
  });
}
