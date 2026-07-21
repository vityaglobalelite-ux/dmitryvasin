/**
 * Upload compressed landing intro video to Supabase Storage (public bucket).
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_URL="https://api.betango.dance"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *   node scripts/upload-landing-video.mjs
 *
 * Optional:
 *   $env:VIDEO_PATH="C:\\Users\\Victor\\Downloads\\landing-explore-tango-1080p.mp4"
 *   $env:BUCKET="landing"
 *   $env:OBJECT_PATH="explore-tango-1080p.mp4"
 */
import { readFileSync, statSync } from "node:fs";
import { basename } from "node:path";

const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const videoPath =
  process.env.VIDEO_PATH ||
  "C:\\Users\\Victor\\Downloads\\landing-explore-tango-1080p.mp4";
const bucket = process.env.BUCKET || "landing";
const objectPath = process.env.OBJECT_PATH || "explore-tango-1080p.mp4";

if (!supabaseUrl || !serviceKey || serviceKey.startsWith("your-")) {
  console.error(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (real service role JWT).",
  );
  process.exit(1);
}

const size = statSync(videoPath).size;
console.log(`Uploading ${basename(videoPath)} (${(size / 1024 / 1024).toFixed(1)} MB) → ${bucket}/${objectPath}`);

async function ensureBucket() {
  const listRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
  });
  if (!listRes.ok) {
    throw new Error(`List buckets failed: ${listRes.status} ${await listRes.text()}`);
  }
  const buckets = await listRes.json();
  if (buckets.some((b) => b.name === bucket || b.id === bucket)) {
    console.log(`Bucket "${bucket}" already exists`);
    return;
  }

  const createRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: 200 * 1024 * 1024,
      allowed_mime_types: ["video/mp4"],
    }),
  });
  if (!createRes.ok) {
    throw new Error(`Create bucket failed: ${createRes.status} ${await createRes.text()}`);
  }
  console.log(`Created public bucket "${bucket}"`);
}

async function upload() {
  const body = readFileSync(videoPath);
  const uploadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "video/mp4",
        "x-upsert": "true",
      },
      body,
    },
  );
  if (!uploadRes.ok) {
    throw new Error(`Upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
  }
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
  console.log("OK");
  console.log(`Public URL:\n${publicUrl}`);
  console.log(
    `\nAdd to .env:\nNEXT_PUBLIC_LANDING_INTRO_VIDEO_URL=${publicUrl}`,
  );
}

await ensureBucket();
await upload();
