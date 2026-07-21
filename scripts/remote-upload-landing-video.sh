#!/bin/bash
set -euo pipefail

KEY=$(grep "^SERVICE_ROLE_KEY=" /root/supabase/docker/.env | cut -d= -f2-)
VIDEO=/tmp/landing-explore-tango-1080p.mp4
BUCKET=landing
OBJECT=explore-tango-1080p.mp4

# Reach Kong via docker network
KONG_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' supabase-kong)
STORAGE_URL="http://${KONG_IP}:8000/storage/v1"

echo "Using $STORAGE_URL"

for i in $(seq 1 30); do
  if curl -sf "http://${KONG_IP}:8000/" >/dev/null 2>&1 || curl -sf "${STORAGE_URL}/bucket" -H "Authorization: Bearer $KEY" -H "apikey: $KEY" >/dev/null 2>&1; then
    echo "kong ready"
    break
  fi
  sleep 1
done

LIST=$(curl -sS "${STORAGE_URL}/bucket" -H "Authorization: Bearer $KEY" -H "apikey: $KEY")
echo "buckets=$LIST"

if ! echo "$LIST" | grep -q "\"name\":\"$BUCKET\""; then
  echo "Creating bucket $BUCKET"
  curl -sS -X POST "${STORAGE_URL}/bucket" \
    -H "Authorization: Bearer $KEY" \
    -H "apikey: $KEY" \
    -H "Content-Type: application/json" \
    -d "{\"id\":\"$BUCKET\",\"name\":\"$BUCKET\",\"public\":true,\"file_size_limit\":209715200,\"allowed_mime_types\":[\"video/mp4\"]}"
  echo
else
  echo "Bucket exists"
fi

echo "Uploading $(du -h "$VIDEO" | cut -f1)..."
curl -sS -X POST "${STORAGE_URL}/object/${BUCKET}/${OBJECT}" \
  -H "Authorization: Bearer $KEY" \
  -H "apikey: $KEY" \
  -H "Content-Type: video/mp4" \
  -H "x-upsert: true" \
  --data-binary @"$VIDEO"
echo

PUBLIC="https://api.betango.dance/storage/v1/object/public/${BUCKET}/${OBJECT}"
echo "Public URL: $PUBLIC"
curl -sS -o /dev/null -w "HEAD %{http_code} content_length=%{size_download}\n" -I "$PUBLIC"
curl -sS -o /dev/null -w "RANGE %{http_code}\n" -H "Range: bytes=0-1023" "$PUBLIC"
