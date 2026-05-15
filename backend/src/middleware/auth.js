const jwt = require('jsonwebtoken');
const { adminClient } = require('../lib/supabase');

function attachAuthContext(req, token, userId, email, role) {
    req.auth = {
        token,
        userId,
        email: email || null,
        role: role || 'authenticated',
    };

    req.orgId = req.headers['x-organization-id'] || null;

    // Backward compatibility for older handlers
    req.user = {
        id: userId,
        email: email || null,
        organizationId: req.orgId,
        role: role || 'authenticated',
    };
}

/**
 * Middleware to verify Supabase JWT
 */
async function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'missing_token', message: 'Authentication token is required' });
    }

    try {
        // Fast path: local JWT verification (when server has correct JWT secret)
        if (process.env.SUPABASE_JWT_SECRET) {
            try {
                const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
                if (payload?.sub) {
                    attachAuthContext(req, token, payload.sub, payload.email, payload.role);
                    return next();
                }
            } catch (_) {
                // Fallback below handles rotated/remote key setups.
            }
        }

        // Fallback: authoritative verification against Supabase Auth API.
        const { data, error } = await adminClient.auth.getUser(token);
        if (error || !data?.user?.id) {
            return res.status(401).json({ error: 'invalid_token', message: 'Token is invalid or expired' });
        }

        attachAuthContext(req, token, data.user.id, data.user.email, 'authenticated');
        return next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        return res.status(401).json({ error: 'invalid_token', message: 'Token is invalid or expired' });
    }
}

module.exports = { requireAuth, authenticateToken: requireAuth };
