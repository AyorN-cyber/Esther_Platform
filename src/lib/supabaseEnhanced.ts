/**
 * Enhanced Supabase Data Layer - Phase 1
 * Handles Goals, Notifications, Analytics, Financial data
 */

import { supabase } from './supabase';
import type { 
  Goal, 
  RevenueExpense, 
  Milestone, 
  AnalyticsVisitor, 
  EnhancedNotification,
  FanMessage,
  AnalyticsSummary 
} from '../types';

// ==================== GOALS ====================

export const getGoals = async (): Promise<Goal[]> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
};

export const addGoal = async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal | null> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .insert([goal])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding goal:', error);
    return null;
  }
};

export const updateGoal = async (id: string, updates: Partial<Goal>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating goal:', error);
    return false;
  }
};

export const deleteGoal = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting goal:', error);
    return false;
  }
};

// ==================== FINANCIAL ====================

export const getRevenueExpenses = async (
  startDate?: string,
  endDate?: string
): Promise<RevenueExpense[]> => {
  try {
    let query = supabase
      .from('revenue_expenses')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (startDate) {
      query = query.gte('transaction_date', startDate);
    }
    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching revenue/expenses:', error);
    return [];
  }
};

export const addRevenueExpense = async (
  transaction: Omit<RevenueExpense, 'id' | 'created_at'>
): Promise<RevenueExpense | null> => {
  try {
    const { data, error } = await supabase
      .from('revenue_expenses')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
};

export const updateRevenueExpense = async (
  id: string,
  updates: Partial<RevenueExpense>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('revenue_expenses')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
};

export const deleteRevenueExpense = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('revenue_expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
};

export const getFinancialSummary = async (
  startDate?: string,
  endDate?: string
): Promise<{
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
}> => {
  try {
    const transactions = await getRevenueExpenses(startDate, endDate);
    
    const revenue = transactions.filter(t => t.type === 'revenue');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalRevenue = revenue.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const revenueByCategory: Record<string, number> = {};
    revenue.forEach(t => {
      revenueByCategory[t.category] = (revenueByCategory[t.category] || 0) + t.amount;
    });
    
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      revenueByCategory,
      expensesByCategory
    };
  } catch (error) {
    console.error('Error calculating financial summary:', error);
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      revenueByCategory: {},
      expensesByCategory: {}
    };
  }
};

// ==================== NOTIFICATIONS ====================

export const getNotifications = async (userId: string): Promise<EnhancedNotification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const addNotification = async (
  notification: Omit<EnhancedNotification, 'id' | 'created_at'>
): Promise<EnhancedNotification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding notification:', error);
    return null;
  }
};

export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

export const deleteNotification = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};

// ==================== ANALYTICS ====================

export const getAnalyticsVisitors = async (
  startDate?: string,
  endDate?: string
): Promise<AnalyticsVisitor[]> => {
  try {
    let query = supabase
      .from('analytics_visitors')
      .select('*')
      .order('visitor_date', { ascending: false });

    if (startDate) {
      query = query.gte('visitor_date', startDate);
    }
    if (endDate) {
      query = query.lte('visitor_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return [];
  }
};

export const trackVisitor = async (visitorData: Partial<AnalyticsVisitor>): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existing } = await supabase
      .from('analytics_visitors')
      .select('*')
      .eq('visitor_date', today)
      .eq('device_type', visitorData.device_type || 'desktop')
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('analytics_visitors')
        .update({
          visitor_count: existing.visitor_count + 1,
          page_views: existing.page_views + 1
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Create new record
      const { error } = await supabase
        .from('analytics_visitors')
        .insert([{
          visitor_date: today,
          visitor_count: 1,
          unique_visitors: 1,
          page_views: 1,
          device_type: visitorData.device_type || 'desktop',
          browser: visitorData.browser,
          country: visitorData.country,
          city: visitorData.city,
          referrer_source: visitorData.referrer_source
        }]);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return false;
  }
};

// ==================== MILESTONES ====================

export const getMilestones = async (): Promise<Milestone[]> => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return [];
  }
};

