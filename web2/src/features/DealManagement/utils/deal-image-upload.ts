import { supabase } from '../../../lib/supabase';

const DEAL_IMAGE_BUCKET = 'deal-images';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

const extractExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ?? '';
};

const guessExtensionFromMime = (mimeType: string): string => {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return '';
  }
};

const validateImageFile = (file: File): void => {
  const fileExtension = extractExtension(file.name);

  if (!ALLOWED_MIME_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.has(fileExtension)) {
    throw new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image size must be 5MB or less.');
  }
};

const getAuthenticatedUserId = async (): Promise<string> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('Error fetching user:', error);
    throw new Error('Please sign in again before uploading images.');

  }

  return user.id;
};

const buildStoragePath = (userId: string, slotKey: string, file: File): string => {
  const fromMime = guessExtensionFromMime(file.type);
  const fromName = extractExtension(file.name);
  const extension = fromMime || fromName || 'jpg';
  const uniqueName = crypto.randomUUID();

  return `${userId.toLowerCase()}/${slotKey}-${uniqueName}.${extension}`;
};

export const uploadDealImageToStorage = async (
  file: File,
  slotKey: 'primaryImageUrl' | 'secondImageUrl' | 'thirdImageUrl' | 'fourthImageUrl',
): Promise<string> => {
  validateImageFile(file);

  const userId = await getAuthenticatedUserId();
  const path = buildStoragePath(userId, slotKey, file);

  const { error } = await supabase.storage.from(DEAL_IMAGE_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(error.message || 'Image upload failed.');
  }

  const { data } = supabase.storage.from(DEAL_IMAGE_BUCKET).getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error('Image uploaded, but public URL generation failed.');
  }

  return data.publicUrl;
};

export const deleteDealImageFromStorage = async (publicUrl: string): Promise<void> => {
  if (!publicUrl) return;
  try {
    const marker = `/storage/v1/object/public/${DEAL_IMAGE_BUCKET}/`;
    const index = publicUrl.indexOf(marker);
    if (index === -1) return;
    
    const path = publicUrl.slice(index + marker.length);
    const { error } = await supabase.storage.from(DEAL_IMAGE_BUCKET).remove([path]);
    
    if (error) {
      console.error('Failed to delete deal image from storage:', error.message);
      // We don't throw error to not interrupt the main flow (e.g. updating deal)
    }
  } catch (err) {
    console.error('Exception deleting deal image:', err);
  }
};
