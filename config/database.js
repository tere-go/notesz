// Database configuration
// Replace these with your actual Supabase credentials
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All env vars starting with SUPABASE:', Object.keys(process.env).filter(key => key.startsWith('SUPABASE')));
console.log('SUPABASE_URL from env:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY from env:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');

const SUPABASE_URL = process.env.SUPABASE_URL || 'your_supabase_project_url';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key';

console.log('Final values:');
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Set' : 'Not set');

module.exports = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY
};
