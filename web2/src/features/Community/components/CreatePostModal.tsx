import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { getTopics } from '../api/community.api';
import type { CreatePostDto } from '../dtos/community.dtos';
import { uploadCommunityImageToStorage } from '../utils/community-image-upload';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePostDto) => Promise<boolean>;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [existingTopics, setExistingTopics] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const mediaPreview = useMemo(() => mediaUrls, [mediaUrls]);

  // ─── Lifecycle & Animation Handlers ───
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-active');
      
      void getTopics().then(res => {
        if (res.success) {
          setExistingTopics(res.data.map(t => t.topic));
        }
      });

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        document.body.classList.remove('modal-active');
      };
    } else {
      setIsVisible(false);
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsVisible(false);
    setTimeout(onClose, 350);
  }, [onClose, isAnimating]);

  if (!isOpen && !isAnimating) return null;

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files).slice(0, 6 - mediaUrls.length);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const url = await uploadCommunityImageToStorage(file, 'community-post');
        uploadedUrls.push(url);
      }

      setMediaUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetForm = () => {
    setContent('');
    setTopic('');
    setMediaUrls([]);
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !topic.trim() || uploading) return;

    setLoading(true);
    const success = await onSubmit({
      content,
      topic,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    });
    setLoading(false);
    
    if (success) {
      resetForm();
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={loading || uploading ? undefined : handleClose} 
      />

      {/* Modal Content */}
      <div 
        className={`
          relative bg-white w-full sm:h-auto sm:max-h-[98vh] sm:max-w-lg rounded-t-3xl sm:rounded-3xl 
          shadow-2xl will-change-transform overflow-hidden
          transition-all duration-[350ms] sm:duration-200
          ${isVisible 
            ? 'translate-y-0 opacity-100 sm:scale-100' 
            : 'translate-y-full opacity-0 sm:scale-95'
          }
          ease-[cubic-bezier(0.22,1,0.36,1)] sm:ease-out
        `}
        style={{ transform: !isVisible && !window.matchMedia('(min-width: 640px)').matches ? 'translate3d(0, 100%, 0)' : undefined }}
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden flex justify-center py-2 sticky top-0 bg-white z-20">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
          <div>
            <h3 className="text-base font-bold text-[#0e2a47]">Create a Post</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-bold">Community Hub</p>
          </div>
          <button 
            onClick={handleClose} 
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all border-none cursor-pointer bg-transparent disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] sm:max-h-none overflow-y-auto custom-scrollbar">
          {/* Topic Section */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">Topic</label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Resort Reviews, Budget Travel..."
                list="topic-suggestions"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#0e2a47] focus:outline-none focus:border-[#2dd4af] focus:ring-2 focus:ring-[#2dd4af]/10 transition-all font-bold placeholder:text-slate-300 disabled:bg-slate-50 disabled:opacity-50"
                required
              />
              <datalist id="topic-suggestions">
                {existingTopics.map(t => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            {topic && !existingTopics.includes(topic) && (
              <p className="mt-1.5 text-[10px] text-[#2dd4af] font-bold px-1 flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Creating a new topic
              </p>
            )}
          </div>

          {/* Content Section */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">Your Experience</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your travel experiences, questions, or deals..."
              className="w-full h-32 p-4 text-sm text-[#0e2a47] bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-[#2dd4af] focus:ring-2 focus:ring-[#2dd4af]/10 transition-all resize-none placeholder:text-slate-300 font-medium disabled:bg-slate-50"
              disabled={loading}
              required
            />
          </div>

          {/* Media Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5">Photos ({mediaUrls.length}/6)</label>
              <label className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                ${mediaUrls.length >= 6 || loading || uploading 
                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                  : 'bg-[#2dd4af]/10 text-[#2dd4af] hover:bg-[#2dd4af]/20'}
              `}>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Add
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  multiple
                  className="hidden"
                  disabled={loading || uploading || mediaUrls.length >= 6}
                  onChange={(e) => {
                    void handleFilesSelected(e.target.files);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {uploadError}
              </div>
            )}

            {mediaPreview.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {mediaPreview.map((url, index) => (
                  <div key={`${url}-${index}`} className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square group">
                    <img
                      src={url}
                      alt={`Selected media ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-xs hover:bg-black/70 transition-all border-none cursor-pointer"
                      disabled={loading || uploading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {uploading && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" /></svg>
                Uploading Images...
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 sticky bottom-0 bg-white sm:relative sm:pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-all border-none cursor-pointer bg-transparent"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || !topic.trim() || loading || uploading}
              className="px-6 py-2.5 bg-[#2dd4af] hover:bg-[#25b898] text-white rounded-xl font-bold text-sm shadow-md shadow-[#2dd4af]/20 transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" /></svg>
                  Posting...
                </>
              ) : (
                <>
                  Post Now
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
