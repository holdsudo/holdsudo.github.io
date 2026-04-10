const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
});

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(origin),
  });
}

function buildEmail(payload) {
  const title = payload.formType === "dealer_partner"
    ? "Dealer Partner Inquiry"
    : "Contact Form Inquiry";

  const fields = [
    ["Form Type", payload.formType],
    ["First Name", payload.firstName],
    ["Last Name", payload.lastName],
    ["Company Name", payload.companyName],
    ["Contact Person", payload.contactPerson],
    ["Email", payload.email],
    ["Phone", payload.phone],
    ["Message", payload.message],
    ["Page", payload.page],
    ["User Agent", payload.userAgent],
  ].filter(([, value]) => value);

  return {
    subject: `${title} from ${payload.contactPerson || payload.firstName || "Website Visitor"}`,
    text: fields.map(([label, value]) => `${label}: ${value}`).join("\n"),
  };
}

async function sendViaResend(payload, env) {
  const email = buildEmail(payload);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.NOTIFY_FROM_EMAIL,
      to: [env.NOTIFY_TO_EMAIL],
      subject: email.subject,
      text: email.text,
      reply_to: payload.email || undefined,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend failed: ${detail}`);
  }
}

function isAllowedOrigin(requestOrigin, allowedOrigin) {
  if (!allowedOrigin || allowedOrigin === "*") return true;
  return requestOrigin === allowedOrigin;
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";
    const requestOrigin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      if (!isAllowedOrigin(requestOrigin, origin)) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, {
        status: 204,
        headers: corsHeaders(requestOrigin || origin),
      });
    }

    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/api/forms") {
      return json({ error: "Not found" }, 404, requestOrigin || origin);
    }

    if (!isAllowedOrigin(requestOrigin, origin)) {
      return json({ error: "Origin not allowed" }, 403, requestOrigin || origin);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400, requestOrigin || origin);
    }

    if (payload.website) {
      return json({ message: "Accepted" }, 200, requestOrigin || origin);
    }

    if (!payload.formType || !payload.email || !payload.message) {
      return json({ error: "Missing required fields" }, 400, requestOrigin || origin);
    }

    if (!env.RESEND_API_KEY) {
      return json({ error: "RESEND_API_KEY is not configured" }, 500, requestOrigin || origin);
    }

    try {
      await sendViaResend(payload, env);
      return json({ message: "Thanks. Your request has been sent." }, 200, requestOrigin || origin);
    } catch (error) {
      return json({ error: error.message || "Unable to send email" }, 502, requestOrigin || origin);
    }
  },
};
