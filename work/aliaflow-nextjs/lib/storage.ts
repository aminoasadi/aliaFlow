import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/**
 * ArvanCloud object storage is S3-compatible. The bucket's public host
 * (e.g. https://aliaflow.s3.ir-thr-at1.arvanstorage.ir) already embeds the
 * bucket name in a virtual-hosted style, so the SDK talks to the bare
 * region endpoint while `publicUrlBase` is used to build shareable URLs.
 */
const ARVAN_S3_ENDPOINT = process.env.ARVAN_S3_ENDPOINT;
const ARVAN_S3_REGION = process.env.ARVAN_S3_REGION || "ir-thr-at1";
const ARVAN_S3_BUCKET = process.env.ARVAN_S3_BUCKET;
const ARVAN_S3_ACCESS_KEY = process.env.ARVAN_S3_ACCESS_KEY;
const ARVAN_S3_SECRET_KEY = process.env.ARVAN_S3_SECRET_KEY;
const ARVAN_S3_PUBLIC_URL_BASE = process.env.ARVAN_S3_PUBLIC_URL_BASE;

export const isS3Configured = Boolean(
  ARVAN_S3_ENDPOINT && ARVAN_S3_BUCKET && ARVAN_S3_ACCESS_KEY && ARVAN_S3_SECRET_KEY,
);

function resolvePublicUrlBase(): string | undefined {
  if (ARVAN_S3_PUBLIC_URL_BASE) return ARVAN_S3_PUBLIC_URL_BASE.replace(/\/$/, "");
  if (!ARVAN_S3_ENDPOINT || !ARVAN_S3_BUCKET) return undefined;
  const host = ARVAN_S3_ENDPOINT.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${ARVAN_S3_BUCKET}.${host}`;
}

export const publicUrlBase = resolvePublicUrlBase();

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (!isS3Configured) {
    throw new Error("ArvanCloud S3 storage is not configured. Set ARVAN_S3_* env vars.");
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: ARVAN_S3_REGION,
      endpoint: ARVAN_S3_ENDPOINT,
      forcePathStyle: false,
      credentials: {
        accessKeyId: ARVAN_S3_ACCESS_KEY!,
        secretAccessKey: ARVAN_S3_SECRET_KEY!,
      },
    });
  }
  return cachedClient;
}

export async function putPublicObject(key: string, body: Buffer, contentType: string): Promise<string> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: ARVAN_S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: "public-read",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${publicUrlBase}/${key}`;
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(new DeleteObjectCommand({ Bucket: ARVAN_S3_BUCKET!, Key: key }));
}

export async function listObjectKeys(): Promise<string[]> {
  if (!isS3Configured) return [];
  const keys: string[] = [];
  let continuationToken: string | undefined;
  do {
    const result = await getClient().send(
      new ListObjectsV2Command({
        Bucket: ARVAN_S3_BUCKET!,
        ContinuationToken: continuationToken,
      }),
    );
    for (const object of result.Contents ?? []) {
      if (object.Key) keys.push(object.Key);
    }
    continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (continuationToken);
  return keys;
}

export function urlForKey(key: string): string {
  return `${publicUrlBase}/${key}`;
}

export function keyFromPublicUrl(url: string): string | null {
  if (!publicUrlBase || !url.startsWith(`${publicUrlBase}/`)) return null;
  return url.slice(publicUrlBase.length + 1);
}
