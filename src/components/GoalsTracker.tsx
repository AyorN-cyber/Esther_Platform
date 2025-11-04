import { useState, useEffect } from 'react';
import { Plus, Target, TrendingUp, CheckCircle, Clock, Edit3, Trash2, X, Save } from 'lucide-react';
import { getGoals, addGoal, updateGoal, deleteGoal } from '../lib/supabaseEnhanced';
import { useTheme } from '../contexts/ThemeContext';
import type { Goal } from '../types';

export const GoalsTracker = () => {
  const { theme } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    const goalsData = await getGoals();
    setGoals(goalsData);
    setLoading(false);
  };

  const handleAddGoal = () => {
    const newGoal: Goal = {
      id: '',
      title: '',
      category: 'content',
      target_value: 0,
      current_value: 0,
      start_date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingGoal(newGoal);
    setIsAddingNew(true);
  };

  const handleSaveGoal = async () => {
    if (!editingGoal || !editingGoal.title.trim()) return;

    try {
      if (isAddingNew) {
        const { id, created_at, updated_at, ...goalData } = editingGoal;
        const savedGoal = await addGoal(goalData);
        if (savedGoal) {
          setGoals([savedGoal, ...goals]);
        }
      } else {
        const success = await updateGoal(editingGoal.id, editingGoal);
        if (success) {
          setGoals(goals.map(g => g.id === editingGoal.id ? editingGoal : g));
        }
      }
      setEditingGoal(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Delete this goal?')) return;
    
    const success = await deleteGoal(id);
    if (success) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  const handleUpdateProgress = async (goal: Goal, newValue: number) => {
    const updated = { ...goal, current_value: newValue };
    if (newValue >= goal.target_value && goal.status === 'active') {
      updated.status = 'completed';
    }
    const success = await updateGoal(goal.id, updated);
    if (success) {
      setGoals(goals.map(g => g.id === goal.id ? updated : g));
    }
  };

  const filteredGoals = goals.filter(g => {
    if (filter === 'all') return true;
    return g.status === filter;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      content: 'purple',
      growth: 'blue',
      ministry: 'pink',
      financial: 'green',
      engagement: 'orange',
      learning: 'indigo',
      personal: 'red'
    };
    return colors[category] || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-gray-500',
      medium: 'text-yellow-500',
      high: 'text-red-500'
    };
    return colors[priority] || 'text-gray-500';
  };

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
            Goals Tracker
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Set and track your ministry goals
          </p>
        </div>

        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((f) => (
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
          <button
            onClick={handleAddGoal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <Plus size={20} />
            Add Goal
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.map((goal) => {
          const progress = goal.target_value > 0 
            ? (goal.current_value / goal.target_value) * 100 
            : 0;
          const isCompleted = goal.status === 'completed';
          const daysLeft = goal.target_date 
            ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null;

          return (
            <div
              key={goal.id}
              className={`p-6 rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              } ${isCompleted ? 'opacity-75' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize bg-${getCategoryColor(goal.category)}-100 text-${getCategoryColor(goal.category)}-700`}>
                      {goal.category}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                      {goal.priority}
                    </span>
                  </div>
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {goal.title}
                  </h3>
                  {goal.notes && (
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {goal.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle size={24} className="text-green-500" />
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setIsAddingNew(false);
                        }}
                        className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Edit3 size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 rounded hover:bg-red-100"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Progress
                  </span>
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {goal.current_value} / {goal.target_value} {goal.unit || ''}
                  </span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full transition-all ${
                      isCompleted
                        ? 'bg-green-500'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {progress.toFixed(1)}% complete
                  </span>
                  {!isCompleted && (
                    <input
                      type="number"
                      value={goal.current_value}
                      onChange={(e) => handleUpdateProgress(goal, Number(e.target.value))}
                      className={`w-20 px-2 py-1 text-xs rounded border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* Timeline */}
              {daysLeft !== null && !isCompleted && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : `${Math.abs(daysLeft)} days overdue`}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <Target size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No {filter !== 'all' ? filter : ''} goals yet
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Click "Add Goal" to create your first goal
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {isAddingNew ? 'Add New Goal' : 'Edit Goal'}
                </h3>
                <button
                  onClick={() => {
                    setEditingGoal(null);
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
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={editingGoal.title}
                    onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="e.g., Upload 10 videos this month"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category
                    </label>
                    <select
                      value={editingGoal.category}
                      onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value as any })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="content">Content</option>
                      <option value="growth">Growth</option>
                      <option value="ministry">Ministry</option>
                      <option value="financial">Financial</option>
                      <option value="engagement">Engagement</option>
                      <option value="learning">Learning</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Priority
                    </label>
                    <select
                      value={editingGoal.priority}
                      onChange={(e) => setEditingGoal({ ...editingGoal, priority: e.target.value as any })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Target Value
                    </label>
                    <input
                      type="number"
                      value={editingGoal.target_value}
                      onChange={(e) => setEditingGoal({ ...editingGoal, target_value: Number(e.target.value) })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Current Value
                    </label>
                    <input
                      type="number"
                      value={editingGoal.current_value}
                      onChange={(e) => setEditingGoal({ ...editingGoal, current_value: Number(e.target.value) })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Unit (optional)
                  </label>
                  <input
                    type="text"
                    value={editingGoal.unit || ''}
                    onChange={(e) => setEditingGoal({ ...editingGoal, unit: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="e.g., videos, subscribers, ₦"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={editingGoal.target_date || ''}
                    onChange={(e) => setEditingGoal({ ...editingGoal, target_date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notes
                  </label>
                  <textarea
                    value={editingGoal.notes || ''}
                    onChange={(e) => setEditingGoal({ ...editingGoal, notes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg resize-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Add any notes or strategy..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditingGoal(null);
                    setIsAddingNew(false);
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGoal}
                  disabled={!editingGoal.title.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {isAddingNew ? 'Add Goal' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
