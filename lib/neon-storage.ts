import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

export const DEFAULT_NEON_BUCKET = "public-assets";

export function getNeonS3Client(): S3Client {
  const region = process.env.AWS_REGION || "us-east-2";
  const endpoint = process.env.AWS_ENDPOINT_URL_S3 || "https://br-rough-union-b54r7kqi.storage.c-7.us-east-2.aws.neon.tech";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";

  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

export const neonS3Client = new Proxy({} as S3Client, {
  get(_target, prop) {
    const client = getNeonS3Client();
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});

export function getNeonPublicUrl(key: string, bucket: string = DEFAULT_NEON_BUCKET): string {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3 || "https://br-rough-union-b54r7kqi.storage.c-7.us-east-2.aws.neon.tech";
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  const cleanEndpoint = endpoint.replace(/\/+$/, "");
  return `${cleanEndpoint}/${bucket}/${cleanKey}`;
}

export async function uploadToNeonStorage(
  body: Buffer | Uint8Array | Blob | File | string,
  key: string,
  options?: {
    contentType?: string;
    bucket?: string;
  }
): Promise<{ publicUrl: string; key: string }> {
  const bucket = options?.bucket || DEFAULT_NEON_BUCKET;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;

  let buffer: Buffer;
  let contentType = options?.contentType || "application/octet-stream";

  if (Buffer.isBuffer(body)) {
    buffer = body;
  } else if (typeof (body as any)?.arrayBuffer === "function") {
    buffer = Buffer.from(await (body as Blob | File).arrayBuffer());
    if (!options?.contentType && (body as File).type) {
      contentType = (body as File).type;
    }
  } else if (typeof body === "string") {
    buffer = Buffer.from(body, "utf-8");
  } else {
    buffer = Buffer.from(body as Uint8Array);
  }

  await neonS3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: cleanKey,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return {
    key: cleanKey,
    publicUrl: getNeonPublicUrl(cleanKey, bucket),
  };
}

export async function deleteFromNeonStorage(key: string, bucket: string = DEFAULT_NEON_BUCKET) {
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  await neonS3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: cleanKey,
    })
  );
}
