import { supabase } from '../services/supabase';

export async function fixMissingUserProfiles() {
  console.log('🔧 Starting user profile fix...');
  
  try {
    // Lista email che devono essere sistemate
    const emailsToFix = [
      'itsilorenz07@gmail.com',
      'loerstudio0@gmail.com',
      'coach@spc.com'
    ];
    
    for (const email of emailsToFix) {
      console.log(`📧 Checking ${email}...`);
      
      // Controlla se esiste in public.users
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (profileError && !userProfile) {
        console.log(`➕ Creating profile for ${email}`);
        
        // Determina il ruolo
        let role = 'client';
        let firstName = email.split('@')[0];
        
        if (email === 'loerstudio0@gmail.com' || email === 'coach@spc.com') {
          role = 'coach';
          firstName = 'Coach';
        } else if (email === 'itsilorenz07@gmail.com') {
          firstName = 'Lorenzo';
        }
        
        // Genera un UUID per l'utente (temporaneo, sarà sostituito dal vero ID auth)
        const tempId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Crea il profilo
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: tempId,
            email: email,
            first_name: firstName,
            last_name: role === 'coach' ? 'SPC' : '',
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (insertError) {
          console.error(`❌ Error creating profile for ${email}:`, insertError);
        } else {
          console.log(`✅ Profile created for ${email}`);
          
          // Se è un cliente, crea anche il record in clients
          if (role === 'client') {
            // Trova un coach (prendi il primo disponibile)
            const { data: coaches } = await supabase
              .from('users')
              .select('id')
              .eq('role', 'coach')
              .limit(1);
            
            if (coaches && coaches.length > 0) {
              await supabase
                .from('clients')
                .insert({
                  user_id: tempId,
                  coach_id: coaches[0].id,
                  has_nutrition_plan: false,
                  subscription_type: 'basic',
                });
              console.log(`✅ Client relationship created`);
            }
          }
        }
      } else {
        console.log(`✅ ${email} already has a profile`);
      }
    }
    
    console.log('🎉 Fix completed!');
    return true;
  } catch (error) {
    console.error('❌ Fix failed:', error);
    return false;
  }
}

// Alternative approach using direct auth user lookup
export async function fixUserProfilesAdvanced() {
  console.log('🔧 Starting advanced user profile fix...');
  
  try {
    // Get current auth user first
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser) {
      console.log('📧 Fixing current user:', currentUser.email);
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('email', currentUser.email)
        .single();
      
      if (!existingProfile) {
        console.log('➕ Creating profile for current user');
        
        // Determine role based on email
        let role = 'client';
        let firstName = currentUser.email?.split('@')[0] || 'User';
        
        if (currentUser.email === 'loerstudio0@gmail.com' || currentUser.email === 'coach@spc.com') {
          role = 'coach';
          firstName = 'Coach';
        } else if (currentUser.email === 'itsilorenz07@gmail.com') {
          firstName = 'Lorenzo';
        }
        
        // Create profile with actual auth user ID
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: currentUser.id, // Use real auth user ID
            email: currentUser.email,
            first_name: firstName,
            last_name: role === 'coach' ? 'SPC' : '',
            role: role,
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (insertError) {
          console.error('❌ Error creating profile:', insertError);
          return false;
        } else {
          console.log('✅ Profile created successfully');
          return true;
        }
      } else {
        console.log('✅ Profile already exists');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Advanced fix failed:', error);
    return false;
  }
}