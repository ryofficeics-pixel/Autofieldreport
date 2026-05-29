async function jsonRequest(path, token, body) {
  if (!token) throw new Error("Missing session token");
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${data.code || "error"}: ${data.message || "request failed"}`);
  return data;
}

export async function uploadReportPhoto({
  token,
  companyId,
  projectId,
  module,
  recordId,
  file,
  caption
}) {
  const sign = await jsonRequest("/api/cloudinary-signature", token, {
    companyId,
    projectId,
    module,
    recordId,
    fileType: file.type,
    fileSize: file.size
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sign.apiKey);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);
  formData.append("folder", sign.folder);
  formData.append("context", sign.context);

  const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });
  const cloudData = await cloudRes.json();
  if (!cloudRes.ok) {
    throw new Error(cloudData.error?.message || "Cloudinary upload failed");
  }
  if (!cloudData.public_id || !cloudData.secure_url) {
    throw new Error("Cloudinary response missing required media identifiers");
  }

  const mediaRes = await jsonRequest("/api/media-register", token, {
    companyId,
    projectId,
    module,
    recordId,
    cloudinaryPublicId: cloudData.public_id,
    secureUrl: cloudData.secure_url,
    resourceType: cloudData.resource_type,
    format: cloudData.format,
    bytes: cloudData.bytes,
    width: cloudData.width,
    height: cloudData.height,
    caption: caption || null
  });

  return {
    media: mediaRes.media,
    cloudinary: cloudData
  };
}
