import { cloudflare } from '@/lib/cloudflareClient';

export async function uploadFile(bucketName: string, filePath: string, file: File) {
  const { data, error } = await cloudflare.storage
    .from(bucketName)
    .upload(filePath, file);

  if (error) {
    return null;
  }

  return data;
}

export async function getFileUrl(bucketName: string, filePath: string) {
  const { data } = cloudflare.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data?.publicUrl || null;
}
