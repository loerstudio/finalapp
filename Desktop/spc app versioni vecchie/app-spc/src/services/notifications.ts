import { supabase } from './supabase';
import { ApiResponse } from '../types';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'workout_reminder' | 'new_message' | 'goal_achieved' | 'nutrition_reminder' | 'general';
  data: any;
  read_at?: string;
  created_at: string;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(
    userId: string,
    title: string,
    body: string,
    type: Notification['type'] = 'general',
    data: any = {}
  ): Promise<ApiResponse<Notification>> {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          body,
          type,
          data
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Notification created:', title);

      return {
        data: notification,
        success: true,
        message: 'Notification created successfully'
      };

    } catch (error: any) {
      console.error('❌ createNotification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create notification'
      };
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(page = 1, pageSize = 20): Promise<ApiResponse<Notification[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      return {
        data: notifications || [],
        success: true
      };

    } catch (error: any) {
      console.error('getUserNotifications error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch notifications'
      };
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      return {
        data: true,
        success: true
      };

    } catch (error: any) {
      console.error('markAsRead error:', error);
      return {
        success: false,
        error: error.message || 'Failed to mark notification as read'
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) throw error;

      return {
        data: true,
        success: true
      };

    } catch (error: any) {
      console.error('markAllAsRead error:', error);
      return {
        success: false,
        error: error.message || 'Failed to mark all notifications as read'
      };
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<ApiResponse<number>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) throw error;

      return {
        data: count || 0,
        success: true
      };

    } catch (error: any) {
      console.error('getUnreadCount error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get unread count'
      };
    }
  }

  /**
   * Subscribe to real-time notifications
   */
  static subscribeToNotifications(callback: (notification: Notification) => void) {
    const { data: { user } } = supabase.auth.getUser();
    
    return supabase
      .channel('user_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  }

  /**
   * Create notification for new chat message
   */
  static async notifyNewMessage(receiverId: string, senderName: string, messagePreview: string): Promise<void> {
    try {
      await this.createNotification(
        receiverId,
        `Nuovo messaggio da ${senderName}`,
        messagePreview,
        'new_message',
        { sender_name: senderName }
      );
    } catch (error) {
      console.error('Failed to create message notification:', error);
    }
  }

  /**
   * Create notification for workout reminder
   */
  static async notifyWorkoutReminder(clientId: string, workoutName: string): Promise<void> {
    try {
      await this.createNotification(
        clientId,
        'Promemoria Allenamento',
        `È ora di fare: ${workoutName}`,
        'workout_reminder',
        { workout_name: workoutName }
      );
    } catch (error) {
      console.error('Failed to create workout reminder:', error);
    }
  }

  /**
   * Create notification for goal achievement
   */
  static async notifyGoalAchieved(clientId: string, goalTitle: string): Promise<void> {
    try {
      await this.createNotification(
        clientId,
        'Obiettivo Raggiunto! 🎉',
        `Congratulazioni! Hai raggiunto: ${goalTitle}`,
        'goal_achieved',
        { goal_title: goalTitle }
      );
    } catch (error) {
      console.error('Failed to create goal achievement notification:', error);
    }
  }

  /**
   * Create notification for nutrition reminder
   */
  static async notifyNutritionReminder(clientId: string, message: string): Promise<void> {
    try {
      await this.createNotification(
        clientId,
        'Promemoria Nutrizione',
        message,
        'nutrition_reminder'
      );
    } catch (error) {
      console.error('Failed to create nutrition reminder:', error);
    }
  }

  /**
   * Delete old notifications (cleanup)
   */
  static async cleanupOldNotifications(daysOld = 30): Promise<ApiResponse<boolean>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;

      console.log(`✅ Cleaned up notifications older than ${daysOld} days`);

      return {
        data: true,
        success: true
      };

    } catch (error: any) {
      console.error('cleanupOldNotifications error:', error);
      return {
        success: false,
        error: error.message || 'Failed to cleanup notifications'
      };
    }
  }
}

export default NotificationService;