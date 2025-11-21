
/**
 * Video Upload Service
 * Handles uploading video files to storage (Supabase/Cloudinary)
 */

export const uploadVideoFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // validate file
  if (!file.type.startsWith('video/')) {
    throw new Error('Invalid file type. Please upload a video file.');
  }

  const maxSize = 200 * 1024 * 1024; // 200MB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds 200MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
  }

  // For now, we will simulate the upload since we might not have a backend storage bucket configured for large videos
  // In a real app, this would upload to Supabase Storage or Cloudinary

  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      onProgress?.(progress);

      if (progress >= 100) {
        clearInterval(interval);
        // Create a local object URL for preview purposes
        // In production, this would be the actual remote URL
        const url = URL.createObjectURL(file);
        resolve(url);
      }
    }, 100);
  });
};
