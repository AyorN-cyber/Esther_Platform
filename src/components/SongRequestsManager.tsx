import { useState, useEffect } from 'react';
import { Music, ThumbsUp, Edit3, Trash2, X, Save, Star, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

interface SongRequest {
  id: string;
  song_title: string;
  original_artist?: string;
  requested_by_name?: string;
  requested_by_email?: string;
  reason?: string;
  votes: number;
  status: 'new' | 'considering' | 'planned' | 'recording' | 'completed' | 'declined';
  priority_score: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  genre_tags?: string[];
  youtube_reference_url?: string;
  estimated_production_days?: number;
  notes?: string;
  content_calendar_id?: string;
  created_at: string;
  updated_at: string;
}

export const SongRequestsManager = () => {
  const { theme } = useTheme();
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRequest, setEditingRequest] = useState<SongRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'considering' | 'planned'>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'recent' | 'priority'>('votes');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('song_requests')
        .select('*')
        .order('votes', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading song requests:', error);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: SongRequest['status']) => {
    try {
      const { error } = await supabase
        .from('song_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleVote = async (id: string) => {
    try {
      const request = requests.find(r => r.id === id);
      if (!request) return;

      const { error } = await supabase
        .from('song_requests')
        .update({ 
          votes: request.votes + 1,
          priority_score: request.priority_score + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      setRequests(requests.map(r => 
        r.id === id ? { ...r, votes: r.votes + 1, priority_score: r.priority_score + 1 } : r
      ));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleSaveRequest = async () => {
    if (!editingRequest) return;

    try {
      const { error } = await supabase
        .from('song_requests')
        .update(editingRequest)
        .eq('id', editingRequest.id);

      if (error) throw error;
      setRequests(requests.map(r => r.id === editingRequest.id ? editingRequest : r));
      setEditingRequest(null);
    } catch (error) {
      console.error('Error saving request:', error);
      alert('Failed to save request');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Delete this song request?')) return;

    try {
      const { error } = await supabase
        .from('song_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRequests(requests.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'blue',
      considering: 'yellow',
      planned: 'purple',
      recording: 'orange',
      completed: 'green',
      declined: 'red'
    };
    return colors[status] || 'gray';
  };

  const getDifficultyColor = (difficulty?: string) => {
    if (difficulty === 'easy') return 'text-green-500';
    if (difficulty === 'medium') return 'text-yellow-500';
    if (difficulty === 'hard') return 'text-red-500';
    return 'text-gray-500';
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'votes') return b.votes - a.votes;
    if (sortBy === 'priority') return b.priority_score - a.priority_score;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Song Requests
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage fan song requests
          </p>
        </div>

        <div className="flex gap-2">
          {(['all', 'new', 'considering', 'planned'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2">
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Sort by:
        </span>
        {(['votes', 'recent', 'priority'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-3 py-1 rounded text-sm font-medium capitalize ${
              sortBy === s
                ? 'bg-purple-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedRequests.map((request) => (
          <div
            key={request.id}
            className={`p-6 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Music size={20} className="text-purple-500" />
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize bg-${getStatusColor(request.status)}-100 text-${getStatusColor(request.status)}-700`}>
                    {request.status}
                  </span>
                  {request.difficulty && (
                    <span className={`text-xs font-medium ${getDifficultyColor(request.difficulty)}`}>
                      {request.difficulty}
                    </span>
                  )}
                </div>

                <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {request.song_title}
                </h3>

                {request.original_artist && (
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    by {request.original_artist}
                  </p>
                )}

                {request.reason && (
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    "{request.reason}"
                  </p>
                )}

                {request.requested_by_name && (
                  <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Requested by {request.requested_by_name}
                  </p>
                )}

                {request.genre_tags && request.genre_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {request.genre_tags.map((tag, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleVote(request.id)}
                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    <ThumbsUp size={16} />
                    <span className="font-bold">{request.votes}</span>
                    <span>votes</span>
                  </button>

                  {request.priority_score > 0 && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <Star size={16} />
                      <span>{request.priority_score}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditingRequest(request)}
                  className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Edit3 size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                </button>
                <button
                  onClick={() => handleDeleteRequest(request.id)}
                  className="p-2 rounded hover:bg-red-100"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>

            {/* Quick Status Update */}
            <div className="flex gap-2 mt-4">
              {request.status === 'new' && (
                <button
                  onClick={() => handleUpdateStatus(request.id, 'considering')}
                  className="flex-1 px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Consider
                </button>
              )}
              {request.status === 'considering' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'planned')}
                    className="flex-1 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Plan
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(request.id, 'declined')}
                    className="flex-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Decline
                  </button>
                </>
              )}
              {request.status === 'planned' && (
                <button
                  onClick={() => handleUpdateStatus(request.id, 'recording')}
                  className="flex-1 px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Start Recording
                </button>
              )}
              {request.status === 'recording' && (
                <button
                  onClick={() => handleUpdateStatus(request.id, 'completed')}
                  className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        ))}

        {sortedRequests.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <Music size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No song requests yet
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Edit Song Request
                </h3>
                <button
                  onClick={() => setEditingRequest(null)}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      value={editingRequest.status}
                      onChange={(e) => setEditingRequest({ ...editingRequest, status: e.target.value as any })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="considering">Considering</option>
                      <option value="planned">Planned</option>
                      <option value="recording">Recording</option>
                      <option value="completed">Completed</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Difficulty
                    </label>
                    <select
                      value={editingRequest.difficulty || ''}
                      onChange={(e) => setEditingRequest({ ...editingRequest, difficulty: e.target.value as any })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Not set</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority Score
                  </label>
                  <input
                    type="number"
                    value={editingRequest.priority_score}
                    onChange={(e) => setEditingRequest({ ...editingRequest, priority_score: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Estimated Production Days
                  </label>
                  <input
                    type="number"
                    value={editingRequest.estimated_production_days || ''}
                    onChange={(e) => setEditingRequest({ ...editingRequest, estimated_production_days: Number(e.target.value) || undefined })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="e.g., 7"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    YouTube Reference
                  </label>
                  <input
                    type="url"
                    value={editingRequest.youtube_reference_url || ''}
                    onChange={(e) => setEditingRequest({ ...editingRequest, youtube_reference_url: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notes
                  </label>
                  <textarea
                    value={editingRequest.notes || ''}
                    onChange={(e) => setEditingRequest({ ...editingRequest, notes: e.target.value })}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg resize-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Add notes about this request..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingRequest(null)}
                  className={`flex-1 px-4 py-2 border rounded-lg ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRequest}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
