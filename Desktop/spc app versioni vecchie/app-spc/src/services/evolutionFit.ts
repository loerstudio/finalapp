import { Exercise } from '../types';

// Evolution Fit API configuration
const EVOLUTION_FIT_API_URL = 'https://api.evolution-fit.com/v1';

export class EvolutionFitService {
  // Get exercises from Evolution Fit API
  static async getExercises(): Promise<Exercise[]> {
    try {
      console.log('🏋️ Fetching exercises from Evolution Fit...');
      
      // This would be a real API call to Evolution Fit
      // For now, we'll return a comprehensive list of exercises
      const exercises: Exercise[] = [
        {
          id: 'ex-1',
          name: 'Push-up',
          description: 'Classic bodyweight push-up exercise',
          muscle_groups: ['Chest', 'Triceps', 'Shoulders'],
          equipment: ['Bodyweight'],
          difficulty_level: 'beginner',
          video_url: 'https://evolution-fit.com/exercises/push-up.mp4',
          evolution_fit_id: 'push-up-001',
          instructions: [
            'Start in a plank position with hands shoulder-width apart',
            'Lower your body until chest nearly touches the ground',
            'Push back up to starting position',
            'Keep your core tight throughout the movement'
          ],
          tips: [
            'Keep your body in a straight line',
            'Don\'t let your hips sag',
            'Breathe steadily throughout the exercise'
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'ex-2',
          name: 'Squat',
          description: 'Bodyweight squat exercise',
          muscle_groups: ['Legs', 'Glutes', 'Core'],
          equipment: ['Bodyweight'],
          difficulty_level: 'beginner',
          video_url: 'https://evolution-fit.com/exercises/squat.mp4',
          evolution_fit_id: 'squat-001',
          instructions: [
            'Stand with feet shoulder-width apart',
            'Lower your body as if sitting back into a chair',
            'Keep your chest up and knees behind toes',
            'Return to standing position'
          ],
          tips: [
            'Keep your weight in your heels',
            'Don\'t let your knees cave inward',
            'Go as deep as your mobility allows'
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'ex-3',
          name: 'Pull-up',
          description: 'Upper body pulling exercise',
          muscle_groups: ['Back', 'Biceps', 'Shoulders'],
          equipment: ['Pull-up bar'],
          difficulty_level: 'intermediate',
          video_url: 'https://evolution-fit.com/exercises/pull-up.mp4',
          evolution_fit_id: 'pull-up-001',
          instructions: [
            'Hang from pull-up bar with hands shoulder-width apart',
            'Pull your body up until chin clears the bar',
            'Lower back down with control',
            'Repeat for desired number of reps'
          ],
          tips: [
            'Engage your back muscles, not just arms',
            'Avoid swinging or kipping',
            'Full range of motion is important'
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'ex-4',
          name: 'Deadlift',
          description: 'Compound lower body exercise',
          muscle_groups: ['Legs', 'Back', 'Core'],
          equipment: ['Barbell', 'Weight plates'],
          difficulty_level: 'intermediate',
          video_url: 'https://evolution-fit.com/exercises/deadlift.mp4',
          evolution_fit_id: 'deadlift-001',
          instructions: [
            'Stand with feet hip-width apart, bar over mid-foot',
            'Bend at hips and knees to grip the bar',
            'Keep back straight and lift bar by extending hips and knees',
            'Lower bar back to ground with control'
          ],
          tips: [
            'Keep the bar close to your body',
            'Don\'t round your back',
            'Drive through your heels'
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'ex-5',
          name: 'Bench Press',
          description: 'Compound chest exercise',
          muscle_groups: ['Chest', 'Triceps', 'Shoulders'],
          equipment: ['Barbell', 'Bench'],
          difficulty_level: 'intermediate',
          video_url: 'https://evolution-fit.com/exercises/bench-press.mp4',
          evolution_fit_id: 'bench-press-001',
          instructions: [
            'Lie on bench with feet flat on ground',
            'Grip bar slightly wider than shoulder-width',
            'Lower bar to chest with control',
            'Press bar back up to starting position'
          ],
          tips: [
            'Keep your shoulder blades retracted',
            'Don\'t bounce the bar off your chest',
            'Maintain proper breathing pattern'
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      console.log('✅ Retrieved', exercises.length, 'exercises from Evolution Fit');
      return exercises;
    } catch (error: any) {
      console.error('❌ getExercises error:', error);
      throw new Error('Failed to fetch exercises from Evolution Fit');
    }
  }

  // Get exercises by muscle group
  static async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    try {
      console.log('🏋️ Fetching exercises for muscle group:', muscleGroup);
      
      const allExercises = await this.getExercises();
      const filteredExercises = allExercises.filter(exercise => 
        exercise.muscle_groups.some(group => 
          group.toLowerCase().includes(muscleGroup.toLowerCase())
        )
      );
      
      console.log('✅ Retrieved', filteredExercises.length, 'exercises for', muscleGroup);
      return filteredExercises;
    } catch (error: any) {
      console.error('❌ getExercisesByMuscleGroup error:', error);
      throw new Error(error.message);
    }
  }

  // Get exercises by difficulty level
  static async getExercisesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<Exercise[]> {
    try {
      console.log('🏋️ Fetching exercises for difficulty level:', difficulty);
      
      const allExercises = await this.getExercises();
      const filteredExercises = allExercises.filter(exercise => 
        exercise.difficulty_level === difficulty
      );
      
      console.log('✅ Retrieved', filteredExercises.length, 'exercises for difficulty:', difficulty);
      return filteredExercises;
    } catch (error: any) {
      console.error('❌ getExercisesByDifficulty error:', error);
      throw new Error(error.message);
    }
  }

  // Search exercises by name
  static async searchExercises(query: string): Promise<Exercise[]> {
    try {
      console.log('🔍 Searching exercises for:', query);
      
      const allExercises = await this.getExercises();
      const filteredExercises = allExercises.filter(exercise => 
        exercise.name.toLowerCase().includes(query.toLowerCase()) ||
        exercise.description.toLowerCase().includes(query.toLowerCase())
      );
      
      console.log('✅ Found', filteredExercises.length, 'exercises matching:', query);
      return filteredExercises;
    } catch (error: any) {
      console.error('❌ searchExercises error:', error);
      throw new Error(error.message);
    }
  }

  // Get exercise details by ID
  static async getExerciseById(exerciseId: string): Promise<Exercise | null> {
    try {
      console.log('🔍 Getting exercise details for:', exerciseId);
      
      const allExercises = await this.getExercises();
      const exercise = allExercises.find(ex => ex.id === exerciseId);
      
      if (exercise) {
        console.log('✅ Found exercise:', exercise.name);
        return exercise;
      } else {
        console.log('❌ Exercise not found:', exerciseId);
        return null;
      }
    } catch (error: any) {
      console.error('❌ getExerciseById error:', error);
      throw new Error(error.message);
    }
  }

  // Get exercise video URL
  static getExerciseVideoUrl(exerciseId: string): string {
    // This would return the actual video URL from Evolution Fit
    return `https://evolution-fit.com/exercises/${exerciseId}.mp4`;
  }
}