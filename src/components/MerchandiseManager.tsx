import React, { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingUp, AlertCircle, Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sold: number;
  category: string;
  image_url?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  created_at: string;
}

export default function MerchandiseManager() {
  const [items, setItems] = useState<MerchItem[]>([]);
  const [showNewItem, setShowNewItem] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'apparel'
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('merchandise')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading merchandise:', error);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async () => {
    try {
      const { error } = await supabase
        .from('merchandise')
        .insert([{
          ...newItem,
          sold: 0,
          status: newItem.stock > 0 ? 'active' : 'out_of_stock'
        }]);

      if (error) throw error;
      
      setNewItem({ name: '', description: '', price: 0, stock: 0, category: 'apparel' });
      setShowNewItem(false);
      loadItems();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from('merchandise')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('merchandise')
        .update({ 
          stock: newStock,
          status: newStock > 0 ? 'active' : 'out_of_stock'
        })
        .eq('id', id);

      if (error) throw error;
      loadItems();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const totalRevenue = items.reduce((acc, item) => acc + (item.sold * item.price), 0);
  const totalSold = items.reduce((acc, item) => acc + item.sold, 0);
  const lowStockItems = items.filter(item => item.stock > 0 && item.stock < 10);

  if (loading) {
    return <div className="text-center py-8">Loading merchandise...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Merchandise Manager</h2>
          <p className="text-gray-400 mt-1">Manage your store inventory and sales</p>
        </div>
        <button
          onClick={() => setShowNewItem(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-white mt-1">{items.length}</p>
            </div>
            <Package className="w-8 h-8 text-purple-500" />
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
              <p className="text-gray-400 text-sm">Items Sold</p>
              <p className="text-2xl font-bold text-white mt-1">{totalSold}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-white mt-1">{lowStockItems.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-yellow-500 font-medium">Low Stock Alert</h3>
              <p className="text-gray-400 text-sm mt-1">
                {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low on stock
              </p>
            </div>
          </div>
        </div>
      )}

      {/* New Item Form */}
      {showNewItem && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Add New Item</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="T-Shirt, Poster, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="apparel">Apparel</option>
                  <option value="accessories">Accessories</option>
                  <option value="music">Music</option>
                  <option value="posters">Posters</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Item description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price ($)</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="29.99"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Initial Stock</label>
                <input
                  type="number"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createItem}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Add Item
              </button>
              <button
                onClick={() => setShowNewItem(false)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                <span className="text-xs text-gray-400 uppercase">{item.category}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'active' ? 'bg-green-500/20 text-green-400' :
                item.status === 'out_of_stock' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price:</span>
                <span className="text-white font-medium">${item.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Stock:</span>
                <span className={`font-medium ${item.stock < 10 ? 'text-yellow-400' : 'text-white'}`}>
                  {item.stock} units
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Sold:</span>
                <span className="text-white font-medium">{item.sold} units</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Revenue:</span>
                <span className="text-green-400 font-medium">${(item.sold * item.price).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Add stock"
                className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    const addStock = parseInt(input.value);
                    if (addStock > 0) {
                      updateStock(item.id, item.stock + addStock);
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                onClick={() => deleteItem(item.id)}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No merchandise items yet. Add your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
