import express from "express";
import { getSupabaseAdmin } from "./supabaseAdmin.js";
import crypto from "crypto";

export const thumbRoute = express.Router();

const THUMB_BUCKET = process.env.THUMB_BUCKET || "thumbnails";

const ALLOW_HOSTS = [
  "books.google.com",
  "books.googleusercontent.com",
  "lh3.googleusercontent.com",
  "shopping-phinf.pstatic.net",
  "bookthumb-phinf.pstatic.net",
  "ssl.pstatic.net",
  "kakaocdn.net",
  "daumcdn.net",
];

function assertAllowedSrc(src) {
  let url;
  try {
    url = new URL(src);
  } catch {
    throw new Error("invalid_src");
  }

  const host = url.hostname.toLowerCase();
  const allowed = ALLOW_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));

  if (!allowed) throw new Error("src_not_allowed");

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("invalid_protocol");
  }

  return url.toString();
}

function makeThumbPath(src) {
  const hash = crypto
    .createHash("sha256")
    .update(src)
    .digest("hex")
    .slice(0, 32);

  return `thumb/${hash}`;
}

thumbRoute.get("/thumb", async (req, res) => {
  const src = req.query.src;

  if (!src || typeof src !== "string") {
    return res.status(400).json({ message: "src query is required" });
  }

  let allowedSrc;
  try {
    allowedSrc = assertAllowedSrc(src);
  } catch (e) {
    return res.status(400).json({ message: "invalid_src" });
  }

  const path = makeThumbPath(allowedSrc);

  const supabaseAdmin = getSupabaseAdmin();

  try {
    const { data: file } = await supabaseAdmin.storage
      .from(THUMB_BUCKET)
      .download(path);

    if (file) {
      const { data } = supabaseAdmin.storage
        .from(THUMB_BUCKET)
        .getPublicUrl(path);

      return res.redirect(302, data.publicUrl);
    }
  } catch {}

  let upstream;
  try {
    upstream = await fetch(allowedSrc, {
      redirect: "follow",
      headers: {
        accept: "image/*",
        "user-agent": "BookLogThumbProxy/1.0",
      },
    });
  } catch {
    return res.status(502).json({ message: "upstream_fetch_failed" });
  }

  if (!upstream.ok) {
    return res.status(502).json({ message: `upstream_${upstream.status}` });
  }

  const contentType = upstream.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    return res.status(502).json({ message: "upstream_not_image" });
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(THUMB_BUCKET)
    .upload(path, buffer, {
      upsert: true,
      contentType,
      cacheControl: "31536000",
    });

  if (uploadError) {
    return res.status(500).json({ message: "storage_upload_failed" });
  }

  const { data } = supabaseAdmin.storage.from(THUMB_BUCKET).getPublicUrl(path);

  return res.redirect(302, data.publicUrl);
});
