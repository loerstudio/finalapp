import { AppwriteDatabaseService, AppwriteRealtimeService } from './appwrite';
import { ChatMessage, User } from '../types';

export class ChatService {
  // Get chat messages between two users
  static async getMessages(userId: string, otherUserId: string): Promise<ChatMessage[]> {
    try {
      console.log('💬 Getting messages between:', userId, 'and', otherUserId);
      
      const response = await AppwriteDatabaseService.getMessages(userId, otherUserId);
      
      const messages: ChatMessage[] = response.documents.map((doc: any) => ({
        id: doc.$id,
        sender_id: doc.sender_id,
        receiver_id: doc.receiver_id,
        message_type: doc.message_type || 'text',
        content: doc.content,
        image_url: doc.image_url,
        metadata: doc.metadata || {},
        read_at: doc.read_at,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      }));
      
      console.log('✅ Retrieved', messages.length, 'messages');
      return messages;
    } catch (error: any) {
      console.error('❌ getMessages error:', error);
      throw new Error(error.message);
    }
  }

  // Send a message
  static async sendMessage(messageData: {
    sender_id: string;
    receiver_id: string;
    content: string;
    message_type?: 'text' | 'image' | 'workout_share' | 'nutrition_share';
    image_url?: string;
    metadata?: Record<string, any>;
  }): Promise<ChatMessage> {
    try {
      console.log('📤 Sending message from', messageData.sender_id, 'to', messageData.receiver_id);
      
      const response = await AppwriteDatabaseService.sendMessage({
        sender_id: messageData.sender_id,
        receiver_id: messageData.receiver_id,
        content: messageData.content,
        message_type: messageData.message_type || 'text',
        metadata: messageData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      console.log('✅ Message sent successfully');
      return response;
    } catch (error: any) {
      console.error('❌ sendMessage error:', error);
      throw new Error(error.message);
    }
  }

  // Mark message as read
  static async markAsRead(messageId: string, userId: string): Promise<void> {
    try {
      console.log('👁️ Marking message as read:', messageId);
      
      await AppwriteDatabaseService.updateMessage(messageId, {
        read_at: new Date().toISOString()
      });
      
      console.log('✅ Message marked as read');
    } catch (error: any) {
      console.error('❌ markAsRead error:', error);
      throw new Error(error.message);
    }
  }

  // Subscribe to real-time messages
  static subscribeToMessages(userId: string, callback: (message: ChatMessage) => void) {
    console.log('🔔 Subscribing to real-time messages for user:', userId);
    
    return AppwriteRealtimeService.subscribeToMessages(userId, (response: any) => {
      if (response.events.includes('databases.*.collections.*.documents.*.create')) {
        const doc = response.payload;
        
        // Only process messages where user is sender or receiver
        if (doc.sender_id === userId || doc.receiver_id === userId) {
          const message: ChatMessage = {
            id: doc.$id,
            sender_id: doc.sender_id,
            receiver_id: doc.receiver_id,
            message_type: doc.message_type,
            content: doc.content,
            image_url: doc.image_url,
            metadata: doc.metadata,
            created_at: doc.created_at,
            updated_at: doc.updated_at
          };
          
          callback(message);
        }
      }
    });
  }

  // Get unread message count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const messages = await AppwriteDatabaseService.getUnreadMessages(userId);
      return messages.documents.length;
    } catch (error) {
      return 0;
    }
  }
}