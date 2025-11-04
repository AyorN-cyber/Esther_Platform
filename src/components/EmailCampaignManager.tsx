import React, { useState, useEffect } from 'react';
import { Send, Users, Mail, TrendingUp, Calendar, Eye, Trash2, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Campaign {
  id: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_for?: string;
  sent_at?: string;
  recipients_count: number;
  open_rate?: number;
  click_rate?: number;
  created_at: string;
}

export default function EmailCampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCampaign, setNewCampaign] = useState({
    subject: '',
    content: '',
    scheduled_for: '',
    target_audience: 'all'
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .insert([{
          ...newCampaign,
          status: newCampaign.scheduled_for ? 'scheduled' : 'draft',
          recipients_count: 0
        }]);

      if (error) throw error;
      
      setNewCampaign({ subject: '', content: '', scheduled_for: '', target_audience: 'all' });
      setShowNewCampaign(false);
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const sendCampaign = async (id: string) => {
    if (!confirm('Send this campaign now?')) return;
    
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Email Campaigns</h2>
          <p className="text-gray-400 mt-1">Send newsletters and announcements to your fans</p>
        </div>
        <button
          onClick={() => setShowNewCampaign(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Campaigns</p>
              <p className="text-2xl font-bold text-white mt-1">{campaigns.length}</p>
            </div>
            <Mail className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Sent</p>
              <p className="text-2xl font-bold text-white mt-1">
                {campaigns.filter(c => c.status === 'sent').length}
              </p>
            </div>
            <Send className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Open Rate</p>
              <p className="text-2xl font-bold text-white mt-1">
                {campaigns.filter(c => c.open_rate).length > 0
                  ? Math.round(campaigns.reduce((acc, c) => acc + (c.open_rate || 0), 0) / campaigns.filter(c => c.open_rate).length)
                  : 0}%
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Scheduled</p>
              <p className="text-2xl font-bold text-white mt-1">
                {campaigns.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* New Campaign Form */}
      {showNewCampaign && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Create New Campaign</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <input
                type="text"
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Campaign subject line..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
              <textarea
                value={newCampaign.content}
                onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Email content..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                <select
                  value={newCampaign.target_audience}
                  onChange={(e) => setNewCampaign({ ...newCampaign, target_audience: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Subscribers</option>
                  <option value="active">Active Users</option>
                  <option value="vip">VIP Members</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Schedule For (Optional)</label>
                <input
                  type="datetime-local"
                  value={newCampaign.scheduled_for}
                  onChange={(e) => setNewCampaign({ ...newCampaign, scheduled_for: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createCampaign}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Create Campaign
              </button>
              <button
                onClick={() => setShowNewCampaign(false)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{campaign.subject}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                    campaign.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{campaign.content}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    {campaign.recipients_count} recipients
                  </div>
                  
                  {campaign.open_rate !== undefined && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Eye className="w-4 h-4" />
                      {campaign.open_rate}% opened
                    </div>
                  )}
                  
                  {campaign.click_rate !== undefined && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <TrendingUp className="w-4 h-4" />
                      {campaign.click_rate}% clicked
                    </div>
                  )}
                  
                  {campaign.sent_at && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      Sent {new Date(campaign.sent_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {campaign.status === 'draft' && (
                  <button
                    onClick={() => sendCampaign(campaign.id)}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                    title="Send Now"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => deleteCampaign(campaign.id)}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {campaigns.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No campaigns yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
