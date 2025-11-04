import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, DollarSign, Plus, Edit, Trash2, Ticket } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TourDate {
  id: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  date: string;
  time: string;
  ticket_price: number;
  capacity: number;
  tickets_sold: number;
  status: 'upcoming' | 'sold_out' | 'cancelled' | 'completed';
  created_at: string;
}

export default function TourManager() {
  const [dates, setDates] = useState<TourDate[]>([]);
  const [showNewDate, setShowNewDate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState({
    venue: '',
    city: '',
    state: '',
    country: 'USA',
    date: '',
    time: '',
    ticket_price: 0,
    capacity: 0
  });

  useEffect(() => {
    loadDates();
  }, []);

  const loadDates = async () => {
    try {
      const { data, error } = await supabase
        .from('tour_dates')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setDates(data || []);
    } catch (error) {
      console.error('Error loading tour dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDate = async () => {
    try {
      const { error } = await supabase
        .from('tour_dates')
        .insert([{
          ...newDate,
          tickets_sold: 0,
          status: 'upcoming'
        }]);

      if (error) throw error;
      
      setNewDate({ venue: '', city: '', state: '', country: 'USA', date: '', time: '', ticket_price: 0, capacity: 0 });
      setShowNewDate(false);
      loadDates();
    } catch (error) {
      console.error('Error creating tour date:', error);
    }
  };

  const deleteDate = async (id: string) => {
    if (!confirm('Delete this tour date?')) return;
    
    try {
      const { error } = await supabase
        .from('tour_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadDates();
    } catch (error) {
      console.error('Error deleting tour date:', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tour_dates')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      loadDates();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const totalRevenue = dates.reduce((acc, date) => acc + (date.tickets_sold * date.ticket_price), 0);
  const totalTicketsSold = dates.reduce((acc, date) => acc + date.tickets_sold, 0);
  const upcomingShows = dates.filter(d => d.status === 'upcoming').length;

  if (loading) {
    return <div className="text-center py-8">Loading tour dates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Tour Manager</h2>
          <p className="text-gray-400 mt-1">Manage tour dates and ticket sales</p>
        </div>
        <button
          onClick={() => setShowNewDate(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Show
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Upcoming Shows</p>
              <p className="text-2xl font-bold text-white mt-1">{upcomingShows}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">${totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tickets Sold</p>
              <p className="text-2xl font-bold text-white mt-1">{totalTicketsSold}</p>
            </div>
            <Ticket className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Shows</p>
              <p className="text-2xl font-bold text-white mt-1">{dates.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* New Date Form */}
      {showNewDate && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Add New Show</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Venue</label>
                <input
                  type="text"
                  value={newDate.venue}
                  onChange={(e) => setNewDate({ ...newDate, venue: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Madison Square Garden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                <input
                  type="text"
                  value={newDate.city}
                  onChange={(e) => setNewDate({ ...newDate, city: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="New York"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                <input
                  type="text"
                  value={newDate.state}
                  onChange={(e) => setNewDate({ ...newDate, state: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                <input
                  type="text"
                  value={newDate.country}
                  onChange={(e) => setNewDate({ ...newDate, country: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="USA"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={newDate.date}
                  onChange={(e) => setNewDate({ ...newDate, date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                <input
                  type="time"
                  value={newDate.time}
                  onChange={(e) => setNewDate({ ...newDate, time: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ticket Price ($)</label>
                <input
                  type="number"
                  value={newDate.ticket_price}
                  onChange={(e) => setNewDate({ ...newDate, ticket_price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="50.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                <input
                  type="number"
                  value={newDate.capacity}
                  onChange={(e) => setNewDate({ ...newDate, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="5000"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createDate}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Add Show
              </button>
              <button
                onClick={() => setShowNewDate(false)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tour Dates List */}
      <div className="space-y-4">
        {dates.map((date) => {
          const soldPercentage = (date.tickets_sold / date.capacity) * 100;
          
          return (
            <div key={date.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{date.venue}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      date.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                      date.status === 'sold_out' ? 'bg-green-500/20 text-green-400' :
                      date.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {date.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{date.city}, {date.state}, {date.country}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(date.date).toLocaleDateString()} at {date.time}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Ticket Price</p>
                      <p className="text-white font-medium">${date.ticket_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Capacity</p>
                      <p className="text-white font-medium">{date.capacity.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Tickets Sold</p>
                      <p className="text-white font-medium">{date.tickets_sold.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Revenue</p>
                      <p className="text-green-400 font-medium">${(date.tickets_sold * date.ticket_price).toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Sales Progress</span>
                      <span className="text-white">{soldPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {date.status === 'upcoming' && (
                    <>
                      <button
                        onClick={() => updateStatus(date.id, 'sold_out')}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
                      >
                        Mark Sold Out
                      </button>
                      <button
                        onClick={() => updateStatus(date.id, 'cancelled')}
                        className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteDate(date.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {dates.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No tour dates yet. Add your first show!</p>
          </div>
        )}
      </div>
    </div>
  );
}
