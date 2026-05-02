const { adminClient } = require('../lib/supabase');
const { randomUUID } = require('crypto');

/**
 * Centralized Notification Service
 * Handles both in-app database records and Push Notification hooks.
 */
class NotificationService {
    /**
     * Sends a notification to one or more users
     */
    static async notify(params) {
        const { userIds, organizationId, title, message } = params;

        if (!userIds || userIds.length === 0) return;

        try {
            const sb = adminClient;

            // 1. Create DB records for in-app history
            const records = userIds.map((uid) => ({
                id: `ntf_${randomUUID()}`,
                user_id: uid,
                organization_id: organizationId,
                title,
                message,
                is_read: false
            }));

            const { error: insErr } = await sb
                .from('notifications')
                .insert(records);

            if (insErr) throw insErr;

            // 2. Trigger Push Notifications (Hooks)
            const { data: profiles, error: profErr } = await sb
                .from('profiles')
                .select('fcm_token')
                .in('id', userIds)
                .not('fcm_token', 'is', null);

            if (profErr) throw profErr;

            const tokens = profiles.map(r => r.fcm_token);
            if (tokens.length > 0) {
                this._sendPushNotifications(tokens, title, message);
            }

            console.log(`[NotificationService] Notified ${userIds.length} users: "${title}"`);
        } catch (error) {
            console.error('[NotificationService] Error:', error);
        }
    }

    /**
     * PRIVATE: Logic to call FCM or similar service
     */
    static async _sendPushNotifications(tokens, title, message) {
        console.log(`[PUSH HOOK] Sending real-time alert to ${tokens.length} devices:`);
        tokens.forEach(token => {
            console.log(`  -> Token: ${token.substring(0, 10)}... | Body: ${title}`);
        });
    }
}

module.exports = NotificationService;