export const updateMilestone = async (id: string, updates: Partial<Milestone>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating milestone:', error);
    return false;
  }
};

// ==================== FAN MESSAGES ====================

export const getFanMessages = async (status?: string): Promise<FanMessage[]> => {
  try {
    let query = supabase
      .from('fan_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching fan messages:', error);
    return [];
  }
};

export const updateFanMessage = async (id: string, updates: Partial<FanMessage>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fan_messages')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating fan message:', error);
    return false;
  }
};

// ==================== ANALYTICS SUMMARY ====================

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  try {
    // Get videos count
    const { data: videos } = await supabase.from('videos').select('status');
    const totalVideos = videos?.length || 0;
    const completedVideos = videos?.filter(v => v.status === 'completed').length || 0;
    const pendingVideos = videos?.filter(v => v.status === 'pending').length || 0;

    // Get visitors
    const { data: visitors } = await supabase
      .from('analytics_visitors')
      .select('visitor_count, page_views');
    const totalVisitors = visitors?.reduce((sum, v) => sum + v.visitor_count, 0) || 0;
    const totalViews = visitors?.reduce((sum, v) => sum + v.page_views, 0) || 0;

    // Get financial summary
    const financial = await getFinancialSummary();

    // Get goals
    const { data: goals } = await supabase.from('goals').select('status');
    const activeGoals = goals?.filter(g => g.status === 'active').length || 0;
    const completedGoals = goals?.filter(g => g.status === 'completed').length || 0;

    // Get notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('is_read')
      .eq('is_read', false);
    const unreadNotifications = notifications?.length || 0;

    // Get fan messages
    const { data: messages } = await supabase
      .from('fan_messages')
      .select('status')
      .eq('status', 'unread');
    const unreadMessages = messages?.length || 0;

    // Calculate growth rate (last 7 days vs previous 7 days)
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const previous7Days = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: recentVisitors } = await supabase
      .from('analytics_visitors')
      .select('visitor_count')
      .gte('visitor_date', last7Days);
    const recentCount = recentVisitors?.reduce((sum, v) => sum + v.visitor_count, 0) || 0;

    const { data: previousVisitors } = await supabase
      .from('analytics_visitors')
      .select('visitor_count')
      .gte('visitor_date', previous7Days)
      .lt('visitor_date', last7Days);
    const previousCount = previousVisitors?.reduce((sum, v) => sum + v.visitor_count, 0) || 0;

    const growthRate = previousCount > 0 
      ? ((recentCount - previousCount) / previousCount) * 100 
      : 0;

    return {
      totalVisitors,
      totalViews,
      totalVideos,
      completedVideos,
      pendingVideos,
      totalRevenue: financial.totalRevenue,
      totalExpenses: financial.totalExpenses,
      netProfit: financial.netProfit,
      activeGoals,
      completedGoals,
      unreadNotifications,
      unreadMessages,
      growthRate,
      avgEngagement: totalVideos > 0 ? totalViews / totalVideos : 0
    };
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return {
      totalVisitors: 0,
      totalViews: 0,
      totalVideos: 0,
      completedVideos: 0,
      pendingVideos: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      activeGoals: 0,
      completedGoals: 0,
      unreadNotifications: 0,
      unreadMessages: 0,
      growthRate: 0,
      avgEngagement: 0
    };
  }
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export const subscribeToNotifications = (userId: string, callback: (notifications: EnhancedNotification[]) => void) => {
  const channel = supabase
    .channel('notifications_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        const notifications = await getNotifications(userId);
        callback(notifications);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToGoals = (callback: (goals: Goal[]) => void) => {
  const channel = supabase
    .channel('goals_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'goals'
      },
      async () => {
        const goals = await getGoals();
        callback(goals);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
