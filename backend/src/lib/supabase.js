const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// (A) For acting AS THE USER. Honors Row Level Security (RLS).
// Use this for 99% of requests coming from the frontend.
function userClient(accessToken) {
    if (!accessToken) throw new Error('Access token is required for userClient');
    
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer \${accessToken}`,
                },
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    );
}

// (B) Service-role client. BYPASSES RLS.
// Only for trusted server logic (cron jobs, admin actions, etc.)
const adminClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    }
);

module.exports = { userClient, adminClient };
