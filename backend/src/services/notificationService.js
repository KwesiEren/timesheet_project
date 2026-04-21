const pool = require('../db');
const { randomUUID } = require('crypto');

/**
 * Centralized Notification Service
 * Handles both in-app database records and Push Notification hooks.
 */
class NotificationService {
    /**
     * Sends a notification to one or more users
     * @param {Object} params
     * @param {string[]} params.userIds - Array of user IDs to notify
     * @param {string} params.organizationId - The organization context
     * @param {string} params.title - Notification title
     * @param {string} params.message - Notification body
     */
    static async notify(params) {
        const { userIds, organizationId, title, message } = params;

        if (!userIds || userIds.length === 0) return;

        try {
            // 1. Create DB records for in-app history
            const values = userIds.map((uid) => {
                return `('\${randomUUID()}', '\${uid}', '\${organizationId}', '\${title}', '\${message.replace(/'/g, "''")}')`;
            });

            const query = `
                INSERT INTO notifications (id, user_id, organization_id, title, message)
                VALUES \${values.join(',')}
            `;

            await pool.query(query);

            // 2. Trigger Push Notifications (Hooks)
            // We fetch the FCM tokens for these users
            const tokenResult = await pool.query(
                'SELECT fcm_token FROM users WHERE id = ANY($1) AND fcm_token IS NOT NULL',
                [userIds]
            );

            const tokens = tokenResult.rows.map(r => r.fcm_token);
            if (tokens.length > 0) {
                this._sendPushNotifications(tokens, title, message);
            }

            console.log(`[NotificationService] Notified \${userIds.length} users: "\${title}"`);
        } catch (error) {
            console.error('[NotificationService] Error:', error);
        }
    }

    /**
     * PRIVATE: Logic to call FCM or similar service
     */
    static async _sendPushNotifications(tokens, title, message) {
        // This is where you would integrate the 'firebase-admin' SDK
        // For Phase 4, we provide the log hook as requested.
        console.log(`[PUSH HOOK] Sending real-time alert to \${tokens.length} devices:`);
        tokens.forEach(token => {
            console.log(`  -> Token: \${token.substring(0, 10)}... | Body: \${title}`);
        });
    }
}

module.exports = NotificationService;
