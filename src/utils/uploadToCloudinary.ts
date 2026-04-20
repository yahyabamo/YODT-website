/**
 * uploadToCloudinary.ts
 * Uploads a file to Cloudinary using an unsigned upload preset.
 * Returns the secure URL of the uploaded image.
 */

const CLOUD_NAME = 'dknz5c7d0';
const UPLOAD_PRESET = 'activity_unsigned';

export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? 'Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url as string;
}
