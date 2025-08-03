import { AppwriteDatabaseService } from './appwrite';
import { WorkoutSession, WorkoutFeedback } from '../types';

export class LiveWorkoutService {
  // Start workout session
  static async startWorkoutSession(clientId: string, programId: string): Promise<WorkoutSession> {
    try {
      console.log('🏋️ Starting workout session for client:', clientId);
      
      const response = await AppwriteDatabaseService.createWorkoutSession({
        client_id: clientId,
        program_id: programId,
        week_id: 'week-1',
        day_id: 'day-1',
        started_at: new Date().toISOString(),
        completed_at: null,
        status: 'in_progress',
        exercises: [],
        feedback: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      const session: WorkoutSession = {
        id: response.$id,
        client_id: response.client_id,
        program_id: response.program_id,
        week_id: response.week_id,
        day_id: response.day_id,
        started_at: response.started_at,
        completed_at: response.completed_at,
        status: response.status,
        exercises: response.exercises,
        feedback: response.feedback,
        created_at: response.created_at,
        updated_at: response.updated_at
      };
      
      console.log('✅ Workout session started successfully');
      return session;
    } catch (error: any) {
      console.error('❌ startWorkoutSession error:', error);
      throw new Error(error.message);
    }
  }

  // Complete workout session with feedback
  static async completeWorkoutSession(sessionId: string, feedback: {
    rating: number;
    feeling: string;
    performance: string;
  }): Promise<WorkoutSession> {
    try {
      console.log('✅ Completing workout session:', sessionId);
      
      const response = await AppwriteDatabaseService.updateWorkoutSession(sessionId, {
        completed_at: new Date().toISOString(),
        status: 'completed',
        feedback: {
          rating: feedback.rating,
          feeling: feedback.feeling,
          effort_level: 8, // Default effort level
          notes: feedback.performance,
          created_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      });
      
      const session: WorkoutSession = {
        id: response.$id,
        client_id: response.client_id,
        program_id: response.program_id,
        week_id: response.week_id,
        day_id: response.day_id,
        started_at: response.started_at,
        completed_at: response.completed_at,
        status: response.status,
        exercises: response.exercises,
        feedback: response.feedback,
        created_at: response.created_at,
        updated_at: response.updated_at
      };
      
      console.log('✅ Workout session completed successfully');
      return session;
    } catch (error: any) {
      console.error('❌ completeWorkoutSession error:', error);
      throw new Error(error.message);
    }
  }

  // Get workout session details
  static async getWorkoutSession(sessionId: string): Promise<WorkoutSession | null> {
    try {
      console.log('📋 Getting workout session:', sessionId);
      
      // This would fetch from Appwrite database
      // For now, return mock data
      const session: WorkoutSession = {
        id: sessionId,
        client_id: 'user-pierino',
        program_id: 'program-1',
        week_id: 'week-1',
        day_id: 'day-1',
        started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        completed_at: null,
        status: 'in_progress',
        exercises: [],
        feedback: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ Workout session retrieved');
      return session;
    } catch (error: any) {
      console.error('❌ getWorkoutSession error:', error);
      return null;
    }
  }

  // Update exercise progress
  static async updateExerciseProgress(sessionId: string, exerciseId: string, sets: any[]): Promise<void> {
    try {
      console.log('📈 Updating exercise progress for session:', sessionId);
      
      // This would update in Appwrite database
      // For now, just log it
      console.log('✅ Exercise progress updated:', { sessionId, exerciseId, sets });
    } catch (error: any) {
      console.error('❌ updateExerciseProgress error:', error);
      throw new Error(error.message);
    }
  }

  // Get workout feedback history
  static async getWorkoutFeedbackHistory(clientId: string): Promise<WorkoutFeedback[]> {
    try {
      console.log('📊 Getting workout feedback history for client:', clientId);
      
      // Mock feedback history
      const feedbackHistory: WorkoutFeedback[] = [
        {
          id: 'feedback-1',
          session_id: 'session-1',
          rating: 4,
          feeling: 'good',
          effort_level: 8,
          notes: 'Ottimo allenamento, mi sono sentito forte',
          created_at: new Date().toISOString()
        },
        {
          id: 'feedback-2',
          session_id: 'session-2',
          rating: 3,
          feeling: 'okay',
          effort_level: 6,
          notes: 'Un po\' stanco oggi',
          created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
      ];
      
      console.log('✅ Retrieved', feedbackHistory.length, 'feedback entries');
      return feedbackHistory;
    } catch (error: any) {
      console.error('❌ getWorkoutFeedbackHistory error:', error);
      return [];
    }
  }

  // Get workout summary for home screen
  static async getWorkoutSummary(clientId: string): Promise<{
    total_sessions: number;
    average_rating: number;
    total_duration: number;
    recent_feedback: WorkoutFeedback[];
  }> {
    try {
      console.log('📊 Getting workout summary for client:', clientId);
      
      const feedbackHistory = await this.getWorkoutFeedbackHistory(clientId);
      
      const summary = {
        total_sessions: feedbackHistory.length,
        average_rating: feedbackHistory.length > 0 
          ? feedbackHistory.reduce((sum, f) => sum + f.rating, 0) / feedbackHistory.length 
          : 0,
        total_duration: feedbackHistory.length * 45, // Assume 45 minutes per session
        recent_feedback: feedbackHistory.slice(0, 5)
      };
      
      console.log('✅ Workout summary retrieved');
      return summary;
    } catch (error: any) {
      console.error('❌ getWorkoutSummary error:', error);
      return {
        total_sessions: 0,
        average_rating: 0,
        total_duration: 0,
        recent_feedback: []
      };
    }
  }
} 