import { useState, useEffect, useRef } from 'react';
import { Plus, Edit3, Trash2, GripVertical, Save, X, ExternalLink, Upload, Link as LinkIcon } from 'lucide-react';
import { getVideos, addVideo, updateVideo, deleteVideo, reorderVideos } from '../lib/supabaseData';
import type { Video } from '../types';

interface VideoManagerProps {
  onVideoChange?: () => void;
}

export const VideoManager: React.FC<VideoManagerProps> = ({ onVideoChange }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'link' | 'file'>('link');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    const videosData = await getVideos();
    setVideos(videosData);
    setLoading(false);
  };

  const handleAddVideo = () => {
    const newVideo: Video = {
      id: `temp_${Date.now()}`,
      title: '',
      video_link: '',
      thumbnail_url: '',
      status: 'pending',
      template_type: 'default',
      order_index: videos.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingVideo(newVideo);
    setIsAddingNew(true);
  };

  const handleSaveVideo = async () => {
    if (!editingVideo) return;

    try {
      if (isAddingNew) {
        const { id, created_at, updated_at, ...videoData } = editingVideo;
        const savedVideo = await addVideo(videoData);
        if (savedVideo) {
          setVideos([...videos, savedVideo]);
        }
      } else {
        const success = await updateVideo(editingVideo.id, editingVideo);
        if (success) {
          setVideos(videos.map(v => v.id === editingVideo.id ? editingVideo : v));
        }
      }
      
      setEditingVideo(null);
      setIsAddingNew(false);
      onVideoChange?.();
      await loadVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Failed to save video. Please try again.');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const success = await deleteVideo(videoId);
      if (success) {
        setVideos(videos.filter(v => v.id !== videoId));
        onVideoChange?.();
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newVideos = [...videos];
    const draggedVideo = newVideos[draggedIndex];
    newVideos.splice(draggedIndex, 1);
    newVideos.splice(index, 0, draggedVideo);
    
    const reorderedVideos = newVideos.map((video, idx) => ({
      ...video,
      order_index: idx
    }));
    
    setVideos(reorderedVideos);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex !== null) {
      try {
        await reorderVideos(videos);
        onVideoChange?.();
      } catch (error) {
        console.error('Error reordering videos:', error);
        await loadVideos();
      }
    }
    setDraggedIndex(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#2d1b4e]/50 backdrop-blur-xl rounded-2xl border border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Video Management
        </h2>
        <button
          onClick={handleAddVideo}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <Plus size={20} />
          Add Video
        </button>
      </div>

      <div className="space-y-4">
        {videos.map((video, index) => (
          <div
            key={video.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`p-4 border border-purple-500/20 rounded-lg cursor-move transition-all bg-purple-500/10 hover:bg-purple-500/20 ${draggedIndex === index ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-4">
              <GripVertical size={20} className="text-purple-300" />
              
              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  {video.title || 'Untitled Video'}
                </h3>
                <p className="text-sm text-purple-300">
                  Status: {video.status} • Order: {video.order_index}
                </p>
                {video.video_link && (
                  <a
                    href={video.video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                    View Video
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingVideo(video);
                    setIsAddingNew(false);
                  }}
                  className="p-2 rounded hover:bg-purple-500/20 transition-colors"
                >
                  <Edit3 size={16} className="text-purple-300" />
                </button>
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="p-2 rounded hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {videos.length === 0 && (
          <div className="text-center py-8 text-purple-300">
            No videos yet. Click "Add Video" to get started.
          </div>
        )}
      </div>

      {editingVideo && (
        <div className="modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-start justify-center overflow-y-auto">
          <div className="w-full max-w-md bg-[#2d1b4e] backdrop-blur-xl rounded-2xl shadow-xl border border-purple-500/30 my-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {isAddingNew ? 'Add New Video' : 'Edit Video'}
                </h3>
                <button
                  onClick={() => {
                    setEditingVideo(null);
                    setIsAddingNew(false);
                  }}
                  className="p-1 rounded hover:bg-purple-500/20 transition-colors"
                >
                  <X size={20} className="text-purple-300" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-purple-200">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editingVideo.title}
                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                    className="w-full px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-purple-400"
                    placeholder="Enter video title"
                  />
                </div>

                {/* Upload Method Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-200">
                    Upload Method
                  </label>
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('link')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        uploadMethod === 'link'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
                      }`}
                    >
                      <LinkIcon size={16} />
                      Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('file')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        uploadMethod === 'file'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
                      }`}
                    >
                      <Upload size={16} />
                      Upload File (Max 200MB)
                    </button>
                  </div>
                </div>

                {/* Video Link Input */}
                {uploadMethod === 'link' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-purple-200">
                    Video Link
                  </label>
                  <input
                    type="url"
                    value={editingVideo.video_link || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, video_link: e.target.value })}
                    className="w-full px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-purple-400"
                      placeholder="https://youtube.com/watch?v=... or https://cloudinary.com/..."
                    />
                  </div>
                )}

                {/* File Upload */}
                {uploadMethod === 'file' && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-purple-200">
                      Video File (Max 200MB)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Check file size (200MB = 200 * 1024 * 1024 bytes)
                        const maxSize = 200 * 1024 * 1024;
                        if (file.size > maxSize) {
                          alert(`File size exceeds 200MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
                          return;
                        }

                        setUploading(true);
                        setUploadProgress(0);

                        try {
                          // Create a FormData object
                          const formData = new FormData();
                          formData.append('file', file);

                          // For now, we'll use a placeholder upload URL
                          // In production, you'd upload to Cloudinary, Supabase Storage, or your own server
                          // This is a simplified version - you'll need to implement actual upload logic
                          
                          // Simulate upload progress
                          const progressInterval = setInterval(() => {
                            setUploadProgress(prev => {
                              if (prev >= 90) {
                                clearInterval(progressInterval);
                                return 90;
                              }
                              return prev + 10;
                            });
                          }, 200);

                          // TODO: Replace with actual upload endpoint
                          // Example: const response = await fetch('/api/upload-video', { method: 'POST', body: formData });
                          // const { videoUrl } = await response.json();
                          
                          // For now, create a temporary URL
                          const videoUrl = URL.createObjectURL(file);
                          
                          setTimeout(() => {
                            clearInterval(progressInterval);
                            setUploadProgress(100);
                            setEditingVideo({ ...editingVideo, video_link: videoUrl });
                            setUploading(false);
                            alert('Note: This is a temporary URL. In production, upload to Cloudinary or Supabase Storage for permanent storage.');
                          }, 2000);

                        } catch (error) {
                          console.error('Upload error:', error);
                          alert('Failed to upload video. Please try again or use a link instead.');
                          setUploading(false);
                          setUploadProgress(0);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className={`w-full px-4 py-3 border-2 border-dashed rounded-lg transition-all ${
                        uploading
                          ? 'border-purple-400 bg-purple-500/10'
                          : 'border-purple-500/30 bg-purple-500/10 hover:border-purple-500 hover:bg-purple-500/20'
                      }`}
                    >
                      {uploading ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2 text-purple-300">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300"></div>
                            <span>Uploading... {uploadProgress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full overflow-hidden bg-purple-500/20">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-600 to-purple-700 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload size={24} className="text-purple-300" />
                          <span className="text-purple-200">
                            Click to select video file
                          </span>
                          <span className="text-xs text-purple-400">
                            Max size: 200MB
                          </span>
                        </div>
                      )}
                    </button>
                    {editingVideo.video_link && uploadMethod === 'file' && (
                      <p className="mt-2 text-xs text-purple-400">
                        Video URL: {editingVideo.video_link.substring(0, 50)}...
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1 text-purple-200">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={editingVideo.thumbnail_url || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail_url: e.target.value })}
                    className="w-full px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-purple-400"
                    placeholder="https://img.youtube.com/vi/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-purple-200">
                    Status
                  </label>
                  <select
                    value={editingVideo.status}
                    onChange={(e) => setEditingVideo({ ...editingVideo, status: e.target.value as 'pending' | 'completed' })}
                    className="w-full px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
                  >
                    <option value="pending" className="bg-[#2d1b4e]">Pending</option>
                    <option value="completed" className="bg-[#2d1b4e]">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditingVideo(null);
                    setIsAddingNew(false);
                  }}
                  className="flex-1 px-4 py-2 border border-purple-500/30 rounded-lg transition-colors text-purple-200 hover:bg-purple-500/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVideo}
                  disabled={!editingVideo.title.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {isAddingNew ? 'Add Video' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
