import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, GripVertical, Save, X, ExternalLink } from 'lucide-react';
import { getVideos, addVideo, updateVideo, deleteVideo, reorderVideos } from '../lib/supabaseData';
import { useTheme } from '../contexts/ThemeContext';
import type { Video } from '../types';

interface VideoManagerProps {
  onVideoChange?: () => void;
}

export const VideoManager: React.FC<VideoManagerProps> = ({ onVideoChange }) => {
  const { theme } = useTheme();
  const [videos, setVideos] = useState<Video[]>([]);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
            className={`p-4 border rounded-lg cursor-move transition-all ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            } ${draggedIndex === index ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-4">
              <GripVertical size={20} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
              
              <div className="flex-1">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {video.title || 'Untitled Video'}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Status: {video.status} • Order: {video.order_index}
                </p>
                {video.video_link && (
                  <a
                    href={video.video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
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
                  className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                >
                  <Edit3 size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                </button>
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="p-2 rounded hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {videos.length === 0 && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No videos yet. Click "Add Video" to get started.
          </div>
        )}
      </div>

      {editingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {isAddingNew ? 'Add New Video' : 'Edit Video'}
                </h3>
                <button
                  onClick={() => {
                    setEditingVideo(null);
                    setIsAddingNew(false);
                  }}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X size={20} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editingVideo.title}
                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter video title"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Video Link
                  </label>
                  <input
                    type="url"
                    value={editingVideo.video_link || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, video_link: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={editingVideo.thumbnail_url || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail_url: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="https://img.youtube.com/vi/..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={editingVideo.status}
                    onChange={(e) => setEditingVideo({ ...editingVideo, status: e.target.value as 'pending' | 'completed' })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditingVideo(null);
                    setIsAddingNew(false);
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
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
