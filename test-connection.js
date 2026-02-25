import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'  // if you use .env, otherwise hardcode the values

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignUp() {
    const { data, error } = await supabase.auth.signUp({
        email: 'test-node@example.com',
        password: 'password123',
        options: {
            data: { full_name: 'Node Test' }
        }
    })
    if (error) {
        console.error('Sign up error:', error)
    } else {
        console.log('Sign up success:', data)
    }
}

testSignUp()