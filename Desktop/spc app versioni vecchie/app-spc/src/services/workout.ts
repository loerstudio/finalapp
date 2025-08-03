import { AppwriteDatabaseService } from './appwrite';
import { WorkoutProgram, WorkoutSession, Exercise, ApiResponse } from '../types';

export class WorkoutService {
  // Get workout programs for user
  static async getWorkoutPrograms(userId: string): Promise<WorkoutProgram[]> {
    try {
      console.log('💪 Getting workout programs for user:', userId);
      
      const response = await AppwriteDatabaseService.getWorkoutPrograms(userId);
      
      const programs: WorkoutProgram[] = response.documents.map((doc: any) => ({
        id: doc.$id,
        name: doc.name,
        description: doc.description,
        coach_id: doc.coach_id,
        client_id: doc.client_id,
        is_active: doc.is_active,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        weeks: doc.weeks || []
      }));
      
      console.log('✅ Retrieved', programs.length, 'workout programs');
      return programs;
    } catch (error: any) {
      console.error('❌ getWorkoutPrograms error:', error);
      throw new Error(error.message);
    }
  }

  // Create workout program
  static async createWorkoutProgram(programData: {
    name: string;
    description?: string;
    coach_id: string;
    client_id: string;
  }): Promise<WorkoutProgram> {
    try {
      console.log('🏋️ Creating workout program:', programData.name);
      
      const response = await AppwriteDatabaseService.createWorkoutProgram({
        name: programData.name,
        description: programData.description || '',
        coach_id: 'current-coach-id', // Will be set from current user
        client_id: programData.client_id,
        is_active: true,
        weeks: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      console.log('✅ Workout program created successfully');
      return response;
    } catch (error: any) {
      console.error('❌ createWorkoutProgram error:', error);
      throw new Error(error.message);
    }
  }

  // Get exercises from Evolution Fit
  static async getExercises(): Promise<Exercise[]> {
    try {
      console.log('🏋️ Getting exercises from Evolution Fit...');
      
      const { EvolutionFitService } = await import('./evolutionFit');
      const exercises = await EvolutionFitService.getExercises();
      
      console.log('✅ Retrieved', exercises.length, 'exercises from Evolution Fit');
      return exercises;
    } catch (error: any) {
      console.error('❌ getExercises error:', error);
      throw new Error(error.message);
    }
  }

  // Create workout session
  static async createWorkoutSession(sessionData: {
    client_id: string;
    program_id: string;
    week_id: string;
    day_id: string;
  }): Promise<WorkoutSession> {
    try {
      console.log('🎯 Creating workout session');
      
      const response = await AppwriteDatabaseService.createWorkoutSession({
        ...sessionData,
        started_at: new Date().toISOString(),
        status: 'in_progress'
      });
      
      const session: WorkoutSession = {
        id: response.$id,
        client_id: response.client_id,
        program_id: response.program_id,
        week_id: response.week_id,
        day_id: response.day_id,
        started_at: response.started_at,
        status: response.status,
        created_at: response.created_at,
        updated_at: response.updated_at,
        exercises: []
      };
      
      console.log('✅ Workout session created successfully');
      return session;
    } catch (error: any) {
      console.error('❌ createWorkoutSession error:', error);
      throw new Error(error.message);
    }
  }

  // Complete workout session
  static async completeWorkoutSession(sessionId: string): Promise<void> {
    try {
      console.log('✅ Completing workout session:', sessionId);
      
      await AppwriteDatabaseService.updateWorkoutSession(sessionId, {
        completed_at: new Date().toISOString(),
        status: 'completed'
      });
      
      console.log('✅ Workout session completed successfully');
    } catch (error: any) {
      console.error('❌ completeWorkoutSession error:', error);
      throw new Error(error.message);
    }
  }

  // Get workout sessions for user
  static async getWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
    try {
      console.log('📊 Getting workout sessions for user:', userId);
      
      const response = await AppwriteDatabaseService.getWorkoutSessions(userId);
      
      const sessions: WorkoutSession[] = response.documents.map((doc: any) => ({
        id: doc.$id,
        client_id: doc.client_id,
        program_id: doc.program_id,
        week_id: doc.week_id,
        day_id: doc.day_id,
        started_at: doc.started_at,
        completed_at: doc.completed_at,
        status: doc.status,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        exercises: []
      }));
      
      console.log('✅ Retrieved', sessions.length, 'workout sessions');
      return sessions;
    } catch (error: any) {
      console.error('❌ getWorkoutSessions error:', error);
      throw new Error(error.message);
    }
  }
}