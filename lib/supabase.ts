import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Missing Supabase environment variables. Storage functions will fail.");
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key"
);

// Utility to ensure a bucket exists
export async function ensureBucketExists(bucketName: string) {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error("Error listing buckets:", error);
      return false;
    }
    
    if (!buckets.some(b => b.name === bucketName)) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      });
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("ensureBucketExists failed:", err);
    return false;
  }
}
