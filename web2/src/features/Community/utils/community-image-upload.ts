import { supabase } from '../../../lib/supabase';

const COMMUNITY_IMAGE_BUCKET = 'community-media';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

const extractExtension = (fileName: string): string => fileName.split('.').pop()?.toLowerCase() ?? '';

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

const buildStoragePath = (userId: string, prefix: string, file: File): string => {
  const fromMime = guessExtensionFromMime(file.type);
  const fromName = extractExtension(file.name);
  const extension = fromMime || fromName || 'jpg';
  const uniqueName = crypto.randomUUID();

  // Mapping long prefixes to short ones for simpler storage structure
  const shortPrefix = prefix.includes('post') ? 'post' : 'comment';

  return `${userId.toLowerCase()}/${shortPrefix}-${uniqueName}.${extension}`;
};

export const uploadCommunityImageToStorage = async (
  file: File,
  prefix: 'community-post' | 'community-comment',
): Promise<string> => {
  validateImageFile(file);

  const userId = await getAuthenticatedUserId();
  const path = buildStoragePath(userId, prefix, file);

  const { error } = await supabase.storage.from(COMMUNITY_IMAGE_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(error.message || 'Image upload failed.');
  }

  const { data } = supabase.storage.from(COMMUNITY_IMAGE_BUCKET).getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error('Image uploaded, but public URL generation failed.');
  }

  return data.publicUrl;
};
