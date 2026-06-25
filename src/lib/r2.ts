import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getEnv, hasEnv } from "@/lib/env";

export function isR2Configured() {
  return hasEnv(
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_ARTIST_FILES",
  );
}

function createR2Client() {
  if (!isR2Configured()) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${getEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getEnv("R2_ACCESS_KEY_ID")!,
      secretAccessKey: getEnv("R2_SECRET_ACCESS_KEY")!,
    },
  });
}

export async function createPresignedUploadUrl(input: {
  key: string;
  contentType: string;
  expiresIn?: number;
}) {
  const client = createR2Client();

  if (!client) {
    return null;
  }

  const command = new PutObjectCommand({
    Bucket: getEnv("R2_BUCKET_ARTIST_FILES")!,
    Key: input.key,
    ContentType: input.contentType,
  });

  return getSignedUrl(client, command, { expiresIn: input.expiresIn ?? 600 });
}

export async function createPresignedDownloadUrl(input: {
  key: string;
  expiresIn?: number;
  fileName?: string | null;
  disposition?: "inline" | "attachment";
}) {
  const client = createR2Client();

  if (!client) {
    return null;
  }

  const disposition = input.disposition ?? "attachment";
  const responseContentDisposition = input.fileName
    ? `${disposition}; filename="${input.fileName.replace(/"/g, "")}"`
    : disposition;
  const command = new GetObjectCommand({
    Bucket: getEnv("R2_BUCKET_ARTIST_FILES")!,
    Key: input.key,
    ResponseContentDisposition: responseContentDisposition,
  });

  return getSignedUrl(client, command, { expiresIn: input.expiresIn ?? 300 });
}

export async function uploadR2Object(input: {
  key: string;
  body: Uint8Array;
  contentType: string;
}) {
  const client = createR2Client();

  if (!client) {
    return { ok: false, error: "R2 is not configured" };
  }

  await client.send(
    new PutObjectCommand({
      Bucket: getEnv("R2_BUCKET_ARTIST_FILES")!,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );

  return { ok: true };
}
