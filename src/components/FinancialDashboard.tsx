import { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, Edit3, Trash2, X, Save, Download } from 'lucide-react';
import { getRevenueExpenses, addRevenueExpense, deleteRevenueExpense, getFinancialSummary } from '../lib/supabaseEnhanced';
import { useTheme } from '../contexts/ThemeContext';
import type { RevenueExpense } from '../types';

export const FinancialDashboard = () => {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<RevenueExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<RevenueExpense | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filter, setFilter] = useState<'all' | 'revenue' | 'expense'>('all');
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'year'>('30d');
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    revenueByCategory: {} as Record<string, number>,
    expensesByCategory: {} as Record<string, number>
  });

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const transactionsData = await getRevenueExpenses(
        startDate.toISOString().split('T')[0]
      );
      setTransactions(transactionsData);

      const summaryData = await getFinancialSummary(
        startDate.toISOString().split('T')[0]
      );
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
    setLoading(false);
  };

  const handleAddTransaction = (type: 'revenue' | 'expense') => {
    const newTransaction: RevenueExpense = {
      id: '',
      transaction_date: new Date().toISOString().split('T')[0],
      type,
      category: '',
      amount: 0,
      currency: 'NGN',
      is_recurring: false,
      created_at: new Date().toISOString()
    };
    setEditingTransaction(newTransaction);
    setIsAddingNew(true);
  };

  const handleSaveTransaction = async () => {
    if (!editingTransaction || !editingTransaction.category || editingTransaction.amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (isAddingNew) {
        const { id, created_at, ...transactionData } = editingTransaction;
        const saved = await addRevenueExpense(transactionData);
        if (saved) {
          setTransactions([saved, ...transactions]);
          await loadData(); // Refresh summary
        }
      }
      setEditingTransaction(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    
    const success = await deleteRevenueExpense(id);
    if (success) {
      setTransactions(transactions.filter(t => t.id !== id));
      await loadData(); // Refresh summary
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const revenueCategories = ['YouTube Ad Revenue', 'Bookings', 'Donations', 'Merchandise', 'Streaming', 'Teaching', 'Sponsorships'];
  const expenseCategories = ['Equipment', 'Software', 'Studio Rental', 'Travel', 'Marketing', 'Website', 'Production', 'Costumes', 'Professional Services'];

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
            Financial Dashboard
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Track revenue and expenses
          </p>
        </div>

        <div className="flex gap-2">
          {(['30d', '90d', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Revenue
            </span>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <p className={`text-3xl font-bold text-green-500`}>
            ₦{summary.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Expenses
            </span>
            <TrendingDown size={20} className="text-red-500" />
          </div>
          <p className={`text-3xl font-bold text-red-500`}>
            ₦{summary.totalExpenses.toLocaleString()}
          </p>
        </div>

        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Net Profit
            </span>
            <DollarSign size={20} className={summary.netProfit >= 0 ? 'text-green-500' : 'text-red-500'} />
          </div>
          <p className={`text-3xl font-bold ${summary.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ₦{summary.netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Revenue by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.revenueByCategory).map(([category, amount]) => {
              const percentage = summary.totalRevenue > 0 ? (amount / summary.totalRevenue) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {category}
                    </span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      ₦{amount.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(summary.revenueByCategory).length === 0 && (
              <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                No revenue recorded yet
              </p>
            )}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Expenses by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.expensesByCategory).map(([category, amount]) => {
              const percentage = summary.totalExpenses > 0 ? (amount / summary.totalExpenses) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {category}
                    </span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      ₦{amount.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(summary.expensesByCategory).length === 0 && (
              <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                No expenses recorded yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Recent Transactions
          </h3>
          <div className="flex gap-2">
            {(['all', 'revenue', 'expense'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm font-medium capitalize ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => handleAddTransaction('revenue')}
              className="px-3 py-1 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700"
            >
              + Revenue
            </button>
            <button
              onClick={() => handleAddTransaction('expense')}
              className="px-3 py-1 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700"
            >
              + Expense
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {filteredTransactions.slice(0, 20).map((transaction) => (
            <div
              key={transaction.id}
              className={`p-4 rounded-lg border flex items-center justify-between ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.type === 'revenue'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {transaction.type}
                  </span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {transaction.category}
                  </span>
                </div>
                {transaction.description && (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {transaction.description}
                  </p>
                )}
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {new Date(transaction.transaction_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold ${
                  transaction.type === 'revenue' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.type === 'revenue' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                </span>
                <button
                  onClick={() => handleDeleteTransaction(transaction.id)}
                  className="p-2 rounded hover:bg-red-100"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              No transactions yet
            </p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Add {editingTransaction.type === 'revenue' ? 'Revenue' : 'Expense'}
                </h3>
                <button
                  onClick={() => {
                    setEditingTransaction(null);
                    setIsAddingNew(false);
                  }}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category *
                  </label>
                  <select
                    value={editingTransaction.category}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, category: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select category</option>
                    {(editingTransaction.type === 'revenue' ? revenueCategories : expenseCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount (₦) *
                  </label>
                  <input
                    type="number"
                    value={editingTransaction.amount}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingTransaction.transaction_date}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, transaction_date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={editingTransaction.description || ''}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg resize-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Add details..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditingTransaction(null);
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
                  onClick={handleSaveTransaction}
                  disabled={!editingTransaction.category || editingTransaction.amount <= 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
