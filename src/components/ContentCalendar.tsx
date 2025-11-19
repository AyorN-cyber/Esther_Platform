import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Plus, Edit3, Trash2, X, Save, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

interface ContentItem {
  id: string;
  title: string;
  content_type: 'cover' | 'original' | 'worship_moment' | 'testimony' | 'bts' | 'live' | 'collaboration';
  scripture_reference?: string;
  target_publish_date?: string;
  platforms: string[];
  status: 'idea' | 'planning' | 'recording' | 'editing' | 'review' | 'scheduled' | 'published' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  notes?: string;
  video_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const ContentCalendar = () => {
  const { theme } = useTheme();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'in-progress'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_calendar')
        .select('*')
        .order('target_publish_date', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading content calendar:', error);
    }
    setLoading(false);
  };

  const handleAddItem = () => {
    const newItem: ContentItem = {
      id: '',
      title: '',
      content_type: 'cover',
      platforms: [],
      status: 'idea',
      priority: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingItem(newItem);
    setIsAddingNew(true);
  };

  const handleSaveItem = async () => {
    if (!editingItem || !editingItem.title.trim()) return;

    try {
      if (isAddingNew) {
        const { id, created_at, updated_at, ...itemData } = editingItem;
        const { data, error } = await supabase
          .from('content_calendar')
          .insert([itemData])
          .select()
          .single();

        if (error) throw error;
        if (data) setItems([...items, data]);
      } else {
        const { error } = await supabase
          .from('content_calendar')
          .update(editingItem)
          .eq('id', editingItem.id);

        if (error) throw error;
        setItems(items.map(i => i.id === editingItem.id ? editingItem : i));
      }

      setEditingItem(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this content item?')) return;

    try {
      const { error } = await supabase
        .from('content_calendar')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setItems(items.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      idea: 'gray',
      planning: 'blue',
      recording: 'purple',
      editing: 'yellow',
      review: 'orange',
      scheduled: 'green',
      published: 'emerald',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgent') return '🔴';
    if (priority === 'high') return '🟠';
    if (priority === 'medium') return '🟡';
    return '🟢';
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return item.target_publish_date && new Date(item.target_publish_date) > new Date();
    }
    if (filter === 'in-progress') {
      return ['planning', 'recording', 'editing', 'review'].includes(item.status);
    }
    return true;
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
          <h2 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
            Content Calendar
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
            Plan and schedule your content
          </p>
        </div>

        <div className="flex gap-2">
          {(['all', 'upcoming', 'in-progress'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-800 text-gray-100 hover:bg-gray-700'
                  : 'bg-black text-gray-100 hover:bg-gray-900'
              }`}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <Plus size={20} />
            Add Content
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map((item) => {
          const daysUntil = item.target_publish_date 
            ? Math.ceil((new Date(item.target_publish_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null;

          return (
            <div
              key={item.id}
              className={`p-6 rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-900/80 border-purple-500/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getPriorityIcon(item.priority)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize bg-${getStatusColor(item.status)}-100 text-${getStatusColor(item.status)}-700`}>
                      {item.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-800/50 text-gray-300'}`}>
                      {item.content_type.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
                    {item.title}
                  </h3>

                  {item.scripture_reference && (
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                      📖 {item.scripture_reference}
                    </p>
                  )}

                  {item.notes && (
                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                      {item.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.platforms.map((platform) => (
                      <span
                        key={platform}
                        className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-800/50 text-gray-300'}`}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>

                  {item.target_publish_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} />
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}>
                        {new Date(item.target_publish_date).toLocaleDateString()} 
                        {daysUntil !== null && (
                          <span className={daysUntil < 0 ? 'text-red-500' : daysUntil < 7 ? 'text-orange-500' : ''}>
                            {' '}({daysUntil > 0 ? `in ${daysUntil} days` : daysUntil === 0 ? 'today' : `${Math.abs(daysUntil)} days overdue`})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsAddingNew(false);
                    }}
                    className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-800/50'}`}
                  >
                    <Edit3 size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded hover:bg-red-100"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              No content planned yet
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Click "Add Content" to start planning
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal - Using Portal */}
      {editingItem && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-900/80'} rounded-lg shadow-xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
                  {isAddingNew ? 'Add Content' : 'Edit Content'}
                </h3>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsAddingNew(false);
                  }}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-800/50'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-900/80 border-purple-500/30 text-white'
                    }`}
                    placeholder="e.g., Amazing Grace Cover"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                      Content Type
                    </label>
                    <select
                      value={editingItem.content_type}
                      onChange={(e) => setEditingItem({ ...editingItem, content_type: e.target.value as any })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-900/80 border-purple-500/30 text-white'
                      }`}
                    >
                      <option value="cover">Cover</option>
                      <option value="original">Original</option>
                      <option value="worship_moment">Worship Moment</option>
                      <option value="testimony">Testimony</option>
                      <option value="bts">Behind the Scenes</option>
                      <option value="live">Live Performance</option>
                      <option value="collaboration">Collaboration</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                      Status
                    </label>
                    <select
                      value={editingItem.status}
                      onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-900/80 border-purple-500/30 text-white'
                      }`}
                    >
                      <option value="idea">Idea</option>
                      <option value="planning">Planning</option>
                      <option value="recording">Recording</option>
                      <option value="editing">Editing</option>
                      <option value="review">Review</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                      Priority
                    </label>
                    <select
                      value={editingItem.priority}
                      onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value as any })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-900/80 border-purple-500/30 text-white'
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={editingItem.target_publish_date || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, target_publish_date: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-900/80 border-purple-500/30 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                    Scripture Reference
                  </label>
                  <input
                    type="text"
                    value={editingItem.scripture_reference || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, scripture_reference: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-900/80 border-purple-500/30 text-white'
                    }`}
                    placeholder="e.g., Psalm 23:1-6"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                    Platforms
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['YouTube', 'Instagram', 'TikTok', 'Facebook'].map((platform) => (
                      <label key={platform} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingItem.platforms.includes(platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditingItem({ ...editingItem, platforms: [...editingItem.platforms, platform] });
                            } else {
                              setEditingItem({ ...editingItem, platforms: editingItem.platforms.filter(p => p !== platform) });
                            }
                          }}
                          className="rounded"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                          {platform}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-300'}`}>
                    Notes
                  </label>
                  <textarea
                    value={editingItem.notes || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg resize-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-900/80 border-purple-500/30 text-white'
                    }`}
                    placeholder="Add any notes or ideas..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsAddingNew(false);
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-purple-500/30 text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveItem}
                  disabled={!editingItem.title.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {isAddingNew ? 'Add Content' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
