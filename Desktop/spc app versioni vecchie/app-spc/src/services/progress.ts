import { AppwriteDatabaseService } from './appwrite';
import { ProgressGoal, User } from '../types';

export class ProgressService {
  // Create progress goal
  static async createProgressGoal(goalData: {
    client_id: string;
    title: string;
    description: string;
    goal_type: string;
    start_value: number;
    target_value: number;
    target_date: string;
    unit: string;
  }): Promise<ProgressGoal> {
    try {
      console.log('🎯 Creating progress goal:', goalData.title);
      
      const response = await AppwriteDatabaseService.createProgressGoal({
        client_id: goalData.client_id,
        title: goalData.title,
        description: goalData.description,
        goal_type: goalData.goal_type,
        target_value: goalData.target_value,
        current_value: goalData.start_value,
        unit: goalData.unit,
        target_date: goalData.target_date,
        is_achieved: false,
        progress_updates: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      const goal: ProgressGoal = {
        id: response.$id,
        client_id: response.client_id,
        goal_type: response.goal_type,
        title: response.title,
        description: response.description,
        target_value: response.target_value,
        current_value: response.current_value,
        unit: response.unit,
        target_date: response.target_date,
        is_achieved: response.is_achieved,
        progress_updates: response.progress_updates,
        created_at: response.created_at,
        updated_at: response.updated_at
      };
      
      console.log('✅ Progress goal created successfully');
      return goal;
    } catch (error: any) {
      console.error('❌ createProgressGoal error:', error);
      throw new Error(error.message);
    }
  }

  // Get progress goals for client
  static async getProgressGoals(clientId: string): Promise<ProgressGoal[]> {
    try {
      console.log('📊 Getting progress goals for client:', clientId);
      
      const response = await AppwriteDatabaseService.getProgressGoals(clientId);
      
      const goals: ProgressGoal[] = response.documents.map((doc: any) => ({
        id: doc.$id,
        client_id: doc.client_id,
        goal_type: doc.goal_type,
        title: doc.title,
        description: doc.description,
        target_value: doc.target_value,
        current_value: doc.current_value,
        unit: doc.unit,
        target_date: doc.target_date,
        is_achieved: doc.is_achieved,
        progress_updates: doc.progress_updates || [],
        created_at: doc.created_at,
        updated_at: doc.updated_at
      }));
      
      console.log('✅ Retrieved', goals.length, 'progress goals');
      return goals;
    } catch (error: any) {
      console.error('❌ getProgressGoals error:', error);
      throw new Error(error.message);
    }
  }

  // Update progress goal
  static async updateProgressGoal(goalId: string, currentValue: number): Promise<ProgressGoal> {
    try {
      console.log('📈 Updating progress goal:', goalId, 'to', currentValue);
      
      // This would update in Appwrite database
      // For now, just log it
             const updatedGoal: ProgressGoal = {
         id: goalId,
         client_id: 'user-pierino',
         title: 'Perdere 5kg',
         description: 'Obiettivo di perdita peso',
         goal_type: 'weight_loss',
         current_value: currentValue,
         target_value: 70,
         unit: 'kg',
         target_date: '2025-06-01',
         is_achieved: currentValue <= 70,
         progress_updates: [],
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString()
       };
      
      console.log('✅ Progress goal updated successfully');
      return updatedGoal;
    } catch (error: any) {
      console.error('❌ updateProgressGoal error:', error);
      throw new Error(error.message);
    }
  }

  // Get progress summary
  static async getProgressSummary(clientId: string): Promise<{
    goals: {
      total: number;
      active: number;
      achieved: number;
      achievement_rate: number;
    };
    body_metrics: {
      current_weight: number;
      weight_change: number;
      recent_bmi: number;
      last_recorded: string;
    };
    recent_goals: ProgressGoal[];
    recent_achievements: ProgressGoal[];
  }> {
    try {
      console.log('📊 Getting progress summary for client:', clientId);
      
      const goals = await this.getProgressGoals(clientId);
      const activeGoals = goals.filter(goal => !goal.is_achieved);
      const achievedGoals = goals.filter(goal => goal.is_achieved);
      
      const summary = {
        goals: {
          total: goals.length,
          active: activeGoals.length,
          achieved: achievedGoals.length,
          achievement_rate: goals.length > 0 ? (achievedGoals.length / goals.length) * 100 : 0
        },
        body_metrics: {
          current_weight: 72,
          weight_change: -3,
          recent_bmi: 22.4,
          last_recorded: new Date().toISOString()
        },
        recent_goals: activeGoals.slice(0, 3),
        recent_achievements: achievedGoals.slice(0, 3)
      };
      
      console.log('✅ Progress summary retrieved');
      return summary;
    } catch (error: any) {
      console.error('❌ getProgressSummary error:', error);
      throw new Error(error.message);
    }
  }

  // Get progress chart data
  static async getProgressChartData(clientId: string, filter: 'days' | 'weeks' | 'months' = 'weeks'): Promise<{
    labels: string[];
    data: number[];
    target: number[];
  }> {
    try {
      console.log('📈 Getting progress chart data for client:', clientId, 'filter:', filter);
      
      // Mock chart data
      const chartData = {
        labels: ['Sett 1', 'Sett 2', 'Sett 3', 'Sett 4'],
        data: [75, 74, 73, 72],
        target: [75, 74, 73, 72]
      };
      
      console.log('✅ Progress chart data retrieved');
      return chartData;
    } catch (error: any) {
      console.error('❌ getProgressChartData error:', error);
      throw new Error(error.message);
    }
  }

  // Create before/after progress entry
  static async createBeforeAfterEntry(entryData: {
    client_id: string;
    goal_id: string;
    before_image_url?: string;
    after_image_url?: string;
    before_value: number;
    after_value: number;
    notes?: string;
  }): Promise<void> {
    try {
      console.log('📸 Creating before/after entry for goal:', entryData.goal_id);
      
      // This would save to Appwrite database
      // For now, just log it
      console.log('✅ Before/after entry created:', entryData);
    } catch (error: any) {
      console.error('❌ createBeforeAfterEntry error:', error);
      throw new Error(error.message);
    }
  }

  // Get before/after entries
  static async getBeforeAfterEntries(clientId: string): Promise<any[]> {
    try {
      console.log('📸 Getting before/after entries for client:', clientId);
      
      // Mock data
      const entries = [
        {
          id: 'entry-1',
          client_id: clientId,
          goal_id: 'goal-1',
          before_image_url: 'https://example.com/before.jpg',
          after_image_url: 'https://example.com/after.jpg',
          before_value: 75,
          after_value: 72,
          notes: 'Progresso dopo 4 settimane',
          created_at: new Date().toISOString()
        }
      ];
      
      console.log('✅ Retrieved', entries.length, 'before/after entries');
      return entries;
    } catch (error: any) {
      console.error('❌ getBeforeAfterEntries error:', error);
      return [];
    }
  }
}