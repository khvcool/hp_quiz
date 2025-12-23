import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdxskuwclyfnioqbpkck.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keHNrdXdjbHlmbmlvcWJwa2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NjE3OTAsImV4cCI6MjA4MjAzNzc5MH0.V4Xd-xXN-uHRLFI4ctzgwKpV1flYRrQN0WkRHdyuklk';

export const supabase = createClient(supabaseUrl, supabaseKey);