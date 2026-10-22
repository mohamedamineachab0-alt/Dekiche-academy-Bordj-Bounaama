import {
  uploadToNeonStorage,
  getNeonPublicUrl,
  deleteFromNeonStorage,
  neonS3Client,
  DEFAULT_NEON_BUCKET,
} from "./neon-storage";

// Utility to ensure bucket exists (handled via neon.ts / CLI)
export async function ensureBucketExists(bucketName?: string) {
  return true;
}

// Drop-in compatible storage adapter delegating to Neon Object Storage
export const supabase = {
  storage: {
    from: (bucketName: string = DEFAULT_NEON_BUCKET) => ({
      upload: async (
        filePath: string,
        file: any,
        options?: { contentType?: string; upsert?: boolean }
      ) => {
        try {
          const res = await uploadToNeonStorage(file, filePath, {
            contentType: options?.contentType,
            bucket: DEFAULT_NEON_BUCKET,
          });
          return { data: { path: res.key }, error: null };
        } catch (err: any) {
          console.error("Neon Storage upload error:", err);
          return { data: null, error: err };
        }
      },
      getPublicUrl: (filePath: string) => {
        return {
          data: {
            publicUrl: getNeonPublicUrl(filePath, DEFAULT_NEON_BUCKET),
          },
        };
      },
      remove: async (paths: string[]) => {
        try {
          await Promise.all(paths.map((p) => deleteFromNeonStorage(p, DEFAULT_NEON_BUCKET)));
          return { data: paths, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },
      list: async () => ({ data: [], error: null }),
    }),
    listBuckets: async () => ({
      data: [{ name: DEFAULT_NEON_BUCKET }],
      error: null,
    }),
    createBucket: async () => ({ data: null, error: null }),
  },
};

export { neonS3Client, uploadToNeonStorage, getNeonPublicUrl, deleteFromNeonStorage };
