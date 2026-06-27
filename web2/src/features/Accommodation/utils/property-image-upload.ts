import { supabase } from '../../../lib/supabase';

const PROPERTY_IMAGE_BUCKET = 'deal-images';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
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
    throw new Error('Image size must be 10MB or less.');
  }
};

const getAuthenticatedUserId = async (): Promise<string> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Please sign in again before uploading images.');
  }

  return user.id;
};

const buildStoragePath = (userId: string, file: File): string => {
  const fromMime = guessExtensionFromMime(file.type);
  const fromName = extractExtension(file.name);
  const extension = fromMime || fromName || 'jpg';
  const uniqueName = crypto.randomUUID();

  return `${userId.toLowerCase()}/${uniqueName}.${extension}`;
};

export const uploadPropertyImageToStorage = async (file: File): Promise<string> => {
  validateImageFile(file);

  const userId = await getAuthenticatedUserId();
  const path = buildStoragePath(userId, file);

  const { error } = await supabase.storage.from(PROPERTY_IMAGE_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(error.message || 'Image upload failed.');
  }

  const { data } = supabase.storage.from(PROPERTY_IMAGE_BUCKET).getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error('Image uploaded, but public URL generation failed.');
  }

  return data.publicUrl;
};

export const deletePropertyImageFromStorage = async (publicUrl: string): Promise<void> => {
  if (!publicUrl) return;
  try {
    const marker = `/storage/v1/object/public/${PROPERTY_IMAGE_BUCKET}/`;
    const index = publicUrl.indexOf(marker);
    if (index === -1) return;
    
    const path = publicUrl.slice(index + marker.length);
    const { error } = await supabase.storage.from(PROPERTY_IMAGE_BUCKET).remove([path]);
    
    if (error) {
      console.error('Failed to delete property image from storage:', error.message);
    }
  } catch (err) {
    console.error('Exception deleting property image:', err);
  }
};
