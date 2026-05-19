import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  try {
    // Check if the request is an HTTP POST from a Webhook
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const payload = await req.json()
    
    // Validate Webhook payload
    if (!payload || !payload.record) {
       return new Response('Invalid payload', { status: 400 })
    }

    const { type, record } = payload

    // Example logic for processing a new notification insert
    if (type === 'INSERT' && record.user_id) {
        // Fetch user's push token from profiles or devices table
        const { data: profile } = await supabase
            .from('profiles')
            .select('push_token')
            .eq('id', record.user_id)
            .single()

        if (profile?.push_token) {
            // Call FCM / APNS / OneSignal / Firebase API to send notification
            console.log(`Sending push notification to token ${profile.push_token} for user ${record.user_id}`)
            console.log(`Message: ${record.message}`)
            
            // Example POST request to Firebase Cloud Messaging:
            /*
            await fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`
                },
                body: JSON.stringify({
                    to: profile.push_token,
                    notification: {
                        title: record.title || 'New Notification',
                        body: record.message
                    }
                })
            })
            */
        }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
