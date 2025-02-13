const { supabase } = require('../utils/supabase');

async function createMissingCompanies() {
  // Get all company-type users without companies
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('type', 'company')
    .is('company_id', null);

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
    return;
  }

  for (const profile of profiles) {
    // Create company for each user
    const { error: companyError } = await supabase
      .from('companies')
      .insert([
        {
          id: profile.user_id,
          created_at: new Date().toISOString()
        }
      ]);

    if (companyError) {
      console.error('Error creating company:', companyError);
      continue;
    }

    // Update user profile with company_id
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ company_id: profile.user_id })
      .eq('user_id', profile.user_id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    }
  }
}

// Run the migration
createMissingCompanies(); 