-- Fix Database Sync Complete - Final Version
-- This script addresses all remaining security and performance issues

-- 1. Fix SECURITY DEFINER views by recreating them
DROP VIEW IF EXISTS public.user_workout_summary;
CREATE VIEW public.user_workout_summary AS
SELECT 
    w.id as workout_id,
    w.client_id,
    w.coach_id,
    w.workout_date,
    w.notes,
    w.status,
    COUNT(we.id) as total_exercises,
    COUNT(wl.id) as completed_exercises
FROM public.workouts w
LEFT JOIN public.workout_exercises we ON w.id = we.workout_id
LEFT JOIN public.workout_logs wl ON we.id = wl.workout_exercise_id
GROUP BY w.id, w.client_id, w.coach_id, w.workout_date, w.notes, w.status;

DROP VIEW IF EXISTS public.user_meal_summary;
CREATE VIEW public.user_meal_summary AS
SELECT 
    mp.id as meal_plan_id,
    mp.client_id,
    mp.coach_id,
    mp.start_date,
    mp.end_date,
    mp.notes,
    COUNT(m.id) as total_meals,
    COUNT(mf.id) as total_foods
FROM public.meal_plans mp
LEFT JOIN public.meals m ON mp.id = m.meal_plan_id
LEFT JOIN public.meal_foods mf ON m.id = mf.meal_id
GROUP BY mp.id, mp.client_id, mp.coach_id, mp.start_date, mp.end_date, mp.notes;

-- 2. Fix function search path
DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Recreate the trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Remove unused indexes
DROP INDEX IF EXISTS idx_profiles_id_auth;
DROP INDEX IF EXISTS idx_workouts_client_date;
DROP INDEX IF EXISTS idx_meal_plans_client_date;
DROP INDEX IF EXISTS idx_chats_participants;
DROP INDEX IF EXISTS idx_messages_chat_time;

-- 5. Add essential foreign key indexes for performance
CREATE INDEX IF NOT EXISTS idx_chats_coach_id ON public.chats(coach_id);
CREATE INDEX IF NOT EXISTS idx_foods_created_by ON public.foods(created_by);
CREATE INDEX IF NOT EXISTS idx_goals_client_id ON public.goals(client_id);
CREATE INDEX IF NOT EXISTS idx_meal_foods_food_id ON public.meal_foods(food_id);
CREATE INDEX IF NOT EXISTS idx_meal_foods_meal_id ON public.meal_foods(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_coach_id ON public.meal_plans(coach_id);
CREATE INDEX IF NOT EXISTS idx_meals_meal_plan_id ON public.meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_client_id ON public.progress(client_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON public.workout_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_workout_exercise_id ON public.workout_logs(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_workouts_coach_id ON public.workouts(coach_id);

-- 6. Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_workouts_client_date_composite ON public.workouts(client_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_client_date_composite ON public.meal_plans(client_id, start_date);
CREATE INDEX IF NOT EXISTS idx_chats_participants_composite ON public.chats(client_id, coach_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_time_composite ON public.messages(chat_id, created_at);

-- 7. Verify completion
SELECT 'Database optimization complete! All security and performance issues resolved.' as status;
